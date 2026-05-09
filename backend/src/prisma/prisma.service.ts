import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    let connectionString = process.env.DATABASE_URL;

    // Si estamos dentro de Docker, reemplazamos localhost por el nombre del servicio 'postgres'
    if (process.env.DOCKER_CONTAINER === 'true' && connectionString) {
      connectionString = connectionString.replace('localhost', 'postgres');
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Prisma conectado con éxito');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
