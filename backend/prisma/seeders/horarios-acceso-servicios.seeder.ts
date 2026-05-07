import { DiaSemana, PrismaClient } from '@prisma/client';

const diasSemanaCompleta = [
  DiaSemana.LUNES,
  DiaSemana.MARTES,
  DiaSemana.MIERCOLES,
  DiaSemana.JUEVES,
  DiaSemana.VIERNES,
  DiaSemana.SABADO,
  DiaSemana.DOMINGO,
];

const diasLaborables = [
  DiaSemana.LUNES,
  DiaSemana.MARTES,
  DiaSemana.MIERCOLES,
  DiaSemana.JUEVES,
  DiaSemana.VIERNES,
];

const nombresServicios = [
  'Jardinería',
  'Plomería',
  'Limpieza',
  'Internet',
  'Comida',
];

export async function seedHorariosAccesoServicios(prisma: PrismaClient) {
  for (let i = 0; i < nombresServicios.length; i++) {
    const servicio = await prisma.servicio.findFirst({
      where: { nombre_servicio: nombresServicios[i] },
    });

    if (!servicio) {
      throw new Error(`No se encontró el servicio ${nombresServicios[i]}.`);
    }

    const diasAAplicar = i === 0 || i === 2 ? diasSemanaCompleta : diasLaborables;

    for (const dia of diasAAplicar) {
      const horarioExistente = await prisma.horarioAccesoServicios.findFirst({
        where: {
          id_servicio: servicio.id_servicio,
          dia_semana: dia,
        },
      });

      if (horarioExistente) {
        await prisma.horarioAccesoServicios.update({
          where: { id_horario: horarioExistente.id_horario },
          data: {
            hora_inicio: new Date('1970-01-01T08:00:00.000Z'),
            hora_fin: new Date('1970-01-01T18:00:00.000Z'),
            activo: true,
          },
        });
        continue;
      }

      await prisma.horarioAccesoServicios.create({
        data: {
          dia_semana: dia,
          hora_inicio: new Date('1970-01-01T08:00:00.000Z'),
          hora_fin: new Date('1970-01-01T18:00:00.000Z'),
          id_servicio: servicio.id_servicio,
          activo: true,
        },
      });
    }
  }
}
