import {
  PrismaClient,
  TipoReporte,
  EstadoIncidencia,
  PrioridadReporte,
} from '@prisma/client';
import { fakerES_MX as faker } from '@faker-js/faker';

export async function seedReportes(prisma: PrismaClient) {
  console.log('Iniciando el seeder de reportes...');

  const usuarios = await prisma.usuario.findMany({
    select: { id_usuario: true },
  });

  if (usuarios.length === 0) {
    console.error('Error: No hay usuarios en la base de datos.');
    console.error('Debes ejecutar el seeder de usuarios antes que el de reportes.');
    return;
  }

  for (let i = 0; i < 10; i++) {
    const usuarioAleatorio = faker.helpers.arrayElement(usuarios);

    const cantidadEvidencias = faker.number.int({ min: 0, max: 3 });
    
    const evidenciasGeneradas = Array.from({ length: cantidadEvidencias }).map(() => {
      const extension = faker.helpers.arrayElement(['png', 'jpg', 'jpeg']);
      const nombreBase = `${faker.lorem.word()}_${faker.string.alphanumeric(4)}`;
      
      return {
        url_archivo: faker.image.url(),
        nombre_archivo: `${nombreBase}.${extension}`,
      };
    });

    await prisma.reporte.create({
      data: {
        id_usuario: faker.string.uuid(),
        motivo: faker.lorem.sentence().substring(0, 100),
        descripcion: faker.lorem.paragraphs(2),
        tipo: faker.helpers.arrayElement(Object.values(TipoReporte)),
        latitud: faker.location.latitude(),
        longitud: faker.location.longitude(),
        estado: faker.helpers.arrayElement(Object.values(EstadoIncidencia)),
        prioridad: faker.helpers.arrayElement(Object.values(PrioridadReporte)),
        es_anonimo: faker.datatype.boolean(),
        resultado_esperado: faker.helpers.maybe(() => faker.lorem.paragraph()),
        resultado_solucion: faker.helpers.maybe(() => faker.lorem.paragraph()),
        evidencias: {
          create: evidenciasGeneradas,
        },
      },
    });
  }

  console.log(
    'Seeder ejecutado con éxito. Se crearon 10 reportes con sus evidencias.',
  );
}