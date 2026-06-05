/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitanteDto } from './dto/create-visitante.dto';
import { UpdateVisitanteDto } from './dto/update-visitante.dto';
import { UpdateEstadoQrDto } from './dto/update-estado-qr.dto';
import 'multer';
import { ArchivosService } from '../r2-module/archivos.service';
import { randomBytes } from 'crypto';

type AccesoLigero = {
  id_acceso: string;
  codigo_qr: string | null;
  fecha_creacion: Date;
  fecha_visita_programada: Date | null;
  fecha_salida_programada: Date | null;
  fecha_expiracion: Date;
  estatus: 'Activo' | 'Inactivo';
};

type VisitanteConAccesos = {
  id_visitante: string;
  nombre: string;
  tipo_visitante?: string | null;
  motivo?: string | null;
  telefono: string | null;
  tipo_vehiculo: string | null;
  es_frecuente: boolean;
  url_imagen: string | null;
  notas_adicionales: string | null;
  residente: { id_usuario: string; vivienda: { numero_vivienda: string } };
  accesos: AccesoLigero[];
};

type VisitanteListadoConAccesos = Omit<VisitanteConAccesos, 'residente'>;

type AccesoDetalle = AccesoLigero & {
  id_visitante: string | null;
  visitante: {
    nombre: string;
    telefono: string | null;
    tipo_visitante?: string | null;
    motivo?: string | null;
    tipo_vehiculo: string | null;
    es_frecuente: boolean;
    url_imagen: string | null;
    residente: { vivienda: { numero_vivienda: string } };
  };
};

@Injectable()
export class VisitanteService {
  constructor(
    private prisma: PrismaService,
    private readonly archivosService: ArchivosService,
  ) {}

  private generarTokenQr(): string {
    return `qr_${randomBytes(32).toString('base64url')}`;
  }

