import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    username: string;
    role: 'Administrador' | 'Guardia' | 'Residente';
  };
}
