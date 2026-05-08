import { PrismaClient } from '@prisma/client';

export async function seedGuardias(prisma: PrismaClient) {
  const usuarioGuardia = await prisma.usuario.findUnique({
    where: { correo: 'orlando@civitas.com' },
  });

  if (!usuarioGuardia) {
    throw new Error('No se encontró el usuario guardia (orlando@civitas.com).');
  }

  await prisma.guardia.upsert({
    where: { id_usuario: usuarioGuardia.id_usuario },
    update: {
      nombre: 'Orlando',
      turno: 'Matutino',
    },
    create: {
      id_usuario: usuarioGuardia.id_usuario,
      nombre: 'Orlando',
      turno: 'Matutino',
    },
  });
}
