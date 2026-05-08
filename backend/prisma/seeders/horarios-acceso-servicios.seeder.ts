import { DiaSemana, PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedHorariosAccesoServicios(prisma: PrismaClient) {
  const servicios = await prisma.servicio.findMany();
  
  const todosLosDias = Object.values(DiaSemana);
  const diasLaborables = [
    DiaSemana.LUNES,
    DiaSemana.MARTES,
    DiaSemana.MIERCOLES,
    DiaSemana.JUEVES,
    DiaSemana.VIERNES,
  ];

  for (const servicio of servicios) {
    const usaTodosLosDias = faker.datatype.boolean();
    const diasAAplicar = usaTodosLosDias ? todosLosDias : diasLaborables;

    for (const dia of diasAAplicar) {
      const horaInicio = new Date('1970-01-01T08:00:00.000Z');
      const horaFin = new Date('1970-01-01T18:00:00.000Z');

      // Variar un poco las horas con faker
      horaInicio.setUTCHours(faker.number.int({ min: 6, max: 10 }));
      horaFin.setUTCHours(faker.number.int({ min: 16, max: 21 }));

      const horarioExistente = await prisma.horarioAccesoServicios.findFirst({
        where: {
          id_servicio: servicio.id_servicio,
          dia_semana: dia,
        },
      });

      const data = {
        dia_semana: dia,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        id_servicio: servicio.id_servicio,
        activo: faker.datatype.boolean(0.9), // 90% activos
      };

      if (horarioExistente) {
        await prisma.horarioAccesoServicios.update({
          where: { id_horario: horarioExistente.id_horario },
          data,
        });
        continue;
      }

      await prisma.horarioAccesoServicios.create({ data });
    }
  }
}
