import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';

import type { Response } from 'express';
import { AuthService } from './auth.service';
import { AccesoLoginDto } from './dto/acceso-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() accesoLoginDto: AccesoLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.login(
      accesoLoginDto.usuario,
      accesoLoginDto.password || '',
    );

    res.cookie('access_token', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 15,
    });

    res.cookie('refresh_token', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return {
      user: data.user,
    };
  }
}
