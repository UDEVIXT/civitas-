import { Injectable } from '@nestjs/common';

import { EmpleadoService } from '../empleado/empleado.service';

@Injectable()
export class EmpleadoGeneralService {
  constructor(
    private empleadoService: EmpleadoService,
  ) {}

  async obtenerMisEmpleados(
    idResidente: string,
    filters: {
      search?: string;
      page: number;
      limit?: number;
      isActive?: boolean;
    },
  ) {
    const residenteIdNum = parseInt(idResidente, 10);

    return this.empleadoService.obtenerEmpleados({
      ...filters,
      byResidenteId: residenteIdNum,
    });
  }
}