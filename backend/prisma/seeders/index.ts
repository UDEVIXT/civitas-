import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { seedUsuarios } from './usuarios.seeder';
import { seedAdministradores } from './administradores.seeder';
import { seedGuardias } from './guardias.seeder';
import { seedViviendas } from './viviendas.seeder';
import { seedResidentes } from './residentes.seeder';
import { seedServicios } from './servicios.seeder';
import { seedTipoServicio } from './tipos-servicio.seeder';
import { seedHorariosAccesoServicios } from './horarios-acceso-servicios.seeder';
import { seedVisitantes } from './visitantes.seeder';
import { seedAccesos } from './accesos.seeder';
import { seedBitacoras } from './bitacoras.seeder';
import { seedReportes } from './reportes.seeder';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function truncateAll(prismaClient: PrismaClient) {
  await prismaClient.$executeRawUnsafe(`
    TRUNCATE TABLE
      "Bitacora",
      "Acceso",
      "Visitante",
      "HorarioAccesoServicios",
      "Servicio",
      "Residente",
      "Guardia",
      "Administrador",
      "Usuario",
      "Vivienda",
      "Persona",
      "TipoServicio",
      "Reporte",
      "EvidenciaIncidencia"
    RESTART IDENTITY CASCADE;
  `);
}

async function main() {
  console.log('Iniciando seed modular de Civitas...');

  await truncateAll(prisma);

  await seedUsuarios(prisma);
  await seedAdministradores(prisma);
  await seedGuardias(prisma);
  await seedViviendas(prisma);
  await seedResidentes(prisma);
  await seedTipoServicio(prisma);
  await seedServicios(prisma);
  await seedVisitantes(prisma);
  await seedHorariosAccesoServicios(prisma);
  await seedAccesos(prisma);
  await seedBitacoras(prisma);
  await seedReportes(prisma)

  console.log('Seed modular ejecutado correctamente.');
}

main()
  .catch((error) => {
    console.error('Error al ejecutar el seed modular:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
