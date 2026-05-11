import { PrismaClient, Rol } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedGuardias(prisma: PrismaClient) {
  const usuariosGuardia = await prisma.usuario.findMany({
    where: { rol: Rol.Guardia },
    include: { persona: true }
  });

  const turnos = ['Matutino', 'Vespertino', 'Nocturno'];

  for (const usuario of usuariosGuardia) {
    await prisma.guardia.upsert({
      where: { id_usuario: usuario.id_usuario },
      update: {
        nombre: usuario.persona.nombre,
        turno: faker.helpers.arrayElement(turnos),
      },
      create: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.persona.nombre,
        turno: faker.helpers.arrayElement(turnos),
      },
    });
  }
}
