import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { AccesoLoginDto } from './dto/acceso-login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() accesoLoginDto: AccesoLoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const data = await this.authService.login(
      req,
      accesoLoginDto.usuario,
      accesoLoginDto.password || '',
      accesoLoginDto.recordarme,
    );
    const refreshMaxAge = accesoLoginDto.recordarme
      ? 1000 * 60 * 60 * 24 * 30
      : 1000 * 60 * 60 * 24 * 7;

    res.cookie('access_token', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshMaxAge,
    });

    res.cookie('refresh_token', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshMaxAge,
    });

    return {
      user: data.user,
      multipleSessions: data.multipleSessions,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      req.cookies?.refresh_token;

    const data = await this.authService.refresh(
      refreshToken,
    );

    res.cookie('access_token', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 15,
    });

    return {
      success: true,
    };
  }

  // 1. Endpoint para solicitar el código (CA001, CA002, CA003)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // Protección contra spam (3 peticiones por minuto)
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(
      forgotPasswordDto.identificador,
    );
  }

  // 2. Endpoint para verificar si el código es válido y no ha expirado (CA004, CA005)
  @Post('verify-code')
  @HttpCode(HttpStatus.OK)
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    return await this.authService.verifyResetCode(
      verifyCodeDto.identificador,
      verifyCodeDto.codigo,
    );
  }

  // 3. Endpoint para guardar la nueva contraseña (CA006, CA007)
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(
      resetPasswordDto.codigo,
      resetPasswordDto.nuevaPassword,
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,

    @Res({ passthrough: true })
    res: Response,
  ) {
    const refreshToken =
      req.cookies?.refresh_token;

    const result =
      await this.authService.logout(
        refreshToken,
      );

    res.clearCookie('access_token');

    res.clearCookie('refresh_token');

    return result;
  }
}
