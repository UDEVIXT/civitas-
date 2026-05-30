import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedBitacoras(prisma: PrismaClient) {
  const guardias = await prisma.guardia.findMany();

  if (guardias.length === 0) {
    console.error('No se encontraron guardias para crear bitácoras.');
    return;
  }

  const accesos = await prisma.acceso.findMany();

  for (const acceso of accesos) {
    const guardiaEntrada = faker.helpers.arrayElement(guardias);

    const guardiaSalida = faker.helpers.arrayElement(guardias);

    if (faker.datatype.boolean(0.8)) {
      const baseDate = faker.date.recent({ days: 30 });

      const fechaEntrada = new Date(baseDate);

      fechaEntrada.setHours(
        faker.number.int({ min: 0, max: 23 }),
        faker.number.int({ min: 0, max: 59 }),
        faker.number.int({ min: 0, max: 59 }),
      );

      const fechaSalida = faker.datatype.boolean(0.7)
        ? new Date(
            fechaEntrada.getTime() +
              faker.number.int({
                min: 1800000,
                max: 28800000,
              }),
          )
        : null;

      const estadoAleatorio = faker.datatype.boolean(0.9);
      await prisma.bitacora.create({
        data: {
          id_acceso: acceso.id_acceso,

          // Guardia que registró entrada
          id_guardia: guardiaEntrada.id_guardia,

          // Guardia que registró salida
          id_guardia_salida: fechaSalida
            ? guardiaSalida.id_guardia
            : null,

          fecha_hora_entrada: fechaEntrada,

          fecha_hora_salida: fechaSalida,

          comentario: faker.helpers.arrayElement([
            'Ingreso sin novedades',
            'Se revisó identificación',
            'Vehículo autorizado',
            'Visitante frecuente registrado',
          ]),

          comentario_salida: fechaSalida
            ? faker.helpers.arrayElement([
                'Salida normal',
                'Visitante se retiró sin incidentes',
                'Se verificó salida',
                'Acceso finalizado correctamente',
              ])
            : null,
          estado: estadoAleatorio,
        },
      });
    }
  }

  console.log('Seeding de Bitácora completado.');
}