  private async generarCodigoQrUnico(
    prisma: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
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

  private formatearFechaLocal(fecha?: Date | string | null) {
    if (!fecha) return '';

    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return '';

    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    return formatter.format(date);
  }

  private formatearHoraLocal(fecha?: Date | string | null) {
    if (!fecha) return '';

    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return '';

    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Mexico_City',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return formatter.format(date);
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

    // Normalize incoming date/time: prefer `fecha_inicio`; if absent, combine `fecha_visita` + `hora_estimada`
    let fechaInicioDate: Date | null = null;
    if (dataVisitante.fecha_inicio) {
      fechaInicioDate = new Date(dataVisitante.fecha_inicio);
    } else if (dataVisitante.fecha_visita && dataVisitante.hora_estimada) {
      // Combine local date + time into a single Date (interpreted as local time)
      const combined = `${dataVisitante.fecha_visita}T${dataVisitante.hora_estimada}`;
      fechaInicioDate = new Date(combined);
    }

    if (!fechaInicioDate || Number.isNaN(fechaInicioDate.getTime())) {
      throw new BadRequestException(
        'La fecha de inicio de la visita es requerida y debe ser válida.',
      );
    }

    //Obtenemos el ID del residente asociado al usuario que hace la petición
    const residente = await this.prisma.residente.findFirst({
      where: { id_usuario: id_usuario },
      select: { id_residente: true },
    });

    if (!residente) {
      throw new NotFoundException('Residente not found for the given user ID');
    }

    //Validamos si fecha_fin es undefined, entonces será igual a la fecha de inicio (acceso de una sola ocasión)
    const fechaExpiracion = dataVisitante.fecha_fin
      ? new Date(dataVisitante.fecha_fin)
      : fechaInicioDate;

    //Subimos la imagen a R2 y obtenemos la URL (si se mandó la imagen desde el front)
    const urlImagen = file
      ? await this.archivosService.subirImagen(file, 'visitantes')
      : null;

    // Registramos al visitante con su primer acceso QR para mostrarlo en el modal de exito.
    const visitante = await this.prisma.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        try {
          const codigoQr = await this.generarCodigoQrUnico(prisma);
          const visitante = await prisma.visitante.create({
            data: {
              nombre: dataVisitante.nombre,
              es_frecuente: dataVisitante.es_frecuente,
              telefono: dataVisitante.telefono,
              tipo_vehiculo: dataVisitante.tipo_vehiculo,
              tipo_visitante: dataVisitante.tipo_visitante,
              motivo: dataVisitante.motivo,
              notas_adicionales: dataVisitante.notas_adicionales,
              url_imagen: urlImagen,
              residente: {
                connect: { id_residente: residente.id_residente },
              },
              accesos: {
                create: {
                  id_usuario: id_usuario,
                  estatus: 'Activo',
                  codigo_qr: codigoQr,
                  fecha_creacion: fechaInicioDate,
                  fecha_visita_programada: fechaInicioDate,
                  fecha_expiracion: fechaExpiracion,
                  fecha_salida_programada: fechaExpiracion,
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
      },
    );

    const accesosCreado = visitante.accesos as unknown as Array<{
      id_acceso: string;
      fecha_creacion: Date;
    }>;
    const accesoCreado = accesosCreado[0];

    if (!accesoCreado) {
      throw new InternalServerErrorException(
        'No se pudo recuperar el acceso recién creado.',
      );
    }

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
    const visitante = (await this.prisma.visitante.findUnique({
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
    })) as VisitanteConAccesos | null;

    if (!visitante) {
      throw new NotFoundException('Visitante no encontrado.');
    }

    if (visitante.residente.id_usuario !== idUsuario) {
      throw new ForbiddenException('No tienes permiso para generar este QR.');
    }

    const camposFaltantes: string[] = [];
    if (!visitante.nombre) camposFaltantes.push('nombre');
    if (!visitante.tipo_visitante) {
      camposFaltantes.push('tipo de visitante');
    }

    if (camposFaltantes.length > 0) {
      throw new BadRequestException({
        message: 'No se puede generar el QR: faltan datos requeridos.',
        campos: camposFaltantes,
      });
    }

    const ultimoAcceso = visitante.accesos[0] ?? null;
    const estadoUltimoQr = ultimoAcceso
      ? this.calcularEstadoQr(ultimoAcceso)
      : 'PENDIENTE_GENERACION';

    if (ultimoAcceso && estadoUltimoQr === 'ACTIVO') {
      const origenVisita =
        ultimoAcceso.fecha_visita_programada ?? ultimoAcceso.fecha_creacion;
      const origenSalida =
        ultimoAcceso.fecha_salida_programada ?? ultimoAcceso.fecha_expiracion;
      return {
        success: true,
        message: 'El visitante ya tiene un QR activo.',
        data: {
          id_acceso: ultimoAcceso.id_acceso,
          id_visitante: visitante.id_visitante,
          codigo_qr: ultimoAcceso.codigo_qr,
          estado_qr: estadoUltimoQr,
          fecha_visita: this.formatearFechaLocal(origenVisita),
          hora_estimada: this.formatearHoraLocal(origenVisita),
          hora_salida: this.formatearHoraLocal(origenSalida),
          fecha_expiracion: origenSalida,
        },
      };
    }

    try {
      return await this.prisma.$transaction(
        async (prisma: Prisma.TransactionClient) => {
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
              fecha_visita_programada: inicio,
              fecha_expiracion: fin,
              fecha_salida_programada: fin,
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
              fecha_visita: this.formatearFechaLocal(
                nuevoAcceso.fecha_creacion,
              ),
              hora_estimada: this.formatearHoraLocal(
                nuevoAcceso.fecha_creacion,
              ),
              hora_salida: this.formatearHoraLocal(
                nuevoAcceso.fecha_expiracion,
              ),
              estado_qr: this.calcularEstadoQr(nuevoAcceso),
            },
          };
        },
      );
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

    const accesoDetalle = acceso as AccesoDetalle;
    const origenVisita =
      accesoDetalle.fecha_visita_programada ?? accesoDetalle.fecha_creacion;
    const origenSalida =
      accesoDetalle.fecha_salida_programada ?? accesoDetalle.fecha_expiracion;

    return {
      success: true,
      data: {
        id_acceso: acceso.id_acceso,
        id_visitante: acceso.id_visitante,
        visitante: {
          nombre: acceso.visitante.nombre,
          telefono: acceso.visitante.telefono,
          tipo_visitante: accesoDetalle.visitante.tipo_visitante,
          motivo: accesoDetalle.visitante.motivo,
          tipo_vehiculo: accesoDetalle.visitante.tipo_vehiculo,
          es_frecuente: accesoDetalle.visitante.es_frecuente,
          url_imagen: accesoDetalle.visitante.url_imagen,
        },
        vivienda: accesoDetalle.visitante.residente.vivienda.numero_vivienda,
        codigo_qr: accesoDetalle.codigo_qr,
        estado_qr: estadoQr,
        fecha_visita: this.formatearFechaLocal(origenVisita),
        hora_estimada: this.formatearHoraLocal(origenVisita),
        hora_salida: this.formatearHoraLocal(origenSalida),
        fecha_expiracion: origenSalida,
        estatus: estadoQr === 'EXPIRADO' ? 'Inactivo' : accesoDetalle.estatus,
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

    const accesoDetalle = acceso as AccesoDetalle;
    const estadoQr = this.calcularEstadoQr(accesoDetalle);
    if (estadoQr === 'EXPIRADO' && accesoDetalle.estatus !== 'Inactivo') {
      await this.prisma.acceso.update({
        where: { id_acceso: accesoDetalle.id_acceso },
        data: { estatus: 'Inactivo' },
      });
    }

    const origenVisita =
      accesoDetalle.fecha_visita_programada ?? accesoDetalle.fecha_creacion;
    const origenSalida =
      accesoDetalle.fecha_salida_programada ?? accesoDetalle.fecha_expiracion;

    return {
      success: true,
      data: {
        valido: estadoQr === 'ACTIVO',
        estado_qr: estadoQr,
        id_acceso: accesoDetalle.id_acceso,
        id_visitante: accesoDetalle.id_visitante,
        visitante: {
          nombre: accesoDetalle.visitante.nombre,
          tipo_visitante: accesoDetalle.visitante.tipo_visitante,
          motivo: accesoDetalle.visitante.motivo,
        },
        vivienda: accesoDetalle.visitante.residente.vivienda.numero_vivienda,
        fecha_visita: this.formatearFechaLocal(origenVisita),
        hora_estimada: this.formatearHoraLocal(origenVisita),
        hora_salida: this.formatearHoraLocal(origenSalida),
        fecha_expiracion: origenSalida,
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

    const visitantes = (await this.prisma.visitante.findMany({
      where: { id_residente: residente.id_residente },
      include: {
        accesos: {
          select: {
            id_acceso: true,
            codigo_qr: true,
            fecha_creacion: true,
            fecha_visita_programada: true,
            fecha_expiracion: true,
            fecha_salida_programada: true,
            estatus: true,
          },
          orderBy: { fecha_creacion: 'desc' },
          take: 1,
        },
      },
      orderBy: { id_visitante: 'desc' },
    })) as VisitanteListadoConAccesos[];

    return visitantes.map((visitante) => {
      const ultimoAcceso = visitante.accesos[0] ?? null;
      const estado_qr = ultimoAcceso
        ? this.calcularEstadoQr(ultimoAcceso)
        : 'PENDIENTE_GENERACION';
      const origenVisita = ultimoAcceso
        ? (ultimoAcceso.fecha_visita_programada ?? ultimoAcceso.fecha_creacion)
        : undefined;
      const salidaProgramada = ultimoAcceso?.fecha_salida_programada;
      const expiracionAcceso = ultimoAcceso?.fecha_expiracion;
      const origenSalida = salidaProgramada ?? expiracionAcceso;
      const fecha_visita = this.formatearFechaLocal(origenVisita);
      const hora_estimada = this.formatearHoraLocal(origenVisita);
      const hora_salida = this.formatearHoraLocal(origenSalida);

      return {
        ...visitante,
        fecha_visita,
        hora_estimada,
        hora_salida,
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

    const visitante = (await this.prisma.visitante.findUnique({
      where: { id_visitante: idVisitante },
      include: {
        residente: { select: { id_usuario: true } },
        accesos: {
          orderBy: { fecha_creacion: 'desc' },
          take: 1,
        },
      },
    })) as (VisitanteConAccesos & { residente: { id_usuario: string } }) | null;

    if (!visitante) {
      throw new NotFoundException('Visitante no encontrado.');
    }

    if (visitante.residente.id_usuario !== idUsuario) {
      throw new ForbiddenException('No tienes permiso para modificar este QR.');
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

      const resultado = await this.prisma.$transaction(
        async (prisma: Prisma.TransactionClient) => {
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

          await prisma.$executeRaw`
            INSERT INTO "BitacoraQrVisitante" (
              "id_bitacora_qr",
              "id_acceso",
              "id_usuario",
              "accion",
              "motivo"
            ) VALUES (
              ${randomBytes(16).toString('hex')},
              ${acceso.id_acceso},
              ${idUsuario},
              ${accionBitacora},
              ${motivoBitacora}
            )
          `;

          return accesoActualizado;
        },
      );

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

  async update(
    idVisitante: string,
    idUsuario: string,
    dto: UpdateVisitanteDto,
    file?: Express.Multer.File,
  ) {
    // 1. Validación de Propiedad (NTH002)
    const visitante = (await this.prisma.visitante.findUnique({
      where: { id_visitante: idVisitante },
      include: {
        residente: { select: { id_usuario: true } },
        accesos: {
          orderBy: { fecha_creacion: 'desc' },
          take: 1,
        },
      },
    })) as (VisitanteConAccesos & { residente: { id_usuario: string } }) | null;

    if (!visitante) {
      throw new NotFoundException('Visitante no encontrado.');
    }

    if (visitante.residente.id_usuario !== idUsuario) {
      throw new ForbiddenException(
        'No tienes permiso para editar este registro.',
      );
    }

    const accesoActual = visitante.accesos[0] ?? null;

    // 2. Límites de tiempo (CA003 y NTH001)
    const ahora = new Date();
    let esPasadoLaLlegada = false;

    if (accesoActual) {
      const horaLlegada = new Date(
        accesoActual.fecha_visita_programada ?? accesoActual.fecha_creacion,
      );
      if (ahora >= horaLlegada) {
        esPasadoLaLlegada = true;
      }
    }

    if (esPasadoLaLlegada) {
      const keys = Object.keys(dto).filter(
        (k) => dto[k] !== undefined && dto[k] !== null && dto[k] !== '',
      );
      // Permitimos modificar 'fecha_fin' u otros campos específicos de salida
      const intentaEditarNoPermitido =
        keys.some((k) => k !== 'fecha_fin') || !!file;

      if (intentaEditarNoPermitido) {
        throw new BadRequestException(
          'La visita ya está en curso o la hora de llegada ha pasado. Solo está permitida la modificación de la hora de salida.',
        );
      }
    }

    // 3. Detección de Cambios y Aborto Temprano (CA008)
    const {
      fecha_inicio,
      fecha_fin,
      nombre,
      tipo_visitante,
      tipo_vehiculo,
      telefono,
      es_frecuente,
      notas_adicionales,
    } = dto;
    let hayCambiosDatos = false;
    let hayCambiosFechas = false;

    if (nombre !== undefined && nombre !== visitante.nombre) {
      hayCambiosDatos = true;
    }
    if (
      tipo_visitante !== undefined &&
      tipo_visitante !== visitante.tipo_visitante
    ) {
      hayCambiosDatos = true;
    }
    if (
      tipo_vehiculo !== undefined &&
      tipo_vehiculo !== visitante.tipo_vehiculo
    ) {
      hayCambiosDatos = true;
    }
    if (telefono !== undefined && telefono !== visitante.telefono) {
      hayCambiosDatos = true;
    }
    if (es_frecuente !== undefined && es_frecuente !== visitante.es_frecuente) {
      hayCambiosDatos = true;
    }
    if (
      notas_adicionales !== undefined &&
      notas_adicionales !== visitante.notas_adicionales
    ) {
      hayCambiosDatos = true;
    }

    if (accesoActual) {
      if (
        fecha_inicio &&
        new Date(fecha_inicio).getTime() !==
          new Date(accesoActual.fecha_creacion).getTime()
      ) {
        hayCambiosFechas = true;
      }
      if (
        fecha_fin &&
        new Date(fecha_fin).getTime() !==
          new Date(accesoActual.fecha_expiracion).getTime()
      ) {
        hayCambiosFechas = true;
      }
    }

    if (!hayCambiosDatos && !hayCambiosFechas && !file) {
      return {
        success: true,
        message:
          'Operación omitida: No se detectaron modificaciones en los campos.',
      };
    }

    // 4. Procesamiento de Archivos Multimedia
    let nuevaUrlImagen = visitante.url_imagen;
    if (file) {
      nuevaUrlImagen = await this.archivosService.subirImagen(
        file,
        'visitantes',
      );
    }

    // 5. Transacción Atómica (CA005, CA006, CA007)
    try {
      const requiereNuevoQr =
        hayCambiosFechas ||
        (nombre !== undefined && nombre !== visitante.nombre) ||
        (tipo_visitante !== undefined &&
          tipo_visitante !== visitante.tipo_visitante);

      return await this.prisma.$transaction(
        async (prisma: Prisma.TransactionClient) => {
          // Actualización de registro base
          await prisma.visitante.update({
            where: { id_visitante: idVisitante },
            data: {
              ...(nombre !== undefined && { nombre }),
              ...(tipo_visitante !== undefined && { tipo_visitante }),
              ...(tipo_vehiculo !== undefined && { tipo_vehiculo }),
              ...(telefono !== undefined && { telefono }),
              ...(es_frecuente !== undefined && { es_frecuente }),
              ...(notas_adicionales !== undefined && { notas_adicionales }),
              ...(file && { url_imagen: nuevaUrlImagen }),
            },
          });

          // Actualización de la ventana de acceso
          if (hayCambiosFechas && accesoActual) {
            const origenInicio =
              accesoActual.fecha_visita_programada ??
              accesoActual.fecha_creacion;
            const origenFin =
              accesoActual.fecha_salida_programada ??
              accesoActual.fecha_expiracion;

            const nuevaCreacion = fecha_inicio
              ? new Date(fecha_inicio)
              : origenInicio;
            const nuevaExpiracion = fecha_fin ? new Date(fecha_fin) : origenFin;

            await prisma.acceso.update({
              where: { id_acceso: accesoActual.id_acceso },
              data: {
                fecha_creacion: nuevaCreacion,
                fecha_visita_programada: nuevaCreacion,
                fecha_expiracion: nuevaExpiracion,
                fecha_salida_programada: nuevaExpiracion,
              },
            });
          }

          // Invalidación y regeneración de llaves criptográficas (CA007)
          if (requiereNuevoQr && accesoActual && accesoActual.codigo_qr) {
            await prisma.acceso.update({
              where: { id_acceso: accesoActual.id_acceso },
              data: { estatus: 'Inactivo' },
            });

            const codigoQr = await this.generarCodigoQrUnico(prisma);
            const origenInicio =
              accesoActual.fecha_visita_programada ??
              accesoActual.fecha_creacion;
            const origenFin =
              accesoActual.fecha_salida_programada ??
              accesoActual.fecha_expiracion;
            const { inicio, fin } = this.obtenerFechasAcceso(
              fecha_inicio || origenInicio,
              fecha_fin || origenFin,
            );

            await prisma.acceso.create({
              data: {
                id_usuario: idUsuario,
                id_visitante: idVisitante,
                codigo_qr: codigoQr,
                fecha_creacion: inicio,
                fecha_visita_programada: inicio,
                fecha_expiracion: fin,
                fecha_salida_programada: fin,
                estatus: 'Activo',
              },
            });
          }

          return {
            success: true,
            message: 'Información del visitante actualizada con éxito.',
          };
        },
      );
    } catch (error) {
      console.error('Error actualizando visitante:', error);
      throw new InternalServerErrorException(
        'Error técnico al procesar la actualización en la base de datos.',
      );
    }
  }

  remove(id: number) {
    return `This action removes a #${id} visitante`;
  }
}
