import { PrismaClient, Rol } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedResidentes(prisma: PrismaClient) {
  const usuariosResidentes = await prisma.usuario.findMany({
    where: { rol: Rol.Residente },
  });

  const viviendas = await prisma.vivienda.findMany();

  if (viviendas.length === 0) {
    console.error('No hay viviendas para asignar residentes.');
    return;
  }

  for (const usuario of usuariosResidentes) {
    // Asignar a cada usuario residente una vivienda aleatoria si no tiene una
    const residenteExistente = await prisma.residente.findFirst({
      where: { id_usuario: usuario.id_usuario },
    });

    if (!residenteExistente) {
      const viviendaAleatoria = faker.helpers.arrayElement(viviendas);
      
      await prisma.residente.create({
        data: {
          id_usuario: usuario.id_usuario,
          id_vivienda: viviendaAleatoria.id_vivienda,
        },
      });
    }
  }
}
