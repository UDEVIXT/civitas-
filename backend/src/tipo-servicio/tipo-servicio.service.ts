import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TipoServicioService {
  constructor(private prisma: PrismaService) {}

  async findAll(categoria?: string) {
    return this.prisma.tipoServicio.findMany({
      where: categoria ? { categoria } : undefined,
      orderBy: { nombre: 'asc' },
    });
  }
}
