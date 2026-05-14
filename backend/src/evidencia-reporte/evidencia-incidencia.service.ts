import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEvidenciaReporteDto } from './dto/create-evidencia-reporte.dto';
import { UpdateEvidenciaReporteDto } from './dto/update-evidencia-reporte.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EvidenciaReporteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateEvidenciaReporteDto) {
    // Cambiamos la "E" mayúscula por "e" minúscula para coincidir con la sintaxis generada por Prisma
    return await this.prisma.evidenciaReporte.create({
      data: createDto,
    });
  }

  async findAll() {
    return await this.prisma.evidenciaReporte.findMany();
  }

  async findOne(id: string) {
    const evidencia = await this.prisma.evidenciaReporte.findUnique({
      where: { id_evidencia: id },
    });

    if (!evidencia) {
      throw new NotFoundException(`La evidencia con ID ${id} no existe`);
    }

    return evidencia;
  }

  async update(id: string, updateDto: UpdateEvidenciaReporteDto) {
    return await this.prisma.evidenciaReporte.update({
      where: { id_evidencia: id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.evidenciaReporte.delete({
      where: { id_evidencia: id },
    });
  }
}