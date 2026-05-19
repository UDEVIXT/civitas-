import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class ArchivosService {
  private s3: S3Client;
  private nombreBucket = 'civitas'; 

  constructor() {
    this.s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  }

  async subirImagen(archivo: any): Promise<string> {
    try {
      const nombreLimpio = archivo.originalname
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '');
        
      const rutaArchivo = 'incidencias/' + `${Date.now()}_${nombreLimpio}`;

      const comando = new PutObjectCommand({
        Bucket: this.nombreBucket,
        Key: rutaArchivo,
        Body: archivo.buffer,
        ContentType: archivo.mimetype,
      });

      await this.s3.send(comando);

      return `${process.env.R2_VISUAL_URL}${rutaArchivo}`;

    } catch (error) {
      console.error('Error al subir a R2:', error);
      throw new InternalServerErrorException('No se pudo subir la evidencia a Cloudflare R2');
    }
  }
}