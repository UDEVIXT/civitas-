/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';

@Injectable()
export class VisitanteService {
  constructor(private prisma: PrismaService) {}

  async create(
    createVisitanteDto: CreateVisitanteDto,
    id_usuario: string,
    file?: Express.Multer.File,
  ) {
    const dataVisitante = createVisitanteDto;

    //Obtenemos el ID del residente asociado al usuario que hace la petición
    const residente = await this.prisma.residente.findFirst({
      where: { id_usuario: id_usuario },
      select: { id_residente: true },
    });

    if (!residente) {
      throw new NotFoundException('Residente not found for the given user ID');
    }

    //Validamos si fecha_fin es undefined, entonces será igual a la fecha de inicio (acceso de una sola ocasión)
    const fechaExpiracion =
      dataVisitante.fecha_fin || dataVisitante.fecha_inicio;

    //Registramos al visitante con sus datos
    return await this.prisma.$transaction(async (prisma) => {
      try {
        const visitante = await prisma.visitante.create({
          data: {
            nombre: dataVisitante.nombre,
            es_frecuente: dataVisitante.es_frecuente,
            telefono: dataVisitante.telefono,
            tipo_vehiculo: dataVisitante.tipo_vehiculo,
            motivo: dataVisitante.tipo_visitante,
            url_imagen: null,
            residente: {
              connect: { id_residente: residente.id_residente },
            },
            accesos: {
              create: {
                id_usuario: id_usuario,
                estatus: 'Activo',
                codigo_qr: randomStringGenerator(),
                fecha_creacion: dataVisitante.fecha_inicio,
                fecha_expiracion: fechaExpiracion,
              },
            },
          },
        });
        return visitante;
      } catch (error) {
        console.error('Error creating visitante:', error);
        throw new InternalServerErrorException('Failed to create visitante');
      }
    });
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
