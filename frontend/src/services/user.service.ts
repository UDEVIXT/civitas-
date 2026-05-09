import { BaseService } from './base.service';
import apiClient from '../api/axios';

// 1. Definimos las interfaces (Tipos de datos de la tabla)
export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
}

export interface CreateUserDto extends Omit<User, 'id'> {}
export interface UpdateUserDto extends Partial<CreateUserDto> {}

// 2. Extendemos de BaseService pasando los tipos y la ruta del backend
class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  constructor() {
    super('/users'); // Esta es la ruta del endpoint en NestJS
  }

  // 3. (Opcional) Aquí puedes agregar métodos EXCLUSIVOS de la tabla usuarios
  async getUsersByRole(roleId: number): Promise<User[]> {
    const response = await apiClient.get<User[]>(`${this.endpoint}/role/${roleId}`);
    return response.data;
  }
}

// 4. Exportamos una única instancia (Patrón Singleton)
export const userService = new UserService();