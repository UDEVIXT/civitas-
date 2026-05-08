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
    const guardia = faker.helpers.arrayElement(guardias);
    
    // Solo creamos bitácora para algunos accesos (simulando que no todos han sido procesados o registrados)
    if (faker.datatype.boolean(0.8)) {
      const fechaEntrada = faker.date.recent({ days: 30 });
      const fechaSalida = faker.datatype.boolean(0.7) 
        ? new Date(fechaEntrada.getTime() + faker.number.int({ min: 1800000, max: 28800000 })) // +30min a 8h
        : null;

      await prisma.bitacora.upsert({
        where: { id_acceso: acceso.id_acceso },
        update: {
          id_guardia: guardia.id_guardia,
          fecha_hora_entrada: fechaEntrada,
          comentario: faker.helpers.arrayElement([
            'Ingreso sin novedades',
            'Se revisó identificación',
            'Vehículo autorizado',
            'Visitante frecuente registrado'
          ]),
          comentario_salida: fechaSalida ? 'Salida normal' : null,
          fecha_hora_salida: fechaSalida,
        },
        create: {
          id_acceso: acceso.id_acceso,
          id_guardia: guardia.id_guardia,
          fecha_hora_entrada: fechaEntrada,
          comentario: faker.helpers.arrayElement([
            'Ingreso sin novedades',
            'Se revisó identificación',
            'Vehículo autorizado',
            'Visitante frecuente registrado'
          ]),
          comentario_salida: fechaSalida ? 'Salida normal' : null,
          fecha_hora_salida: fechaSalida,
        },
      });
    }
  }
}
