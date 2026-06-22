import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { NotificacionModule } from '../notificacion/notificacion.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailModule } from '../mail/mail.module';
import { SolicitudAdministradorGuardiaModule } from '../solicitud_administrador_guardia/solicitud_administrador_guardia.module';
import { ArchivosModule } from '../r2-module/archivos.module';

@Module({
  imports: [
    JwtModule.register({
      secret:
        process.env.JWT_ACCESS_SECRET ||
        '4a0d93fead03227849de7451c15c4809e7dbaebfb0d6e82ea7a6ee1af48e66f0',

      signOptions: {
        expiresIn: '1d',
      },
    }),
    NotificacionModule,
    MailModule,
    SolicitudAdministradorGuardiaModule,
    ArchivosModule,
  ],

  controllers: [AuthController],

  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
