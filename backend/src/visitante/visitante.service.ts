import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitanteDto } from './dto/create-visitante.dto';
import { UpdateVisitanteDto } from './dto/update-visitante.dto';
import 'multer';

@Injectable()
export class VisitanteService {
  constructor(private prisma: PrismaService) {}

  create(createVisitanteDto: CreateVisitanteDto, file: Express.Multer.File) {
    const dataVisitante = createVisitanteDto;
    /*
    const visitante = this.prisma.$transaction(async (prisma) => {
      try {
        const createdVisitante = await prisma.visitante.create({
          data: {
            nombre: dataVisitante.nombre,
            es_frecuente: dataVisitante.es_frecuente,

            //tipo_visitante: data.tipo_visitante,
            telefono: dataVisitante.telefono,
            //tipo_vehiculo: data.tipo_vehiculo,
          },
        });
        return createdVisitante;
      } catch (error: any) {
        throw new InternalServerErrorException(
          'Error al crear el visitante',
          error.message,
        );
      }
    });
    */
    return 'Visitante creado exitosamente';
  }

  findAll() {
    return `This action returns all visitante`;
  }

  findOne(id: number) {
    return `This action returns a #${id} visitante`;
  }

  update(id: number, updateVisitanteDto: UpdateVisitanteDto) {
    return `This action updates a #${id} visitante`;
  }

  remove(id: number) {
    return `This action removes a #${id} visitante`;
  }
}
