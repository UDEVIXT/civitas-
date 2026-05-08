import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedServicios(prisma: PrismaClient) {
  const tiposServicio = await prisma.tipoServicio.findMany();

  if (tiposServicio.length === 0) {
    console.error('No hay tipos de servicio para asignar a los servicios.');
    return;
  }

  const serviciosBase = [
    'Jardinería', 'Plomería', 'Limpieza', 'Internet', 'Comida', 
    'Seguridad', 'Electricidad', 'Mantenimiento', 'Paquetería', ' Gas'
  ];

  for (const nombreServicio of serviciosBase) {
    const cargo = faker.person.jobTitle();
    const nombreEmpresa = faker.company.name();
    const tipoCarro = faker.vehicle.type();
    const placas = faker.vehicle.vrm();
    const rfc = faker.helpers.replaceSymbols('????######???').toUpperCase();
    const tipoServicio = faker.helpers.arrayElement(tiposServicio);

    const servicioExistente = await prisma.servicio.findFirst({
      where: {
        nombre_servicio: nombreServicio,
        nombre_empresa: nombreEmpresa,
      },
    });

    const data = {
      nombre_servicio: nombreServicio,
      cargo: cargo,
      nombre_empresa: nombreEmpresa,
      tipo_carro: tipoCarro,
      placas: placas,
      rfc: faker.datatype.boolean() ? rfc : null,
      id_tipo_servicio: tipoServicio.id_tipo_servicio,
      activo: true
    };

    if (servicioExistente) {
      await prisma.servicio.update({
        where: { id_servicio: servicioExistente.id_servicio },
        data,
      });
      continue;
    }

    await prisma.servicio.create({ data });
  }

  // Generar servicios aleatorios adicionales
  for (let i = 0; i < 20; i++) {
    const nombreServicio = faker.commerce.department();
    const nombreEmpresa = faker.company.name();
    const tipoServicio = faker.helpers.arrayElement(tiposServicio);

    await prisma.servicio.create({
      data: {
        nombre_servicio: nombreServicio,
        cargo: faker.person.jobTitle(),
        nombre_empresa: nombreEmpresa,
        tipo_carro: faker.vehicle.type(),
        placas: faker.vehicle.vrm(),
        id_tipo_servicio: tipoServicio.id_tipo_servicio,
        activo: true
      },
    });
  }
}
