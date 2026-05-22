import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule], // Importamos el módulo de configuración de Nest
      inject: [ConfigService], // Inyectamos el servicio
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            // Leemos de forma segura esperando a que el entorno cargue
            user: configService.get<string>('EMAIL_USER'), 
            pass: configService.get<string>('EMAIL_PASS'),
          },
        },
        defaults: {
          from: `"Soporte Civitas" <${configService.get<string>('EMAIL_USER')}>`,
        },
        template: {
          dir: join(process.cwd(), 'src/mail/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
            // Desactivar inline CSS para evitar la dependencia nativa
            inlineCss: false,
          },
        },
      }),
    }),
  ],
  exports: [MailerModule],
})
export class MailModule {}