import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { BitacoraService } from './bitacora.service';
import { CreateBitacoraDto } from './dto/create-bitacora.dto';

@Controller('bitacora')
export class BitacoraController {
  constructor(private readonly bitacoraService: BitacoraService) {}

  @Get('proveedores-activos')
  async getProveedoresActivos() {
    const data = await this.bitacoraService.obtenerProveedoresActivos();
    return {
      success: true,
      data,
    };
  }

  @Patch('proveedores/:id_bitacora/salida')
  async registrarSalida(
    @Param('id_bitacora') id_bitacora: string,
    @Body() createBitacoraDto: CreateBitacoraDto,
  ) {
    const { id_guardia, comentario_salida } = createBitacoraDto;

    const resultado = await this.bitacoraService.registrarSalidaProveedor(
      id_bitacora,
      id_guardia,
      comentario_salida,
    );

    return {
      success: true,
      message: 'Salida registrada correctamente',
      data: resultado,
    };
  }
}
