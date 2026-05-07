import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]
);

    if (!requiredRoles) {
      return true;
    }

    const request =
      context.switchToHttp().getRequest();

    // TEMPORAL
    request.user = {
      rol: 'Guardia', //Probar con 'Guardia', 'Admin', 'Usuario' para verificar que el guard funcione correctamente
    };
    //DESPUES request.user se llenará con la información del usuario autenticado, incluyendo su rol.

    return requiredRoles.includes(
      request.user.rol,
    );
  }
}
