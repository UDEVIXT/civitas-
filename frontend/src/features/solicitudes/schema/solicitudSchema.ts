import { z } from 'zod';

export const UsuarioSchema = z.object({
  id_usuario: z.string(),
  nombre_usuario: z.string(),
  correo: z.string(),
  rol: z.string(),
  id_persona: z.string(),
  password: z.string(),
  estado: z.string(),
  resetPasswordToken: z.string().nullable(),
  resetPasswordExpires: z.string().nullable(),
  correo_verificado: z.string(),
  token_verificacion: z.string().nullable(),
});

export const SolicitudSchema = z.object({
  id_solicitud: z.string(),
  id_usuario: z.string(),
  rol_solicitado: z.string(),
  nombre: z.string(),
  genero: z.string(),
  fecha_nacimiento: z.string(),
  telefono: z.string(),
  correo: z.string(),
  numero_empleado: z.string().nullable(),
  credencial_frente_key: z.string().nullable(),
  credencial_reverso_key: z.string().nullable(),
  estatus_solicitud: z.string(),
  createdAt: z.string(),
  updateAt: z.string(),
  usuario: UsuarioSchema,
});

export type Solicitud = z.infer<typeof SolicitudSchema>;
export type Usuario = z.infer<typeof UsuarioSchema>;
