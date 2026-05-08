import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedViviendas(prisma: PrismaClient) {
  const secciones = ['A', 'B', 'C', 'D', 'E'];
  
  for (const seccion of secciones) {
    for (let i = 1; i <= 10; i++) {
      const numero = `${seccion}-${i.toString().padStart(2, '0')}`;
      await prisma.vivienda.upsert({
        where: { numero_vivienda: numero },
        update: {},
        create: { 
          numero_vivienda: numero,
        },
      });
    }
  }

  // Viviendas aleatorias adicionales
  for (let i = 0; i < 50; i++) {
    const numero = faker.helpers.replaceSymbols('###-??').toUpperCase();
    
    const existente = await prisma.vivienda.findUnique({
      where: { numero_vivienda: numero }
    });

    if (existente) continue;

    await prisma.vivienda.create({
      data: {
        numero_vivienda: numero,
      }
    });
  }
}
