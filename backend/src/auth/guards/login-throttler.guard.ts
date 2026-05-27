import { Injectable, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(context: ExecutionContext): Promise<void> {
    throw new HttpException({
        statusCode: HttpStatus.TOO_MANY_REQUESTS, // 429
        message: 'Acceso bloqueado temporalmente por seguridad debido a demasiados intentos fallidos. Intente más tarde.',
        code: 'IP_BLOCKED_TEMPORARY',
    }, HttpStatus.TOO_MANY_REQUESTS);
  }
}
