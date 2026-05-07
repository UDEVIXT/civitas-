import { PrismaClient, Rol } from '@prisma/client';

type PerfilUsuario = {
  nombre: string;
  genero: string;
  rol: Rol;
  correo: string;
};

const perfiles: PerfilUsuario[] = [
  { nombre: 'Mariana', genero: 'Femenino', rol: Rol.Administrador, correo: 'mariana@civitas.com' },
  { nombre: 'Orlando', genero: 'Masculino', rol: Rol.Guardia, correo: 'orlando@civitas.com' },
  { nombre: 'Karla', genero: 'Femenino', rol: Rol.Residente, correo: 'karla@civitas.com' },
  { nombre: 'Jared', genero: 'Masculino', rol: Rol.Residente, correo: 'jared@civitas.com' },
  { nombre: 'Alexandra', genero: 'Femenino', rol: Rol.Residente, correo: 'alexandra@civitas.com' },
];

export async function seedUsuarios(prisma: PrismaClient) {
  for (const perfil of perfiles) {
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { correo: perfil.correo },
    });

    if (usuarioExistente) {
      continue;
    }

    const persona = await prisma.persona.create({
      data: {
        nombre: perfil.nombre,
        genero: perfil.genero,
        fecha_nacimiento: new Date('2000-01-01T00:00:00Z'),
        telefono: '9710000000',
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
