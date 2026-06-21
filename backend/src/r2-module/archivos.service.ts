/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import type { Readable } from 'stream';

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

  // Para documentos sensibles (ej. credencial INE): se sube con un nombre
  // aleatorio (UUID) y se retorna solo la "key" interna, nunca la URL pública.
  // El archivo debe servirse siempre a través de un endpoint protegido que use
  // obtenerArchivoPrivado, nunca exponiendo R2_VISUAL_URL + key directamente.
  async subirArchivoPrivado(archivo: any, route: string): Promise<string> {
    try {
      const extension = (archivo.originalname?.split('.').pop() || 'jpg')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

      const folder = route.replace(/^\/+|\/+$/g, '');
      const nombreAleatorio = `${randomUUID()}.${extension}`;
      const rutaArchivo = folder
        ? `${folder}/${nombreAleatorio}`
        : nombreAleatorio;

      const comando = new PutObjectCommand({
        Bucket: this.nombreBucket,
        Key: rutaArchivo,
        Body: archivo.buffer,
        ContentType: archivo.mimetype,
      });

      await this.s3.send(comando);

      return rutaArchivo;
    } catch (error) {
      console.error('Error al subir archivo privado a R2:', error);
      throw new InternalServerErrorException(
        'No se pudo subir el archivo a Cloudflare R2',
      );
    }
  }

  async obtenerArchivoPrivado(
    key: string,
  ): Promise<{ body: Readable; contentType?: string }> {
    try {
      const respuesta = await this.s3.send(
        new GetObjectCommand({
          Bucket: this.nombreBucket,
          Key: key,
        }),
      );

      return {
        body: respuesta.Body as Readable,
        contentType: respuesta.ContentType,
      };
    } catch (error) {
      console.error('Error al obtener archivo privado de R2:', error);
      throw new NotFoundException('No se pudo obtener el archivo solicitado');
    }
  }
}
