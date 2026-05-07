import { PrismaClient } from '@prisma/client';

const numerosVivienda = ['A-01', 'A-02', 'B-01', 'B-02', 'C-01'];

export async function seedViviendas(prisma: PrismaClient) {
  for (const numero of numerosVivienda) {
    await prisma.vivienda.upsert({
      where: { numero_vivienda: numero },
      update: {},
      create: { numero_vivienda: numero },
    });
  }
}
