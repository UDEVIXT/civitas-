import { PrismaClient, Rol, EstadoUsuario } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

export async function seedUsuarios(prisma: PrismaClient) {
  const saltRounds = 10;
  const passwordPlanaPruebas = 'password123';
  const hashedDefaultPassword = await bcrypt.hash(
    passwordPlanaPruebas,
    saltRounds,
  );
  // Crear usuarios fijos para desarrollo
  const perfilesFijos = [
    {
      nombre: 'Admin',
      apellido: 'Civitas',
      nombre_usuario: 'admin_test',
      correo: 'admin@test.com',
      password: 'adminPassword123',
      genero: 'Otro',
      rol: Rol.Administrador,
    },
    {
      nombre: 'Guardia',
      apellido: 'Civitas',
      nombre_usuario: 'guardia_test',
      correo: 'guardia@test.com',
      password: 'guardiaPassword123',
      genero: 'Masculino',
      rol: Rol.Guardia,
    },
    {
      nombre: 'Residente',
      apellido: 'Civitas',
      nombre_usuario: 'residente_test',
      correo: 'residente@test.com',
      password: 'residentePassword123',
      genero: 'Femenino',
      rol: Rol.Residente,
    },
  ];

  for (const perfil of perfilesFijos) {
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { correo: perfil.correo },
    });

    if (!usuarioExistente) {
      const persona = await prisma.persona.create({
        data: {
          nombre: `${perfil.nombre} ${perfil.apellido}`,
          genero: perfil.genero,
          url_imagen: faker.image.url(),
          fecha_nacimiento: faker.date.birthdate({
            min: 18,
            max: 65,
            mode: 'age',
          }),
          telefono: faker.phone.number({ style: 'national' }),
        },
      });

      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(perfil.password, salt);

      await prisma.usuario.create({
        data: {
          nombre_usuario: perfil.nombre_usuario,
          correo: perfil.correo,
          password: hashedPassword,
          rol: perfil.rol,
          estado: EstadoUsuario.ACTIVO,
          correo_verificado: true,
          id_persona: persona.id_persona,
        },
      });
    }
  }

  // Generar usuarios aleatorios adicionales
  const ROL_VALUES = [Rol.Administrador, Rol.Guardia, Rol.Residente];

  for (let i = 0; i < 20; i++) {
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
        url_imagen: faker.image.url(),
        fecha_nacimiento: faker.date.birthdate({
          min: 18,
          max: 80,
          mode: 'age',
        }),
        telefono: faker.phone.number({ style: 'national' }),
      },
    });

    await prisma.usuario.create({
      data: {
        nombre_usuario: faker.internet.username({ firstName, lastName }),
        correo: email,
        password: hashedDefaultPassword,
        rol: rol,
        estado: EstadoUsuario.ACTIVO,
        correo_verificado: faker.datatype.boolean(),
        id_persona: persona.id_persona,
      },
    });
  }

  // Garantizar un número mínimo de guardias y residentes para pruebas
  const MIN_GUARDIAS = 5;
  const MIN_RESIDENTES = 12;

  const currentGuardias = await prisma.usuario.count({
    where: { rol: Rol.Guardia },
  });
  const currentResidentes = await prisma.usuario.count({
    where: { rol: Rol.Residente },
  });

  for (let i = currentGuardias; i < MIN_GUARDIAS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });

    const persona = await prisma.persona.create({
      data: {
        nombre: `${firstName} ${lastName}`,
        genero: faker.person.sex(),
        fecha_nacimiento: faker.date.birthdate({
          min: 18,
          max: 65,
          mode: 'age',
        }),
        telefono: faker.phone.number({ style: 'national' }),
        url_imagen: faker.image.url(),
      },
    });

    await prisma.usuario.create({
      data: {
        nombre_usuario: `guardia_${i}_${faker.string.alphanumeric(4)}`,
        correo: email,
        password: hashedDefaultPassword,
        rol: Rol.Guardia,
        estado: EstadoUsuario.ACTIVO,
        correo_verificado: faker.datatype.boolean(),
        id_persona: persona.id_persona,
      },
    });
  }

  for (let i = currentResidentes; i < MIN_RESIDENTES; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });

    const persona = await prisma.persona.create({
      data: {
        nombre: `${firstName} ${lastName}`,
        genero: faker.person.sex(),
        fecha_nacimiento: faker.date.birthdate({
          min: 18,
          max: 80,
          mode: 'age',
        }),
        telefono: faker.phone.number({ style: 'national' }),
        url_imagen: faker.image.url(),
      },
    });

    await prisma.usuario.create({
      data: {
        nombre_usuario: `residente_${i}_${faker.string.alphanumeric(4)}`,
        correo: email,
        password: hashedDefaultPassword,
        rol: Rol.Residente,
        estado: EstadoUsuario.ACTIVO,
        correo_verificado: faker.datatype.boolean(),
        id_persona: persona.id_persona,
      },
    });
  }
}
