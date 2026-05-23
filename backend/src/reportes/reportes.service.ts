import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  private generarTokenSeguimiento(): string {  
    return `REP-${randomUUID().slice(0, 8).toUpperCase()}`;
  }

  async crearConEvidencia(datos: any) {
    const latitud = parseFloat(datos.latitud);
    const longitud = parseFloat(datos.longitud);
    const es_anonimo = datos.es_anonimo === 'true' || datos.es_anonimo === true;

    return this.prisma.reporte.create({
      data: {
        id_usuario: datos.id_usuario,
        motivo: datos.motivo,
        descripcion: datos.descripcion,
        tipo: datos.tipo,
        latitud: latitud,
        longitud: longitud,
        estado: datos.estado || 'PENDIENTE',
        prioridad: datos.prioridad || 'MEDIA',
        es_anonimo: es_anonimo,

        token_seguimiento: es_anonimo 
          ? this.generarTokenSeguimiento()
          : null,
        
      },
    });
  }

  async obtenerTodos() {
    return this.prisma.reporte.findMany({
      include: {
      evidencias: true,
    }
    });
  }

  async
  
}