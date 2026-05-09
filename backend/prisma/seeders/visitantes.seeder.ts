import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedVisitantes(prisma: PrismaClient) {
  const residentes = await prisma.residente.findMany();
  const tiposServicio = await prisma.tipoServicio.findMany();

  if (residentes.length === 0) {
    console.error('No hay residentes para asignar visitantes.');
    return;
  }

  if (tiposServicio.length === 0) {
    console.error('No hay tipos de servicio para asignar a visitantes.');
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

  for (let i = 0; i < 200; i++) {
    const residente = faker.helpers.arrayElement(residentes);
    const nombre = faker.person.fullName();
    const telefono = faker.phone.number({ style: 'national' });
    const url_imagen = faker.image.url();
    const motivo = faker.helpers.arrayElement(motivos);
    const es_frecuente = faker.datatype.boolean();

    // 50% de probabilidad de tener un servicio asociado
    const requiereServicio = faker.datatype.boolean();
    let servicioId: string | null = null;

    if (requiereServicio) {
      const tipoServicio = faker.helpers.arrayElement(tiposServicio);
      const servicio = await prisma.servicio.create({
        data: {
          nombre_servicio: faker.commerce.department(),
          cargo: faker.person.jobTitle(),
          nombre_empresa: faker.company.name(),
          tipo_carro: faker.vehicle.type(),
          placas: null,
          rfc: null,
          id_tipo_servicio: tipoServicio.id_tipo_servicio,
          activo: true,
        },
      });
      servicioId = servicio.id_servicio;
    }

    const existente = await prisma.visitante.findFirst({
      where: {
        nombre: nombre,
        id_residente: residente.id_residente,
      },
    });

    const data = {
      nombre: nombre,
      motivo: motivo,
      telefono: telefono,
      url_imagen: url_imagen,
      es_frecuente: es_frecuente,
      id_residente: residente.id_residente,
      id_servicio: servicioId,
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
