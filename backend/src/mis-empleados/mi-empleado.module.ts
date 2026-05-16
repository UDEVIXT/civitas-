import { Module } from '@nestjs/common';
import { EmpleadoController } from './mi-empleado.controller'; // Tu controlador
import { EmpleadoService } from './mi-empleado.service';       // Tu servicio
import { PrismaService } from '../prisma/prisma.service';       // Importamos Prisma obligatorio

@Module({
  controllers: [EmpleadoController],
  providers: [EmpleadoService, PrismaService], // Agregamos PrismaService aquí
})
export class MiEmpleadoModule {} // <--- CAMBIADO: Nombre único para que NestJS no se confunda