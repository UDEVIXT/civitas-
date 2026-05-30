import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  HttpException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGateway } from '../notificacion/gateways/auth.gateway';
import { Request } from 'express';
import { MailerService } from '@nestjs-modules/mailer';
import { RegisterDto } from './dto/register.dto';
import { ValidarCredencialDto } from './dto/validar-credencial.dto';
import { createWorker } from 'tesseract.js';
import { NotFoundException } from '@nestjs/common';
import { SolicitudAdministradorGuardiaService } from '../solicitud_administrador_guardia/solicitud_administrador_guardia.service';
import { Estatus_Solicitud } from '@prisma/client';

function detectarDispositivo(userAgent?: string) {
  if (!userAgent) {
    return 'Desconocido';
  }

  if (userAgent.includes('Android')) {
    return 'Android';
  }

  if (userAgent.includes('iPhone')) {
    return 'iPhone';
  }

  if (userAgent.includes('Windows')) {
    return 'Windows PC';
  }

  if (userAgent.includes('Mac')) {
    return 'Mac';
  }

  return 'Otro';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly authGateway: AuthGateway,
    private readonly mailerService: MailerService,
    private readonly solicitudService: SolicitudAdministradorGuardiaService,
  ) {}

  async register(dto: RegisterDto) {
    const {
      nombre,
      genero,
      fecha_nacimiento,
      telefono,
      nombre_usuario,
      correo,
      password,
      confirmPassword,
      rol,
      verificationAccessToken,
    } = dto;

    /*
    try {
      const payload = await this.jwtService.verifyAsync(
        verificationAccessToken,
        {
          secret: process.env.JWT_REGISTER_SECRET,
        },
      );

      if (!payload.credencial_validada) {
        throw new UnauthorizedException('La credencial no fue validada.');
      }

      if (payload.rol !== rol) {
        throw new UnauthorizedException(
          'El rol no coincide con la validación.',
        );
      }
    } catch {
      throw new UnauthorizedException(
        'La validación de credencial expiró o es inválida.',
      );
    }*/
   
    // VALIDAR PASSWORDS CA006 — Password y confirmación distintas
    if (password !== confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden.');
    }

    // VALIDAR CORREO DUPLICADO CA004 — Correo duplicado
    const correoExistente = await this.prisma.usuario.findUnique({
      where: {
        correo,
      },
    });

    if (correoExistente) {
      throw new ConflictException(
        'El correo ya está registrado. Puedes iniciar sesión o recuperar tu contraseña.',
      );
    }

    const usernameExistente = await this.prisma.usuario.findUnique({
      where: {
        nombre_usuario,
      },
    });

    if (usernameExistente) {
      throw new ConflictException(
        'El nombre de usuario ya se encuentra en uso.',
      );
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomUUID();
      const usuarioCreado = await this.prisma.$transaction(async (tx) => {
        const persona = await tx.persona.create({
          data: {
            nombre,
            genero,
            fecha_nacimiento: new Date(fecha_nacimiento),
            telefono,
          },
        });

        const usuario = await tx.usuario.create({
          data: {
            nombre_usuario,
            correo,
            password: hashedPassword,
            rol,
            id_persona: persona.id_persona,
            token_verificacion: verificationToken,
            correo_verificado: false,
          },
          include: {
            persona: true,
          },
        });

        return usuario;
      });

      if(rol == 'Guardia' || rol == 'Administrador'){
            const parametros = {
            id_usuario: usuarioCreado.id_usuario,
            rol_solicitado: rol,
            estatus_solicitud: 'Pendiente' as Estatus_Solicitud,
            nombre,
            genero,
            fecha_nacimiento,
            telefono,
            correo
            };

          try{
            const nuevaSolicitud = await this.solicitudService.create(parametros);
          }catch(BadRequestException){
            throw new ConflictException(
              'No se pudo crear el usuario con rol Guardia/Administrador.',
            );
          }
          
        }

      // ENVIAR CORREO BIENVENIDA - CA001
      try {
        await this.mailerService.sendMail({
          to: usuarioCreado.correo,
          subject: 'Bienvenido a Civitas',
          template: './bienvenida',
          context: {
            nombre: usuarioCreado.persona.nombre,
            verificationToken,
          },
        });
      } catch (mailError) {
        console.error('Error enviando correo:', mailError);

        // No bloqueamos el registro si falla el correo
      }

      // -------------------------------------------------
      // RESPUESTA
      // -------------------------------------------------
      return {
        id_usuario: usuarioCreado.id_usuario,
        nombre: usuarioCreado.persona.nombre,
        correo: usuarioCreado.correo,
        rol: usuarioCreado.rol,
        correo_verificado: usuarioCreado.correo_verificado,
      };
    } catch (error) {
      console.error('ERROR REGISTER:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Ocurrió un problema temporal al registrar la cuenta. Intenta nuevamente.',
      );
    }
  }

