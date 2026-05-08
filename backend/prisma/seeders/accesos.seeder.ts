import { EstatusAcceso, PrismaClient, Rol } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedAccesos(prisma: PrismaClient) {
  const administradores = await prisma.usuario.findMany({
    where: { rol: Rol.Administrador },
  });

  if (administradores.length === 0) {
    console.error('No se encontraron administradores para crear accesos.');
    return;
  }

  const visitantes = await prisma.visitante.findMany();

  if (visitantes.length === 0) {
    console.error('No hay visitantes para generar accesos.');
    return;
  }

  const estatusValues = [EstatusAcceso.Activo, EstatusAcceso.Expirado, EstatusAcceso.Usado, EstatusAcceso.Inactivo];

  for (const visitante of visitantes) {
    // Cada visitante tiene 1 o 2 intentos de acceso
    const numAccesos = faker.number.int({ min: 1, max: 2 });
    
    for (let j = 0; j < numAccesos; j++) {
      const codigoQR = faker.string.uuid();
      const admin = faker.helpers.arrayElement(administradores);
      const estatus = faker.helpers.arrayElement(estatusValues);

      await prisma.acceso.create({
        data: {
          id_usuario: admin.id_usuario,
          id_visitante: visitante.id_visitante,
          codigo_qr: codigoQR,
          fecha_expiracion: faker.date.future(),
          estatus: estatus,
          comentario_admin: faker.lorem.sentence(),
        },
      });
    }
  }
}
