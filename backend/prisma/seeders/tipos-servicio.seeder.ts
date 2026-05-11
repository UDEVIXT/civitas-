import { PrismaClient } from '@prisma/client';

export const seedTipoServicio = async (prisma: PrismaClient) => {
  console.log('Seeding TipoServicio...');

  const tipos = [
    {
      nombre: 'Limpieza Doméstica',
      categoria: 'Empleado',
      descripcion: 'Personal encargado de la limpieza de las viviendas.',
    },
    {
      nombre: 'Empleado',
      categoria: 'Mantenimiento',
      descripcion: 'Personal encargado del mantenimiento de áreas verdes.',
    },
    {
      nombre: 'Repartidor de Comida',
      categoria: 'Repartidor',
      descripcion:
        'Servicios de entrega de alimentos (Uber Eats, Rappi, etc.).',
    },
    {
      nombre: 'Paquetería',
      categoria: 'Repartidor',
      descripcion:
        'Servicios de entrega de paquetes (Amazon, Mercado Libre, etc.).',
    },
    {
      nombre: 'Mantenimiento Eléctrico',
      categoria: 'Mantenimiento',
      descripcion: 'Personal técnico para reparaciones eléctricas.',
    },
    {
      nombre: 'Proveedor de Insumos',
      categoria: 'Proveedor',
      descripcion:
        'Empresas que surten productos a la administración o residentes.',
    },
    {
      nombre: 'Empleado Administrativo',
      categoria: 'Empleado',
      descripcion: 'Personal de oficina del residencial.',
    },
  ];

  for (const tipo of tipos) {
    await prisma.tipoServicio.upsert({
      where: { nombre: tipo.nombre },
      update: {},
      create: tipo,
    });
  }

  console.log('TipoServicio seeded successfully!');
};
