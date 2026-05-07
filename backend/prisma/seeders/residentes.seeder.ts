import { PrismaClient } from '@prisma/client';

const residentesViviendas = [
  { correo: 'karla@civitas.com', numeroVivienda: 'A-01' },
  { correo: 'jared@civitas.com', numeroVivienda: 'A-02' },
  { correo: 'alexandra@civitas.com', numeroVivienda: 'B-01' },
];

export async function seedResidentes(prisma: PrismaClient) {
  for (const item of residentesViviendas) {
    const usuario = await prisma.usuario.findUnique({
      where: { correo: item.correo },
    });
    const vivienda = await prisma.vivienda.findUnique({
      where: { numero_vivienda: item.numeroVivienda },
    });

    if (!usuario || !vivienda) {
      throw new Error(
        `No se puede crear residente para ${item.correo} en ${item.numeroVivienda}.`,
      );
    }

    const residenteExistente = await prisma.residente.findFirst({
      where: {
        id_usuario: usuario.id_usuario,
        id_vivienda: vivienda.id_vivienda,
      },
    });

    if (!residenteExistente) {
      await prisma.residente.create({
        data: {
          id_usuario: usuario.id_usuario,
          id_vivienda: vivienda.id_vivienda,
        },
      });
    }
  }
}
