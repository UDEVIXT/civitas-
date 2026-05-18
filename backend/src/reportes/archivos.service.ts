import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as WebSocket from 'ws';

// Parche global para Node.js: Simulamos la API nativa de los navegadores
if (typeof global !== 'undefined') {
  (global as any).WebSocket = WebSocket;
}

@Injectable()
export class ArchivosService {
  private supabase: SupabaseClient;
  // Asegúrate de que este nombre sea EXACTAMENTE el mismo que creaste en Supabase
  private nombreBucket = 'imagenes';

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL y SUPABASE_KEY son requeridos');
    }

    // Inicializamos Supabase limpio, ya que Node.js ahora tiene soporte global para WebSockets
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false, // Recomendado para entornos backend puros
      },
    });
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