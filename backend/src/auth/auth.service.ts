import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(nombre_usuario: string, password: string, recordarme = false) {
    try {
      const user = await this.prisma.usuario.findUnique({
        where: {
          nombre_usuario,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }

      if (user.estado === 'SUSPENDIDO') {
        throw new UnauthorizedException({
          message: 'Cuenta suspendida. Contacte soporte.',
          code: 'ACCOUNT_SUSPENDED',
        });
      }

      //Al crear la cuenta, se envía un correo de verificación. El usuario no puede iniciar sesión hasta que verifique su correo.
      if (!user.correo_verificado) {
        throw new UnauthorizedException({
          message: 'Debe verificar su correo electrónico.',
          code: 'EMAIL_NOT_VERIFIED',
        });
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
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error técnico. Intente más tarde.',
      );
    }
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

  // 1. Genera y guarda el código (Cumple CA001, CA002, CA003)
  async forgotPassword(identificador: string) {
    try {
      // Nota: Aquí busco por 'nombre_usuario'. Si en tu BD tienes 'correo' o 'telefono', 
      // ajusta el 'where' para buscar en esos campos específicos.
      const user = await this.prisma.usuario.findFirst({
        where: { nombre_usuario: identificador }, 
      });

      if (!user) {
        // CA002: Mensaje indicando que no existe el usuario
        throw new NotFoundException('No existe un usuario registrado con esa información.');
      }

      // Generar un código numérico seguro de 6 dígitos
      const codigo = crypto.randomInt(100000, 999999).toString();

      // Definir tiempo de expiración (15 minutos a partir de ahora)
      const expiracion = new Date();
      expiracion.setMinutes(expiracion.getMinutes() + 15);

      // Guardar el token y su expiración en la base de datos
      await this.prisma.usuario.update({
        where: { id_usuario: user.id_usuario },
        data: {
          resetPasswordToken: codigo,
          resetPasswordExpires: expiracion,
        },
      });

      // CA003: Simulación de envío del código (Aquí luego irá nodemailer o Twilio)
      console.log(`[SIMULACIÓN - CORREO/SMS] Enviando código de recuperación al usuario ${identificador}: ${codigo}`);

      return { message: 'Si el dato existe, se ha enviado un código de verificación.' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al procesar la solicitud de recuperación.');
    }
  }

  // 2. Valida la vigencia del código (Cumple CA004, CA005)
  async verifyResetCode(identificador: string, codigo: string) {
    const user = await this.prisma.usuario.findFirst({
      where: {
        nombre_usuario: identificador,
        resetPasswordToken: codigo,
      },
    });

    if (!user) {
      throw new UnauthorizedException('El código es incorrecto o no pertenece a este usuario.');
    }

    // CA004: Validación matemática de la fecha de expiración
    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      throw new UnauthorizedException('El código ha expirado. Por favor, solicite uno nuevo.');
    }

    // CA005: El código es correcto y vigente
    return { success: true, message: 'Código verificado correctamente. Puede cambiar su contraseña.' };
  }

  // 3. Restablece la contraseña y limpia la BD (Cumple CA006, CA007)
  async resetPassword(codigo: string, nuevaPassword: string) {
    const user = await this.prisma.usuario.findFirst({
      where: { resetPasswordToken: codigo },
    });

    if (!user) {
      throw new UnauthorizedException('Código de recuperación inválido.');
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      throw new UnauthorizedException('El código ha expirado. Por favor, solicite uno nuevo.');
    }

    try {
      // CA006: Hashear la nueva contraseña
      const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

      // CA007: Actualizar la contraseña y purgar el token de un solo uso
      await this.prisma.usuario.update({
        where: { id_usuario: user.id_usuario },
        data: {
          password: hashedPassword,
          resetPasswordToken: null, // Limpiamos el token para que no se pueda reusar
          resetPasswordExpires: null,
        },
      });

      return { success: true, message: 'Su contraseña ha sido actualizada exitosamente.' };
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar la contraseña.');
    }
  }
}
