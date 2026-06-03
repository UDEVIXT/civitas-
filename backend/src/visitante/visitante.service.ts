/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitanteDto } from './dto/create-visitante.dto';
import { UpdateVisitanteDto } from './dto/update-visitante.dto';
import { UpdateEstadoQrDto } from './dto/update-estado-qr.dto';
import 'multer';
import { ArchivosService } from '../r2-module/archivos.service';
import { randomBytes } from 'crypto';

@Injectable()
export class VisitanteService {
  constructor(
    private prisma: PrismaService,
    private readonly archivosService: ArchivosService,
  ) {}

  private generarTokenQr(): string {
    return `qr_${randomBytes(32).toString('base64url')}`;
  }

  private async generarCodigoQrUnico(prisma: any = this.prisma) {
    for (let intento = 0; intento < 5; intento += 1) {
      const codigoQr = this.generarTokenQr();
      const existe = await prisma.acceso.findUnique({
        where: { codigo_qr: codigoQr },
        select: { id_acceso: true },
      });

      if (!existe) return codigoQr;
    }

    throw new InternalServerErrorException(
      'No fue posible generar un QR unico.',
    );
  }

  private obtenerFechasAcceso(
    fechaInicio?: string | Date,
    fechaFin?: string | Date,
  ) {
    const inicio = fechaInicio ? new Date(fechaInicio) : new Date();
    const fin = fechaFin
      ? new Date(fechaFin)
      : new Date(inicio.getTime() + 24 * 60 * 60 * 1000);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
      throw new BadRequestException('Las fechas del acceso no son validas.');
    }

    if (fin <= inicio) {
      throw new BadRequestException(
        'La fecha de expiracion debe ser posterior a la fecha de inicio.',
      );
    }

