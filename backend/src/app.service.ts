import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'SERVIDOR BACKEND DE CIVITAS FUNCIONANDO CORRECTAMENTE';
  }
}
