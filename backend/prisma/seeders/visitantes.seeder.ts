import { PrismaClient } from '@prisma/client';

type VisitanteSeed = {
  nombre: string;
  motivo: string;
  es_frecuente: boolean;
  correoResidente: string;
  nombreServicio?: string;
};

const visitantesData: VisitanteSeed[] = [
  {
    nombre: 'Pablo',
    motivo: 'Visita familiar',
    es_frecuente: true,
    correoResidente: 'karla@civitas.com',
  },
  {
    nombre: 'Denilson',
    motivo: 'Entrega de paquete',
    es_frecuente: false,
    correoResidente: 'jared@civitas.com',
    nombreServicio: 'Comida',
  },
  {
    nombre: 'Jeycson',
    motivo: 'Reparación de tubería',
    es_frecuente: true,
    correoResidente: 'alexandra@civitas.com',
    nombreServicio: 'Plomería',
  },
  {
    nombre: 'Carlos',
    motivo: 'Visita de cortesía',
    es_frecuente: false,
    correoResidente: 'karla@civitas.com',
  },
  {
    nombre: 'Ana',
    motivo: 'Mantenimiento de red',
    es_frecuente: true,
    correoResidente: 'jared@civitas.com',
    nombreServicio: 'Internet',
  },
];

export async function seedVisitantes(prisma: PrismaClient) {
  for (const visitante of visitantesData) {
    const usuario = await prisma.usuario.findUnique({
      where: { correo: visitante.correoResidente },
    });

    if (!usuario) {
      throw new Error(`No se encontró el usuario residente ${visitante.correoResidente}.`);
    }

    const residente = await prisma.residente.findFirst({
      where: { id_usuario: usuario.id_usuario },
    });

    if (!residente) {
      throw new Error(`No se encontró residente para ${visitante.correoResidente}.`);
    }

    const servicio = visitante.nombreServicio
      ? await prisma.servicio.findFirst({
          where: { nombre_servicio: visitante.nombreServicio },
        })
      : null;

    const existente = await prisma.visitante.findFirst({
      where: {
        nombre: visitante.nombre,
        id_residente: residente.id_residente,
      },
    });

    const data = {
      nombre: visitante.nombre,
      motivo: visitante.motivo,
      es_frecuente: visitante.es_frecuente,
      id_residente: residente.id_residente,
      id_servicio: servicio?.id_servicio ?? null,
    };

    if (existente) {
      await prisma.visitante.update({
        where: { id_visitante: existente.id_visitante },
        data,
      });
      continue;
    }

    await prisma.visitante.create({ data });
  }
}
