import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEvidenciaIncidenciaDto } from './dto/create-evidencia-incidencia.dto';
import { UpdateEvidenciaIncidenciaDto } from './dto/update-evidencia-incidencia.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EvidenciaIncidenciaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateEvidenciaIncidenciaDto) {
    return await this.prisma.evidenciaIncidencia.create({
      data: createDto,
    });
  }

  async findAll() {
    return await this.prisma.evidenciaIncidencia.findMany();
  }

  async findOne(id: string) {
    const evidencia = await this.prisma.evidenciaIncidencia.findUnique({
      where: { id_evidencia: id },
    });

    if (!evidencia) {
      throw new NotFoundException(`La evidencia con ID ${id} no existe`);
    }

    return evidencia;
  }

  async update(id: string, updateDto: UpdateEvidenciaIncidenciaDto) {
    return await this.prisma.evidenciaIncidencia.update({
      where: { id_evidencia: id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.evidenciaIncidencia.delete({
      where: { id_evidencia: id },
    });
  }
}