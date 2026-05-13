import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(nombre_usuario: string, password: string, recordarme = false) {
    const user = await this.prisma.usuario.findUnique({
      where: {
        nombre_usuario,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = {
      sub: user.id_usuario,
      username: user.nombre_usuario,
      role: user.rol,
    };

    const refreshExpiresIn = recordarme ? '30d' : '7d';

    const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret:
            process.env.JWT_ACCESS_SECRET,

          expiresIn: '15m',
        }),

        this.jwtService.signAsync(payload, {
          secret:
            process.env.JWT_REFRESH_SECRET,

          expiresIn: refreshExpiresIn,
        }),
      ]);

    return {
      accessToken,
      refreshToken,
      refreshExpiresIn,

      user: {
        id: user.id_usuario,
        nombre: user.nombre_usuario,
        rol: user.rol,
      },
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token requerido');
    }

    try {
      const payload =
        await this.jwtService.verifyAsync(
          refreshToken,
          {
            secret:
              process.env.JWT_REFRESH_SECRET},
        );

      const newPayload = {
        sub: payload.sub,
        username: payload.username,
        role: payload.role,
      };

      const accessToken =
        await this.jwtService.signAsync(
          newPayload,
          {
            secret:
              process.env.JWT_ACCESS_SECRET,

            expiresIn: '15m',
          },
        );

      return {
        accessToken,
      };
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }
}
