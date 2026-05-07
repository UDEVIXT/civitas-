import { Controller, Get, Param, Post, Put, Delete } from '@nestjs/common';

@Controller('empleado')
export class EmpleadoController {
  @Get()
  findAll() {
    return { message: 'Lista de empleados' };
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return { message: `Empleado ${id}` };
  }
  @Post()
  create() {
    return { message: 'Empleado creado' };
  }
  @Put(':id')
  update(@Param('id') id: string) {
    return { message: `Empleado ${id} actualizado` };
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return { message: `Empleado ${id} eliminado` };
  }
}
