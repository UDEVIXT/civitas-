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
  const usuariosResidentes = await prisma.usuario.findMany({ where: { rol: Rol.Residente } });

  if (visitantes.length === 0) {
    console.error('No hay visitantes para generar accesos.');
    return;
  }

  const estatusValues = [EstatusAcceso.Activo, EstatusAcceso.Inactivo];

  for (const visitante of visitantes) {
    // Cada visitante tiene 1 o 2 intentos de acceso
    const numAccesos = faker.number.int({ min: 1, max: 2 });
    
    for (let j = 0; j < numAccesos; j++) {
      const codigoQR = faker.string.uuid();
      const creatorPool = administradores.concat(usuariosResidentes);
      const creator = faker.helpers.arrayElement(creatorPool);
      const estatus = faker.helpers.arrayElement(estatusValues);

      // Fecha de expiración con variabilidad (1-90 días)
      const fechaExpiracion = faker.date.soon({ days: faker.number.int({ min: 1, max: 90 }) });

      await prisma.acceso.create({
        data: {
          id_usuario: creator.id_usuario,
          id_visitante: visitante.id_visitante,
          codigo_qr: codigoQR,
          fecha_expiracion: fechaExpiracion,
          estatus: estatus,
          comentario_admin: faker.lorem.sentence(),
        },
      });
    }
  }
}
