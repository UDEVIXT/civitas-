import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReporteDto: CreateReporteDto) {
    return await this.prisma.reporte.create({
      data: createReporteDto,
    });
  }

  async findAll() {
    return await this.prisma.reporte.findMany();
  }

  async findOne(id: string) {
    const reporte = await this.prisma.reporte.findUnique({
      where: { id_reporte: id },
    });

    if (!reporte) {
      throw new NotFoundException(`El reporte con ID ${id} no existe`);
    }

    return reporte;
  }

  async update(id: string, updateReporteDto: UpdateReporteDto) {
    return await this.prisma.reporte.update({
      where: { id_reporte: id },
      data: updateReporteDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.reporte.delete({
      where: { id_reporte: id },
    });
  }
}