    return { inicio, fin };
  }

  private calcularEstadoQr(acceso: {
    codigo_qr: string | null;
    fecha_expiracion: Date;
    estatus: 'Activo' | 'Inactivo';
  }) {
    if (new Date(acceso.fecha_expiracion) < new Date()) return 'EXPIRADO';
    if (acceso.estatus !== 'Activo') return 'INACTIVO';
    return acceso.codigo_qr ? 'ACTIVO' : 'PENDIENTE_GENERACION';
  }

  async create(
    createVisitanteDto: CreateVisitanteDto,
    id_usuario: string,
    file?: Express.Multer.File,
  ) {
    const dataVisitante = createVisitanteDto;

    //Obtenemos el ID del residente asociado al usuario que hace la petición
    const residente = await this.prisma.residente.findFirst({
      where: { id_usuario: id_usuario },
      select: { id_residente: true },
    });

    if (!residente) {
      throw new NotFoundException('Residente not found for the given user ID');
    }

    //Validamos si fecha_fin es undefined, entonces será igual a la fecha de inicio (acceso de una sola ocasión)
    const fechaExpiracion =
      dataVisitante.fecha_fin || dataVisitante.fecha_inicio;

    //Subimos la imagen a R2 y obtenemos la URL (si se mandó la imagen desde el front)
    const urlImagen = file
      ? await this.archivosService.subirImagen(file, 'visitantes')
      : null;

    // Registramos al visitante con su primer acceso QR para mostrarlo en el modal de exito.
    const visitante = await this.prisma.$transaction(async (prisma) => {
      try {
        const codigoQr = await this.generarCodigoQrUnico(prisma);
        const visitante = await prisma.visitante.create({
          data: {
            nombre: dataVisitante.nombre,
            es_frecuente: dataVisitante.es_frecuente,
            telefono: dataVisitante.telefono,
            tipo_vehiculo: dataVisitante.tipo_vehiculo,
            motivo: dataVisitante.tipo_visitante,
            url_imagen: urlImagen,
            residente: {
              connect: { id_residente: residente.id_residente },
            },
            accesos: {
              create: {
                id_usuario: id_usuario,
                estatus: 'Activo',
                codigo_qr: codigoQr,
                fecha_creacion: dataVisitante.fecha_inicio,
                fecha_expiracion: fechaExpiracion,
              },
            },
          },
          include: {
            accesos: {
              select: {
                id_acceso: true,
                codigo_qr: true,
                fecha_creacion: true,
                fecha_expiracion: true,
                estatus: true,
              },
            },
          },
        });
        return visitante;
      } catch (error) {
        console.error('Error creating visitante:', error);
        throw new InternalServerErrorException('Failed to create visitante');
      }
    });

    const accesoCreado = visitante.accesos[0];

    const bitacoraAcceso = await this.prisma.bitacora.create({
      data: {
        id_acceso: accesoCreado.id_acceso,
        fecha_hora_entrada: accesoCreado.fecha_creacion,
        comentario: 'Registro de visitante inicial',
      },
    });

    return visitante;
  }

  async generarQrParaVisita(
    idAcceso: string,
    idUsuario: string,
    fechas?: { fecha_inicio?: string; fecha_fin?: string },
  ) {
    const acceso = await this.prisma.acceso.findUnique({
      where: { id_acceso: idAcceso },
      include: {
        visitante: {
          include: {
            residente: {
              select: {
                id_usuario: true,
                vivienda: { select: { numero_vivienda: true } },
              },
            },
          },
        },
      },
    });

    if (!acceso || !acceso.visitante) {
      throw new NotFoundException('Visita no encontrada.');
    }

    return this.generarQrParaVisitante(
      acceso.visitante.id_visitante,
      idUsuario,
      fechas,
    );
  }

  async generarQrParaVisitante(
    idVisitante: string,
    idUsuario: string,
    fechas?: { fecha_inicio?: string; fecha_fin?: string },
  ) {
    const visitante = await this.prisma.visitante.findUnique({
      where: { id_visitante: idVisitante },
      include: {
        residente: {
          select: {
            id_usuario: true,
            vivienda: { select: { numero_vivienda: true } },
          },
        },
        accesos: {
          orderBy: { fecha_creacion: 'desc' },
          take: 1,
        },
      },
    });

    if (!visitante) {
      throw new NotFoundException('Visitante no encontrado.');
    }

    if (visitante.residente.id_usuario !== idUsuario) {
      throw new ForbiddenException('No tienes permiso para generar este QR.');
    }

    const camposFaltantes: string[] = [];
    if (!visitante.nombre) camposFaltantes.push('nombre');
    if (!visitante.motivo) camposFaltantes.push('tipo de visitante');

    if (camposFaltantes.length > 0) {
      throw new BadRequestException({
        message: 'No se puede generar el QR: faltan datos requeridos.',
        campos: camposFaltantes,
      });
    }

    const ultimoAcceso = visitante.accesos[0];
    const estadoUltimoQr = ultimoAcceso
      ? this.calcularEstadoQr(ultimoAcceso)
      : 'PENDIENTE_GENERACION';

    if (ultimoAcceso && estadoUltimoQr === 'ACTIVO') {
      return {
        success: true,
        message: 'El visitante ya tiene un QR activo.',
        data: {
          id_acceso: ultimoAcceso.id_acceso,
          id_visitante: visitante.id_visitante,
          codigo_qr: ultimoAcceso.codigo_qr,
          estado_qr: estadoUltimoQr,
          fecha_visita: ultimoAcceso.fecha_creacion,
          fecha_expiracion: ultimoAcceso.fecha_expiracion,
        },
      };
    }

    try {
      return await this.prisma.$transaction(async (prisma) => {
        if (ultimoAcceso && estadoUltimoQr === 'EXPIRADO') {
          await prisma.acceso.update({
            where: { id_acceso: ultimoAcceso.id_acceso },
            data: { estatus: 'Inactivo' },
          });
        }

        const { inicio, fin } = this.obtenerFechasAcceso(
          fechas?.fecha_inicio,
          fechas?.fecha_fin,
        );
        const codigoQr = await this.generarCodigoQrUnico(prisma);
        const nuevoAcceso = await prisma.acceso.create({
          data: {
            id_usuario: idUsuario,
            id_visitante: visitante.id_visitante,
            codigo_qr: codigoQr,
            fecha_creacion: inicio,
            fecha_expiracion: fin,
            estatus: 'Activo',
          },
          select: {
            id_acceso: true,
            id_visitante: true,
            codigo_qr: true,
            fecha_creacion: true,
            fecha_expiracion: true,
            estatus: true,
          },
        });

        return {
          success: true,
          message: 'QR generado correctamente.',
          data: {
            ...nuevoAcceso,
            estado_qr: this.calcularEstadoQr(nuevoAcceso),
          },
        };
      });
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error tecnico al generar el QR.');
    }
  }

  async obtenerDetalleVisita(
    idAcceso: string,
    requestedBy: { userId: string; role: string },
  ) {
    const acceso = await this.prisma.acceso.findUnique({
      where: { id_acceso: idAcceso },
      include: {
        visitante: {
          include: {
            residente: {
              select: {
                id_usuario: true,
                vivienda: { select: { numero_vivienda: true } },
              },
            },
          },
        },
      },
    });

    if (!acceso || !acceso.visitante) {
      throw new NotFoundException('Visita no encontrada.');
    }

    if (
      requestedBy.role === 'Residente' &&
      acceso.visitante.residente.id_usuario !== requestedBy.userId
    ) {
      throw new ForbiddenException('No tienes permiso para ver esta visita.');
    }

    const estadoQr = this.calcularEstadoQr(acceso);
    if (estadoQr === 'EXPIRADO' && acceso.estatus !== 'Inactivo') {
      await this.prisma.acceso.update({
        where: { id_acceso: idAcceso },
        data: { estatus: 'Inactivo' },
      });
    }

    return {
      success: true,
      data: {
        id_acceso: acceso.id_acceso,
        id_visitante: acceso.id_visitante,
        visitante: {
          nombre: acceso.visitante.nombre,
          telefono: acceso.visitante.telefono,
          tipo_visitante: acceso.visitante.motivo,
          tipo_vehiculo: acceso.visitante.tipo_vehiculo,
          es_frecuente: acceso.visitante.es_frecuente,
          url_imagen: acceso.visitante.url_imagen,
        },
        vivienda: acceso.visitante.residente.vivienda.numero_vivienda,
        codigo_qr: acceso.codigo_qr,
        estado_qr: estadoQr,
        fecha_visita: acceso.fecha_creacion,
        fecha_expiracion: acceso.fecha_expiracion,
        estatus: estadoQr === 'EXPIRADO' ? 'Inactivo' : acceso.estatus,
      },
    };
  }

  async consultarQr(codigoQr: string) {
    const acceso = await this.prisma.acceso.findUnique({
      where: { codigo_qr: codigoQr },
      include: {
        visitante: {
          include: {
            residente: {
              select: {
                vivienda: { select: { numero_vivienda: true } },
              },
            },
          },
        },
      },
    });

    if (!acceso || !acceso.visitante) {
      throw new NotFoundException('QR no encontrado.');
    }

    const estadoQr = this.calcularEstadoQr(acceso);
    if (estadoQr === 'EXPIRADO' && acceso.estatus !== 'Inactivo') {
      await this.prisma.acceso.update({
        where: { id_acceso: acceso.id_acceso },
        data: { estatus: 'Inactivo' },
      });
    }

    return {
      success: true,
      data: {
        valido: estadoQr === 'ACTIVO',
        estado_qr: estadoQr,
        id_acceso: acceso.id_acceso,
        id_visitante: acceso.id_visitante,
        visitante: {
          nombre: acceso.visitante.nombre,
          tipo_visitante: acceso.visitante.motivo,
        },
        vivienda: acceso.visitante.residente.vivienda.numero_vivienda,
        fecha_visita: acceso.fecha_creacion,
        fecha_expiracion: acceso.fecha_expiracion,
      },
    };
  }

  async findAllByResidente(id_usuario: string) {
    const residente = await this.prisma.residente.findFirst({
      where: { id_usuario: id_usuario },
      select: { id_residente: true },
    });

    if (!residente) {
      throw new NotFoundException('Residente not found for the given user ID');
    }

    await this.prisma.acceso.updateMany({
      where: {
        estatus: 'Activo',
        fecha_expiracion: { lt: new Date() },
        visitante: { id_residente: residente.id_residente },
      },
      data: { estatus: 'Inactivo' },
    });

    const visitantes = await this.prisma.visitante.findMany({
      where: { id_residente: residente.id_residente },
      include: {
        accesos: {
          select: {
            id_acceso: true,
            codigo_qr: true,
            fecha_creacion: true,
            fecha_expiracion: true,
            estatus: true,
          },
          orderBy: { fecha_creacion: 'desc' },
          take: 1,
        },
      },
      orderBy: { id_visitante: 'desc' },
    });

    return visitantes.map((visitante) => {
      const ultimoAcceso = visitante.accesos[0];
      const estado_qr = ultimoAcceso
        ? this.calcularEstadoQr(ultimoAcceso)
        : 'PENDIENTE_GENERACION';

      return {
        ...visitante,
        estado_qr,
        puede_generar_qr: estado_qr !== 'ACTIVO',
      };
    });
  }

  async actualizarEstadoQrFrecuente(
    idVisitante: string,
    idUsuario: string,
    updateEstadoQrDto: UpdateEstadoQrDto,
  ) {
    const accion = updateEstadoQrDto.accion;
    const motivo = updateEstadoQrDto.motivo?.trim();

    if (accion === 'deshabilitar' && !motivo) {
      throw new BadRequestException(
        'El motivo es obligatorio para deshabilitar el QR.',
      );
    }

    const visitante = await this.prisma.visitante.findUnique({
      where: { id_visitante: idVisitante },
      include: {
        residente: { select: { id_usuario: true } },
        accesos: {
          orderBy: { fecha_creacion: 'desc' },
          take: 1,
        },
      },
    });

    if (!visitante) {
      throw new NotFoundException('Visitante no encontrado.');
    }

    if (visitante.residente.id_usuario !== idUsuario) {
      throw new ForbiddenException(
        'No tienes permiso para modificar este QR.',
      );
    }

    if (!visitante.es_frecuente) {
      throw new BadRequestException(
        'Solo se puede habilitar o deshabilitar el QR de visitantes frecuentes.',
      );
    }

    const acceso = visitante.accesos[0];

    if (!acceso || !acceso.codigo_qr) {
      throw new BadRequestException(
        'El visitante no tiene un QR asociado para modificar.',
      );
    }

    const estadoActual = this.calcularEstadoQr(acceso);

    if (estadoActual === 'EXPIRADO') {
      if (acceso.estatus !== 'Inactivo') {
        await this.prisma.acceso.update({
          where: { id_acceso: acceso.id_acceso },
          data: { estatus: 'Inactivo' },
        });
      }

      throw new BadRequestException(
        'El QR ya expiro. Genera un nuevo codigo de acceso para volver a usarlo.',
      );
    }

    if (accion === 'deshabilitar' && estadoActual === 'INACTIVO') {
      throw new BadRequestException('El QR ya se encuentra deshabilitado.');
    }

    if (accion === 'habilitar' && estadoActual === 'ACTIVO') {
      throw new BadRequestException('El QR ya se encuentra habilitado.');
    }

    try {
      const estatus = accion === 'habilitar' ? 'Activo' : 'Inactivo';
      const accionBitacora =
        accion === 'habilitar' ? 'HABILITADO' : 'DESHABILITADO';
      const motivoBitacora =
        motivo ||
        (accion === 'habilitar'
          ? 'QR habilitado por el residente.'
          : 'QR deshabilitado por el residente.');

      const resultado = await this.prisma.$transaction(async (prisma) => {
        const accesoActualizado = await prisma.acceso.update({
          where: { id_acceso: acceso.id_acceso },
          data: { estatus },
          select: {
            id_acceso: true,
            id_visitante: true,
            codigo_qr: true,
            fecha_creacion: true,
            fecha_expiracion: true,
            estatus: true,
          },
        });

        await prisma.bitacoraQrVisitante.create({
          data: {
            id_acceso: acceso.id_acceso,
            id_usuario: idUsuario,
            accion: accionBitacora,
            motivo: motivoBitacora,
          },
        });

        return accesoActualizado;
      });

      return {
        success: true,
        message:
          accion === 'habilitar'
            ? 'QR habilitado correctamente.'
            : 'QR deshabilitado correctamente.',
        data: {
          ...resultado,
          id_visitante: visitante.id_visitante,
          estado_qr: this.calcularEstadoQr(resultado),
          accion: accionBitacora,
          motivo: motivoBitacora,
        },
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error tecnico al actualizar el estado del QR.',
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} visitante`;
  }

  update(id: number, updateVisitanteDto: UpdateVisitanteDto) {
    return `This action updates a #${id} visitante`;
  }

  remove(id: number) {
    return `This action removes a #${id} visitante`;
  }
}
