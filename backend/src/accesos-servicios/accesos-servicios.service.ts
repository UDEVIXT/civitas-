import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common/exceptions';
import { RegistroManualDto } from './dto/registro-manual.dto';

@Injectable()
export class AccesosServiciosService {
  constructor(private prisma: PrismaService) {}

  async obtenerDatosPorQr(codigoQr: string) {
    const acceso = await this.prisma.acceso.findUnique({
      where: { codigo_qr: codigoQr },

      include: {
        visitante: {
          include: {
            servicio: {
              include: {
                tipo_servicio: true,
              },
            },

            residente: {
              include: {
                vivienda: true,

                usuario: {
                  include: {
                    persona: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!acceso) {
      throw new NotFoundException(
        'Código QR no válido o no encontrado.',
      );
    }

    const hoy = new Date();

    const esExpirado =
      new Date(acceso.fecha_expiracion) < hoy;

    const esInactivo =
      acceso.estatus === 'Inactivo';

    let estado = 'VALIDO';

    let motivo_invalido = '';

    if (esExpirado) {
      estado = 'EXPIRADO';

      motivo_invalido =
        'El código QR ha expirado.';
    } else if (esInactivo) {
      estado = 'INACTIVO';

      motivo_invalido =
        'El código QR está inactivo.';
    }

    const visitante = acceso.visitante;

    const servicio = visitante?.servicio;

    const residente = visitante?.residente;

    const vivienda = residente?.vivienda;

    return {
      id_acceso: acceso.id_acceso,

      id_servicio:
        servicio?.id_servicio || null,

      id_visitante:
        visitante?.id_visitante || null,

      nombre_repartidor:
        visitante?.nombre || 'Desconocido',

      empresa:
        servicio?.nombre_empresa ||
        'Particular',

      residente_vinculado:
        residente?.usuario?.persona?.nombre ||
        'Residente',

      vivienda:
        vivienda?.numero_vivienda || 'N/A',

      tipo_servicio:
        servicio?.tipo_servicio?.nombre ||
        'Visita Regular',

      fecha_expiracion:
        acceso.fecha_expiracion,

      estado,

      motivo_invalido,

      detalles_adicionales: {
        placas: servicio?.placas,

        motivo: visitante?.motivo,
      },
    };
  }

  async obtenerActividadReciente(limit = 5) {
    const bitacoras =
      await this.prisma.bitacora.findMany({
        take: limit,

        orderBy: {
          fecha_hora_entrada: 'desc',
        },

        include: {
          acceso: {
            include: {
              visitante: {
                include: {
                  servicio: {
                    include: {
                      tipo_servicio: true,
                    },
                  },

                  residente: {
                    include: {
                      vivienda: true,

                      usuario: {
                        include: {
                          persona: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },

          guardia: true,
          guardia_salida: true,
        },
      });

    const haceCuanto = (fecha: Date) => {
      const ahora = new Date();

      const diffMs =
        ahora.getTime() -
        new Date(fecha).getTime();

      const minutos =
        Math.floor(diffMs / 60000);

      if (minutos < 1) {
        return 'Hace unos segundos';
      }

      if (minutos < 60) {
        return `Hace ${minutos} min`;
      }

      const horas =
        Math.floor(minutos / 60);

      if (horas < 24) {
        return `Hace ${horas} h`;
      }

      const dias =
        Math.floor(horas / 24);

      return `Hace ${dias} días`;
    };

    return bitacoras.map((bitacora) => {
      const visitante =
        bitacora.acceso?.visitante;

      const servicio =
        visitante?.servicio;

      const residente =
        visitante?.residente;

      const nombreVisitante =
        visitante?.nombre ??
        'Sin visitante';

      const empresa =
        servicio?.nombre_empresa ??
        'Empresa desconocida';

      const nombreResidente =
        residente?.usuario?.persona
          ?.nombre ?? 'Residente';

      const vivienda =
        residente?.vivienda
          ?.numero_vivienda ?? 'N/A';

      const esSalida =
        bitacora.fecha_hora_salida !==
        null;

      return {
        id: bitacora.id_bitacora,

        nombre_repartidor:
          `${nombreVisitante} (${empresa})`,

        residente_vinculado:
          `${nombreResidente} (Vivienda ${vivienda})`,

        tiempo_transcurrido:
          haceCuanto(
            esSalida
              ? bitacora.fecha_hora_salida!
              : bitacora.fecha_hora_entrada,
          ),

        estado: esSalida
          ? 'SALIDA'
          : 'ENTRADA',

        comentario: esSalida
          ? bitacora.comentario_salida
          : bitacora.comentario,
      };
    });
  }

  async obtenerDetalleServicio(id: string) {
    const servicio =
      await this.prisma.servicio.findUnique({
        where: {
          id_servicio: id,
        },

        include: {
          tipo_servicio: true,

          horarios: true,

          visitantes: {
            take: 1,

            orderBy: {
              id_visitante: 'desc',
            },

            include: {
              residente: {
                include: {
                  vivienda: true,

                  usuario: {
                    include: {
                      persona: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    if (!servicio) {
      throw new NotFoundException(
        'Servicio no encontrado.',
      );
    }

    const visitante =
      servicio.visitantes[0];

    const residente =
      visitante?.residente;

    return {
      id: servicio.id_servicio,

      nombre_repartidor:
        visitante?.nombre ||
        'Desconocido',

      empresa:
        servicio.nombre_empresa ||
        'Particular',

      residente_vinculado:
        residente?.usuario?.persona
          ?.nombre || 'Residente',

      vivienda:
        residente?.vivienda
          ?.numero_vivienda || 'N/A',

      fecha_programada:
        'Programado',

      tipo_servicio:
        servicio.tipo_servicio
          ?.nombre || 'General',

      detalles: {
        placas: servicio.placas,

        tipo_carro:
          servicio.tipo_carro,

        activo: servicio.activo,
      },
    };
  }

  async validarAcceso(
  codigoQr: string,
  idUsuarioGuardia: string,
) {
  const guardia =
    await this.prisma.guardia.findFirst({
      where: {
        id_usuario: idUsuarioGuardia,
      },
    });

  if (!guardia) {
    throw new NotFoundException(
      'Guardia no encontrado.',
    );
  }

  const acceso =
    await this.prisma.acceso.findUnique({
      where: {
        codigo_qr: codigoQr,
      },
    });

  if (!acceso) {
    throw new NotFoundException(
      'Código QR no válido.',
    );
  }

  // Validar expiración
  if (
    new Date(acceso.fecha_expiracion) <
    new Date()
  ) {
    throw new BadRequestException(
      'El código QR ha expirado.',
    );
  }

  // Validar estatus
  if (acceso.estatus === 'Inactivo') {
    throw new BadRequestException(
      'El acceso está inactivo.',
    );
  }

  // Registrar validación
  await this.prisma.bitacora.create({
    data: {
      id_acceso: acceso.id_acceso,

      id_guardia: guardia.id_guardia,

      fecha_hora_entrada: new Date(),

      comentario:
        'Acceso validado por guardia vía QR',
    },
  });

  return {
    success: true,

    message:
      'Acceso validado correctamente.',
  };
}

  async denegarAcceso(
    codigoQr: string,
    idUsuarioGuardia: string,
    motivo: string,
  ) {
    const guardia =
      await this.prisma.guardia.findFirst({
        where: {
          id_usuario: idUsuarioGuardia,
        },
      });

    if (!guardia) {
      throw new NotFoundException(
        'Guardia no encontrado.',
      );
    }

    const acceso =
      await this.prisma.acceso.findUnique({
        where: {
          codigo_qr: codigoQr,
        },

        include: {
          visitante: {
            include: {
              residente: {
                include: {
                  vivienda: true,

                  usuario: {
                    include: {
                      persona: true,
                    },
                  },
                },
              },

              servicio: true,
            },
          },
        },
      });

    if (!acceso) {
      throw new NotFoundException(
        'Código QR no válido.',
      );
    }

    // Registrar incidencia
    await this.prisma.reporte.create({
      data: {
        id_usuario:
          idUsuarioGuardia,

        motivo:
          'Acceso Denegado',

        descripcion:
          `El acceso del visitante ${
            acceso.visitante?.nombre ??
            'Desconocido'
          } fue denegado. Motivo: ${motivo}`,

        tipo: 'INCIDENCIA',

        estado: 'PENDIENTE',

        prioridad: 'MEDIA',

        es_anonimo: false,

        latitud: 0,

        longitud: 0,
      },
    });

    // Registrar en bitácora
    await this.prisma.bitacora.create({
      data: {
        id_acceso: acceso.id_acceso,

        id_guardia:
          guardia.id_guardia,

        fecha_hora_entrada:
          new Date(),

        comentario:
          `ACCESO DENEGADO: ${motivo}`,
      },
    });

    // Opcional:
    // desactivar acceso después del rechazo
    await this.prisma.acceso.update({
      where: {
        id_acceso: acceso.id_acceso,
      },

      data: {
        estatus: 'Inactivo',
      },
    });

    return {
      success: true,

      message:
        'Acceso denegado e incidencia registrada correctamente.',
    };
  }

  async registrarIngresoManual(datos: RegistroManualDto, idUsuarioGuardia: string) {
    const guardia = await this.prisma.guardia.findFirst({
      where: { id_usuario: idUsuarioGuardia },
    });

    if (!guardia) {
      throw new NotFoundException('Guardia no encontrado.');
    }

    // 1. Buscar vivienda y extraer al primer residente
    const vivienda = await this.prisma.vivienda.findFirst({
      where: { numero_vivienda: { contains: datos.vivienda, mode: 'insensitive' } },
      include: { residentes: true },
    });

    if (!vivienda || vivienda.residentes.length === 0) {
      throw new NotFoundException(`No se encontró la vivienda o no tiene residentes asociados (${datos.vivienda}).`);
    }

    const residente = vivienda.residentes[0];

    // 2. Crear un Visitante exprés
    const visitante = await this.prisma.visitante.create({
      data: {
        nombre: datos.nombre,
        motivo: datos.motivo ? `Ingreso manual (${datos.empresa}): ${datos.motivo}` : `Ingreso manual (${datos.empresa})`,
        es_frecuente: false,
        id_residente: residente.id_residente,
      }
    });

    // 3. Crear un Acceso temporal (expira al final del día)
    const hoy = new Date();
    const expiracion = new Date(hoy);
    expiracion.setHours(23, 59, 59, 999);

    const acceso = await this.prisma.acceso.create({
      data: {
        id_usuario: residente.id_usuario,
        id_visitante: visitante.id_visitante,
        fecha_expiracion: expiracion,
        estatus: 'Activo',
        comentario_admin: 'Creado por ingreso manual en caseta',
      }
    });

    // 4. Registrar en Bitácora
    await this.prisma.bitacora.create({
      data: {
        id_acceso: acceso.id_acceso,
        id_guardia: guardia.id_guardia,
        fecha_hora_entrada: new Date(),
        comentario: `Ingreso manual: ${datos.empresa}. ${datos.motivo || ''}`.trim(),
      }
    });

    return {
      success: true,
      message: 'Ingreso manual registrado correctamente.',
    };
  }
}