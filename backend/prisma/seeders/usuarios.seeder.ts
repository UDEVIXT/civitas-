import { PrismaClient, Rol } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedUsuarios(prisma: PrismaClient) {
  // Crear usuarios fijos para desarrollo
  const adminFijo = {
    nombre: 'Admin',
    apellido: 'Civitas',
    genero: 'Otro',
    correo: 'admin@civitas.com',
    rol: Rol.Administrador,
  };

  const perfilesFijos = [adminFijo];

  for (const perfil of perfilesFijos) {
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { correo: perfil.correo },
    });

    if (!usuarioExistente) {
      const persona = await prisma.persona.create({
        data: {
          nombre: `${perfil.nombre} ${perfil.apellido}`,
          genero: perfil.genero,
          fecha_nacimiento: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
          telefono: faker.phone.number({ style: 'national' }),
        },
      });

      await prisma.usuario.create({
        data: {
          nombre_usuario: perfil.nombre.toLowerCase(),
          correo: perfil.correo,
          password: 'hashed_password_123',
          rol: perfil.rol,
          id_persona: persona.id_persona,
        },
      });
    }
  }

  // Generar usuarios aleatorios adicionales
  const ROL_VALUES = [Rol.Administrador, Rol.Guardia, Rol.Residente];

  for (let i = 0; i < 10; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const rol = faker.helpers.arrayElement(ROL_VALUES);

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { correo: email },
    });

    if (usuarioExistente) continue;

    const persona = await prisma.persona.create({
      data: {
        nombre: `${firstName} ${lastName}`,
        genero: faker.person.sex(),
        fecha_nacimiento: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
        telefono: faker.phone.number({ style: 'national' }),
      },
    });

    await prisma.usuario.create({
      data: {
        nombre_usuario: faker.internet.username({ firstName, lastName }),
        correo: email,
        password: 'hashed_password_123',
        rol: rol,
        id_persona: persona.id_persona,
      },
    });
  }
}
