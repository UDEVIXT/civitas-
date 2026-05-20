import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedServicios(prisma: PrismaClient) {
  const tiposServicio = await prisma.tipoServicio.findMany();

  if (tiposServicio.length === 0) {
    console.error('No hay tipos de servicio para asignar.');
    return;
  }

  const residentes = await prisma.residente.findMany();

  if (residentes.length === 0) {
    console.error('No hay residentes para asignar servicios.');
    return;
  }

  const serviciosBase = [
    'Jardinería',
    'Plomería',
    'Limpieza',
    'Internet',
    'Comida',
    'Seguridad',
    'Electricidad',
    'Mantenimiento',
    'Paquetería',
    'Gas',
  ];

  for (const nombreServicio of serviciosBase) {
    const cargo = faker.person.jobTitle();
    const nombreEmpresa = faker.company.name();
    const tipoCarro = faker.vehicle.type();
    const placas = faker.vehicle.vrm();
    const rfc = faker.helpers.replaceSymbols('????######???').toUpperCase();

    const tipoServicio = faker.helpers.arrayElement(tiposServicio);

    const residente = faker.helpers.arrayElement(residentes);

    const fechaRegistro = new Date(faker.date.past());

    const servicioExistente = await prisma.servicio.findFirst({
      where: {
        nombre_servicio: nombreServicio,
        nombre_empresa: nombreEmpresa,
      },
    });

    const data = {
      nombre_servicio: nombreServicio,

      cargo,

      nombre_empresa: nombreEmpresa,

      tipo_carro: tipoCarro,

      placas,

      rfc: faker.datatype.boolean() ? rfc : null,

      id_tipo_servicio: tipoServicio.id_tipo_servicio,

      id_residente: residente.id_residente,
      id_vivienda: residente.id_vivienda,

      activo: true,

      fecha_registro: fechaRegistro,
    };

    if (servicioExistente) {
      await prisma.servicio.update({
        where: { id_servicio: servicioExistente.id_servicio },
        data,
      });

      continue;
    }

    await prisma.servicio.create({
      data,
    });
  }

  for (let i = 0; i < 20; i++) {
    const nombreServicio = faker.commerce.department();

    const nombreEmpresa = faker.company.name();

    const tipoServicio = faker.helpers.arrayElement(tiposServicio);

    const residente = faker.helpers.arrayElement(residentes);
    await prisma.servicio.create({
      data: {
        nombre_servicio: nombreServicio,

        cargo: faker.person.jobTitle(),

        nombre_empresa: nombreEmpresa,

        tipo_carro: faker.vehicle.type(),

        placas: faker.vehicle.vrm(),

        id_tipo_servicio: tipoServicio.id_tipo_servicio,

        id_residente: residente.id_residente,

        id_vivienda: residente.id_vivienda,

        activo: true,
      },
    });
  }
}
