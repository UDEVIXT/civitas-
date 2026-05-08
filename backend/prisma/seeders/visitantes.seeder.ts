import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedVisitantes(prisma: PrismaClient) {
  const residentes = await prisma.residente.findMany();
  const servicios = await prisma.servicio.findMany();

  if (residentes.length === 0) {
    console.error('No hay residentes para asignar visitantes.');
    return;
  }

  const motivos = [
    'Visita familiar',
    'Entrega de paquete',
    'Reparación',
    'Servicio técnico',
    'Cita médica',
    'Mudanza',
    'Limpieza',
    'Jardinería',
  ];

  for (let i = 0; i < 50; i++) {
    const residente = faker.helpers.arrayElement(residentes);
    const nombre = faker.person.fullName();
    const motivo = faker.helpers.arrayElement(motivos);
    const es_frecuente = faker.datatype.boolean();
    
    // 50% de probabilidad de tener un servicio asociado
    const servicio = faker.datatype.boolean() 
      ? faker.helpers.arrayElement(servicios) 
      : null;

    const existente = await prisma.visitante.findFirst({
      where: {
        nombre: nombre,
        id_residente: residente.id_residente,
      },
    });

    const data = {
      nombre: nombre,
      motivo: motivo,
      es_frecuente: es_frecuente,
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
