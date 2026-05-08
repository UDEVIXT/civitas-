import { PrismaClient, Rol, Cargo } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedAdministradores(prisma: PrismaClient) {
  const usuariosAdmin = await prisma.usuario.findMany({
    where: { rol: Rol.Administrador },
    include: { persona: true }
  });

  if (usuariosAdmin.length === 0) {
    console.warn("No se encontraron usuarios con rol Administrador para el seeder de Administradores.");
    return;
  }

  const cargos = [Cargo.Gobierno, Cargo.Comite];

  for (const usuario of usuariosAdmin) {
    // Dividir el nombre completo de la persona para obtener nombre y apellidos
    const partesNombre = usuario.persona.nombre.split(' ');
    const nombre = partesNombre[0];
    const apellidos = partesNombre.slice(1).join(' ') || faker.person.lastName();

    await prisma.administrador.upsert({
      where: { id_usuario: usuario.id_usuario },
      update: {
        nombre: nombre,
        apellidos: apellidos,
        cargo: faker.helpers.arrayElement(cargos),
      },
      create: {
        id_usuario: usuario.id_usuario,
        nombre: nombre,
        apellidos: apellidos,
        cargo: faker.helpers.arrayElement(cargos),
      },
    });
  }
}
