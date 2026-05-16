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
  const usuariosResidentes = await prisma.usuario.findMany({
    where: { rol: Rol.Residente },
  });

  if (visitantes.length === 0) {
    console.error('No hay visitantes para generar accesos.');
    return;
  }

  const estatusValues = [EstatusAcceso.Activo, EstatusAcceso.Inactivo];

  // ------------------------------------------------------------------
  // 1. GENERACIÓN DE ACCESOS PARA VISITANTES (Lógica Original)
  // ------------------------------------------------------------------
  for (const visitante of visitantes) {
    const numAccesos = faker.number.int({ min: 1, max: 2 });

    for (let j = 0; j < numAccesos; j++) {
      const codigoQR = faker.string.uuid();
      const creatorPool = administradores.concat(usuariosResidentes);
      const creator = faker.helpers.arrayElement(creatorPool);
      const estatus = faker.helpers.arrayElement(estatusValues);

      const fechaExpiracion = faker.date.soon({
        days: faker.number.int({ min: 1, max: 90 }),
      });

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

  // ------------------------------------------------------------------
  // 2. GENERACIÓN DE ACCESOS PROPIOS PARA RESIDENTES (Nueva Lógica)
  // ------------------------------------------------------------------
  if (usuariosResidentes.length > 0) {
    for (const residente of usuariosResidentes) {
      // Generalmente, un residente tiene un único QR activo, pero simularemos 1 para mantener el rigor.
      const codigoQR = faker.string.uuid();
      const estatus = faker.helpers.arrayElement(estatusValues);

      // La expiración de un residente suele ser prolongada (ej. 1 año)
      const fechaExpiracion = faker.date.future({ years: 1 });

      await prisma.acceso.create({
        data: {
          id_usuario: residente.id_usuario, // El residente es el titular del acceso
          id_visitante: null,
          codigo_qr: codigoQR,
          fecha_expiracion: fechaExpiracion,
          estatus: estatus,
          comentario_admin:
            'Acceso permanente de residente generado vía seeder',
        },
      });
    }
    console.log('Seeding de Accesos (Visitantes y Residentes) completado.');
  } else {
    console.warn(
      'No hay usuarios residentes para generar sus accesos propios.',
    );
  }
}
