import { PrismaClient } from '@prisma/client';

export async function seedBitacoras(prisma: PrismaClient) {
  const guardia = await prisma.guardia.findFirst({
    where: { nombre: 'Orlando' },
  });

  if (!guardia) {
    throw new Error('No se encontró guardia para crear bitácoras.');
  }

  const accesos = await prisma.acceso.findMany({
    orderBy: { codigo_qr: 'asc' },
  });

  for (let i = 0; i < accesos.length; i++) {
    await prisma.bitacora.upsert({
      where: { id_acceso: accesos[i].id_acceso },
      update: {
        id_guardia: guardia.id_guardia,
        comentario: 'Ingreso sin novedades',
        comentario_salida: null,
        fecha_hora_salida: i % 2 === 0 ? new Date(Date.now() + 3600000) : null,
      },
      create: {
        id_acceso: accesos[i].id_acceso,
        id_guardia: guardia.id_guardia,
        comentario: 'Ingreso sin novedades',
        comentario_salida: null,
        fecha_hora_salida: i % 2 === 0 ? new Date(Date.now() + 3600000) : null,
      },
    });
  }
}
