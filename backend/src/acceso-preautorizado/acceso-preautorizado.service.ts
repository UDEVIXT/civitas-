import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAccesoPreautorizadoDto } from './dto/create-acceso-preautorizado.dto';
import { UpdateAccesoPreautorizadoDto } from './dto/update-acceso-preautorizado.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccesoPreautorizadoService {
  constructor(private prisma: PrismaService) {}

  create(createAccesoPreautorizadoDto: CreateAccesoPreautorizadoDto) {
    return 'This action adds a new accesoPreautorizado';
  }

  async findAll() {
    try {
      return await this.prisma.accesoPreautorizado.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Error al obtener accesos preautorizados:', error);
      throw new InternalServerErrorException('Error al recuperar los registros de la base de datos.');
    }
  }

  findOne(id: string) {
    return `This action returns a #${id} accesoPreautorizado`;
  }

  update(id: string, updateAccesoPreautorizadoDto: UpdateAccesoPreautorizadoDto) {
    return `This action updates a #${id} accesoPreautorizado`;
  }

  remove(id: string) {
    return `This action removes a #${id} accesoPreautorizado`;
  }
}