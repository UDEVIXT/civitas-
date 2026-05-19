import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccesosServiciosService {
  constructor(private prisma: PrismaService) {}

  async obtenerActividadReciente() {
    // Mock data por instrucciones de la HU (no implementar consultas basadas en Visitante)
    return [
      {
        id: 'mock-1',
        nombre_repartidor: 'Juan Pérez (Amazon)',
        residente_vinculado: 'Familia López (Vivienda 102)',
        tiempo_transcurrido: 'Hace 5 min',
        estado: 'AUTORIZADO',
      },
      {
        id: 'mock-2',
        nombre_repartidor: 'Repartidor UberEats',
        residente_vinculado: 'Carlos Ruiz (Vivienda 204)',
        tiempo_transcurrido: 'Hace 1 hora',
        estado: 'RECHAZADO',
      },
    ];
  }

  async obtenerDetalleServicio(id: string) {
    // Mock data
    return {
      id: id,
      nombre_repartidor: 'Juan Pérez',
      empresa: 'Amazon Logistics',
      residente_vinculado: 'Familia López',
      vivienda: '102',
      fecha_programada: 'Hoy, 14:00 - 18:00',
      tipo_servicio: 'Paquetería',
    };
  }

  async validarAcceso(id: string, idGuardia: string) {
    // Simula la validación sin registrar la entrada de un "visitante" en bitácora
    return { success: true, message: 'Acceso de servicio autorizado' };
  }

  async denegarAcceso(id: string, idGuardia: string, motivo: string) {
    // Simula la denegación y registro de incidencia
    return { success: true, message: 'Acceso denegado e incidencia registrada' };
  }
}
