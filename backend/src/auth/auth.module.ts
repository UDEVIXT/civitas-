import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { JwtStrategy } from './strategies/jwt.strategy';

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
  ],

  controllers: [AuthController],

  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
