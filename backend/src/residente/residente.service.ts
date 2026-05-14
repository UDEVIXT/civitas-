import { Injectable } from '@nestjs/common';
import { CreateResidenteDto } from './dto/create-residente.dto';
import { UpdateResidenteDto } from './dto/update-residente.dto';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResidenteService {
  constructor(private prisma: PrismaService) {}

  create(createResidenteDto: CreateResidenteDto) {
    return 'This action adds a new residente';
  }

  async findAll() {
    const residentes = await Promise.all([
      this.prisma.residente.findMany({
        select: {
          id_residente: true,
          usuario: {
            select: {
              id_usuario: true,
              persona: {
                select: {
                  url_imagen: true,
                  nombre: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return residentes;
  }

  findOne(id: number) {
    return `This action returns a #${id} residente`;
  }

  update(id: number, updateResidenteDto: UpdateResidenteDto) {
    return `This action updates a #${id} residente`;
  }

  remove(id: number) {
    return `This action removes a #${id} residente`;
  }
}
