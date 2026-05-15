import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class ArchivosService {
  private supabase: SupabaseClient;
  // Asegúrate de que este nombre sea EXACTAMENTE el mismo que creaste en Supabase
  private nombreBucket = 'imagenes';

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!,
    );
  }

  async subirImagen(archivo: any): Promise<string> {
    try {
      // 1. Limpiamos el nombre del archivo: quitamos espacios y caracteres raros
      const nombreLimpio = archivo.originalname.replace(/[^a-zA-Z0-9.]/g, '');

      // 2. Le agregamos la fecha actual (Date.now) para que nunca haya dos fotos con el mismo nombre exacto
      const rutaArchivo = `${Date.now()}_${nombreLimpio}`;

      // 3. Subimos el archivo a Supabase
      const { data, error } = await this.supabase.storage
        .from(this.nombreBucket)
        .upload(rutaArchivo, archivo.buffer, {
          contentType: archivo.mimetype, // Le decimos qué tipo de archivo es (ej. image/jpeg)
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // 4. Pedimos la URL pública final para guardarla en nuestra base de datos (Postgres)
      const { data: publicUrlData } = this.supabase.storage
        .from(this.nombreBucket)
        .getPublicUrl(rutaArchivo);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error al subir a Supabase:', error);
      throw new InternalServerErrorException(
        'No se pudo subir la evidencia a Supabase',
      );
    }
  }
}
