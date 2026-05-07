import { EstatusAcceso, PrismaClient } from '@prisma/client';

export async function seedAccesos(prisma: PrismaClient) {
  const admin = await prisma.usuario.findUnique({
    where: { correo: 'mariana@civitas.com' },
  });

  if (!admin) {
    throw new Error('No se encontró el usuario administrador mariana@civitas.com.');
  }

  const visitantes = await prisma.visitante.findMany({
    orderBy: { nombre: 'asc' },
  });

  for (let i = 0; i < visitantes.length; i++) {
    const codigoQR = `QR-CIVITAS-${1000 + i}`;

    await prisma.acceso.upsert({
      where: { codigo_qr: codigoQR },
      update: {
        id_usuario: admin.id_usuario,
        id_visitante: visitantes[i].id_visitante,
        fecha_expiracion: new Date(Date.now() + 86400000),
        estatus: EstatusAcceso.Activo,
        comentario_admin: 'Acceso autorizado desde plataforma',
      },
      create: {
        id_usuario: admin.id_usuario,
        id_visitante: visitantes[i].id_visitante,
        codigo_qr: codigoQR,
        fecha_expiracion: new Date(Date.now() + 86400000),
        estatus: EstatusAcceso.Activo,
        comentario_admin: 'Acceso autorizado desde plataforma',
      },
    });
  }
}
