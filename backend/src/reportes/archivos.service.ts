import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class ArchivosService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
  }

  async subirImagen(archivo: any): Promise<string> {
    const extension = path.extname(archivo.originalname);
    const nombreArchivo = `${uuidv4()}${extension}`;
    const rutaArchivo = `reportes/${nombreArchivo}`;

    const { data, error } = await this.supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .upload(rutaArchivo, archivo.buffer, {
        contentType: archivo.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Error al subir a Supabase:', error);
      throw new InternalServerErrorException('Error al subir la imagen');
    }

    const { data: urlData } = this.supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .getPublicUrl(rutaArchivo);

    return urlData.publicUrl;
  }
}