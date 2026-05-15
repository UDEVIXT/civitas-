import { Module } from '@nestjs/common';
import { AuthGateway } from './gateways/auth.gateway';

@Module({
  providers: [AuthGateway],
  exports: [AuthGateway],
})
export class NotificacionModule {}