async verifyEmail(token: string) {
  const user = await this.prisma.usuario.findFirst({
    where: { token_verificacion: token },
  });

  if (!user) {
    throw new BadRequestException('Token de verificación inválido o expirado.');
  }

  if (user.correo_verificado) {
    return { message: 'El correo ya ha sido verificado anteriormente.' };
  }

  // Actualizar el estado del usuario
  await this.prisma.usuario.update({
    where: { id_usuario: user.id_usuario },
    data: {
      correo_verificado: true,
      token_verificacion: null, // Opcional: limpiar el token una vez usado
    },
  });

  return {
    success: true,
    message: 'Correo verificado exitosamente. Ya puedes iniciar sesión.',
  };
}

  async validarCredencial(
    dto: ValidarCredencialDto,
    archivos: {
      frente?: Express.Multer.File[];
      reverso?: Express.Multer.File[];
    },
  ) {
    // ---------------------------------------------
    // VALIDAR ARCHIVOS
    // ---------------------------------------------
    const frente = archivos.frente?.[0];
    const reverso = archivos.reverso?.[0];

    if (!frente || !reverso) {
      throw new BadRequestException(
        'Debes subir frente y reverso de la credencial.',
      );
    }

    // ---------------------------------------------
    // OCR
    // ---------------------------------------------

    const worker = await createWorker('spa');

    const {
      data: { text: textoFrente },
    } = await worker.recognize(frente.buffer);

    //console.log(textoFrente);

    const {
      data: { text: textoReverso },
    } = await worker.recognize(reverso.buffer);

    //console.log(textoReverso);

    await worker.terminate();

    // ---------------------------------------------
    // TEXTO COMPLETO
    // ---------------------------------------------
    const textoDetectado = (textoFrente + ' ' + textoReverso).toUpperCase();

    // ---------------------------------------------
    // PALABRAS CLAVE
    // ---------------------------------------------
    const palabrasClave = [
      'INSTITUTO',
      'ELECTORAL',
      'CREDENCIAL',
      'VOTAR',
      'MEXICO',
      'CURP',
    ];

    const coincidencias = palabrasClave.filter((palabra) =>
      textoDetectado.includes(palabra),
    );

    //console.log('\n===== COINCIDENCIAS =====');
    //console.log(coincidencias);

    //console.log('TOTAL COINCIDENCIAS:', coincidencias.length);

    // ---------------------------------------------
    // VALIDAR INE
    // ---------------------------------------------
    if (coincidencias.length < 2) {
      console.log('\nNO PASO VALIDACION INE');

      throw new UnauthorizedException(
        'La imagen no parece ser una credencial INE válida.',
      );
    }

    console.log('\nVALIDACION INE EXITOSA');
    //console.log('\nROL RECIBIDO:', dto.rol);

    if (
      dto.rol !== 'Administrador' &&
      dto.rol !== 'Guardia' &&
      dto.rol !== 'Residente'
    ) {
      //console.log('\nROL INVALIDO');

      throw new UnauthorizedException('Rol no permitido para validación.');
    }

    //console.log('\n ROL VALIDO');

    // ---------------------------------------------
    // TOKEN TEMPORAL
    // ---------------------------------------------

    const payload = {
      rol: dto.rol,
      credencial_validada: true,
      jti: crypto.randomUUID(),
    };

    //console.log('PAYLOAD JWT:', payload);

    const verificationAccessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REGISTER_SECRET,
      expiresIn: '10m',
    });

    //console.log('\nTOKEN GENERADO');

    return {
      success: true,
      verificationAccessToken,
    };
  }

  async login(
    req: Request,
    nombre_usuario: string,
    password: string,
    recordarme = false,
  ) {
    console.log('[DEBUG] AuthService.login invoked for user:', nombre_usuario);
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

      const sesionesActivas = await this.prisma.sesion.count({
        where: {
          id_usuario: user.id_usuario,
          activo: true,
        },
      });

      const payload = {
        sub: user.id_usuario,
        username: user.nombre_usuario,
        role: user.rol,
      };

      const refreshExpiresIn = recordarme ? '30d' : '7d';

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: process.env.JWT_ACCESS_SECRET,

          expiresIn: '15m',
        }),

        this.jwtService.signAsync(payload, {
          secret: process.env.JWT_REFRESH_SECRET,

          expiresIn: refreshExpiresIn,
        }),
      ]);

      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

      await this.prisma.sesion.create({
        data: {
          id_usuario: user.id_usuario,
          refresh_token: hashedRefreshToken,
          activo: true,
          ip: req.ip,

          user_agent: req.headers['user-agent'],

          dispositivo: detectarDispositivo(req.headers['user-agent']),
        },
      });

      if (sesionesActivas > 0) {
        this.authGateway.notifyNewLogin(user.id_usuario, {
          message: 'Nuevo inicio de sesión detectado en otro dispositivo.',
        });
      }

      return {
        accessToken,
        refreshToken,
        refreshExpiresIn,
        multipleSessions: sesionesActivas > 0,
        user: {
          id: user.id_usuario,
          nombre: user.nombre_usuario,
          rol: user.rol,
        },
      };
    } catch (error) {
      //console.error('Error en login:', error);
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException({
        statusCode: 500,
        message:
          'Error técnico de la plataforma. Por favor, intente más tarde.',
        code: 'INTERNAL_TECHNICAL_ERROR',
      });
    }
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token requerido');
    }

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const sesiones = await this.prisma.sesion.findMany({
        where: {
          id_usuario: payload.sub,
          activo: true,
        },
      });

      let tokenValido = false;

      for (const sesion of sesiones) {
        const match = await bcrypt.compare(refreshToken, sesion.refresh_token);

        if (match) {
          tokenValido = true;
          break;
        }
      }

      if (!tokenValido) {
        throw new UnauthorizedException('Sesión inválida');
      }

      const newPayload = {
        sub: payload.sub,
        username: payload.username,
        role: payload.role,
      };

      const accessToken = await this.jwtService.signAsync(newPayload, {
        secret: process.env.JWT_ACCESS_SECRET,

        expiresIn: '15m',
      });

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
      // CA001: Verificar que el usuario exista (por username O por correo)
      const user = await this.prisma.usuario.findFirst({
        where: {
          OR: [
            { nombre_usuario: identificador },
            { correo: identificador }, // Ajusta 'correo' al nombre real de tu columna en schema.prisma
          ],
        },
      });

      if (!user) {
        // Lanza un error 404 directo al frontend
        throw new NotFoundException(
          'El usuario asociado a este correo no existe.',
        );
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

      await this.mailerService.sendMail({
        to: user.correo, // Asumiendo que el 'identificador' es un correo
        subject: 'Código de Recuperación - Civitas',
        template: './recuperacion', // Busca recuperacion.hbs
        context: {
          nombre: user.nombre_usuario,
          codigo: codigo,
        },
      });

      return {
        message: 'Si el dato existe, se ha enviado un código de verificación.',
      };
    } catch (error) {
      // --- AÑADE ESTA LÍNEA PARA VER EL ERROR REAL EN LA TERMINAL ---
      console.error('ERROR REAL DE CORREO:', error);

      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Error al procesar la solicitud de recuperación.',
      );
    }
  }

  // 2. Valida la vigencia del código (Cumple CA004, CA005)
  // 2. Valida la vigencia del código
  async verifyResetCode(identificador: string, codigo: string) {
    console.log('\n--- DIAGNÓSTICO DE VERIFICACIÓN ---');
    console.log(`Buscando usuario: [${identificador}] con código: [${codigo}]`);

    // 1. Buscamos SOLO por correo o usuario, usando modo insensible a mayúsculas
    const user = await this.prisma.usuario.findFirst({
      where: {
        OR: [
          { nombre_usuario: identificador },
          { correo: { equals: identificador, mode: 'insensitive' } }, // Ignora mayúsculas
        ],
      },
    });

    if (!user) {
      console.log('❌ FALLO 1: El usuario/correo no existe en la BD.');
      throw new UnauthorizedException('El correo no existe en el sistema.');
    }

    // 2. Verificamos que el código sea idéntico
    if (user.resetPasswordToken !== codigo) {
      console.log(
        `❌ FALLO 2: Discrepancia de código. Esperaba [${user.resetPasswordToken}], recibió [${codigo}]`,
      );
      throw new UnauthorizedException('El código introducido es incorrecto.');
    }

    // 3. Verificamos la vigencia del tiempo
    const ahora = new Date();
    if (user.resetPasswordExpires && user.resetPasswordExpires < ahora) {
      console.log(
        `❌ FALLO 3: Tiempo expirado. Hora BD: ${user.resetPasswordExpires.toISOString()} | Hora Servidor: ${ahora.toISOString()}`,
      );
      throw new UnauthorizedException('El código ha expirado por tiempo.');
    }

    console.log('✅ ÉXITO: El código pasó todas las pruebas.');
    console.log('-----------------------------------\n');

    return {
      success: true,
      message: 'Código verificado correctamente. Puede cambiar su contraseña.',
    };
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
      throw new UnauthorizedException(
        'El código ha expirado. Por favor, solicite uno nuevo.',
      );
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

      return {
        success: true,
        message: 'Su contraseña ha sido actualizada exitosamente.',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar la contraseña.',
      );
    }
  }

  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token requerido');
    }

    const sesiones = await this.prisma.sesion.findMany({
      where: {
        activo: true,
      },
    });

    for (const sesion of sesiones) {
      const match = await bcrypt.compare(refreshToken, sesion.refresh_token);

      if (match) {
        await this.prisma.sesion.update({
          where: {
            id_sesion: sesion.id_sesion,
          },

          data: {
            activo: false,
          },
        });

        return {
          message: 'Sesión cerrada correctamente',
        };
      }
    }

    throw new UnauthorizedException('Sesión inválida');
  }
}
