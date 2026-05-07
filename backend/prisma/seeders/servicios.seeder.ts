import { PrismaClient } from '@prisma/client';

const serviciosData = [
  {
    nombre_servicio: 'Jardinería',
    cargo: 'Jardinero',
    nombre_empresa: 'Jardines Verdes',
    tipo_carro: 'Camioneta',
    placas: 'OAX-123',
    rfc: 'JARV990101XYZ',
  },
  {
    nombre_servicio: 'Plomería',
    cargo: 'Plomero',
    nombre_empresa: 'Plomeros Rápidos',
    tipo_carro: 'Sedan',
    placas: 'OAX-456',
    rfc: 'PLOM880202ABC',
  },
  {
    nombre_servicio: 'Limpieza',
    cargo: 'Personal de Aseo',
    nombre_empresa: 'Clean Express',
    tipo_carro: 'Van',
    placas: 'OAX-789',
    rfc: 'CLEX770303DEF',
  },
  {
    nombre_servicio: 'Internet',
    cargo: 'Técnico',
    nombre_empresa: 'Telmex',
    tipo_carro: 'Camioneta',
    placas: 'OAX-101',
    rfc: 'TELM660404GHI',
  },
  {
    nombre_servicio: 'Comida',
    cargo: 'Repartidor',
    nombre_empresa: 'Tacos Al Pastor',
    tipo_carro: 'Motocicleta',
    placas: 'MOTO-12',
    rfc: null,
  },
];

export async function seedServicios(prisma: PrismaClient) {
  for (const servicio of serviciosData) {
    const servicioExistente = await prisma.servicio.findFirst({
      where: {
        nombre_servicio: servicio.nombre_servicio,
        nombre_empresa: servicio.nombre_empresa,
      },
    });

    if (servicioExistente) {
      await prisma.servicio.update({
        where: { id_servicio: servicioExistente.id_servicio },
        data: servicio,
      });
      continue;
    }

    await prisma.servicio.create({ data: servicio });
  }
}
