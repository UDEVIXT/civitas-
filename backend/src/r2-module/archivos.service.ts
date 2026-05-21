/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ArchivosService {
  private s3: S3Client;
  private nombreBucket = 'civitas';

  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${this.configService.get('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.configService.get('R2_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get('R2_SECRET_ACCESS_KEY')!,
      },
    });
  }

  async subirImagen(archivo: any, route: string): Promise<string> {
    try {
      const nombreLimpio = archivo.originalname
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '');

      // Limpia la ruta: quita slashes iniciales/finales y asegura un separador con el nombre del archivo
      const folder = route.replace(/^\/+|\/+$/g, '');
      const rutaArchivo = folder
        ? `${folder}/${Date.now()}_${nombreLimpio}`
        : `${Date.now()}_${nombreLimpio}`;

      const comando = new PutObjectCommand({
        Bucket: this.nombreBucket,
        Key: rutaArchivo,
        Body: archivo.buffer,
        ContentType: archivo.mimetype,
      });

      await this.s3.send(comando);

      //Se retorna la URL pública del archivo subido a R2
      return `${this.configService.get('R2_VISUAL_URL')}${rutaArchivo}`;
    } catch (error) {
      console.error('Error al subir a R2:', error);
      throw new InternalServerErrorException(
        'No se pudo subir la evidencia a Cloudflare R2',
      );
    }
  }
}
