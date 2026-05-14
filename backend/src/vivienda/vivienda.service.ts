import { Injectable } from '@nestjs/common';
import { CreateViviendaDto } from './dto/create-vivienda.dto';
import { UpdateViviendaDto } from './dto/update-vivienda.dto';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ViviendaService {
  constructor(private prisma: PrismaService) {}

  create(createViviendaDto: CreateViviendaDto) {
    return 'This action adds a new vivienda';
  }

  async findAll() {
    const viviendas = await this.prisma.vivienda.findMany({
      select: {
        id_vivienda: true,
        numero_vivienda: true,
      },
    });

    return {
      success: true,
      data: viviendas,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} vivienda`;
  }

  update(id: number, updateViviendaDto: UpdateViviendaDto) {
    return `This action updates a #${id} vivienda`;
  }

  remove(id: number) {
    return `This action removes a #${id} vivienda`;
  }
}
