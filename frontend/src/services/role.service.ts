import { BaseService } from './base.service';

export interface Role {
  id: number;
  name: string;
  description: string;
}

class RoleService extends BaseService<Role, Omit<Role, 'id'>, Partial<Omit<Role, 'id'>>> {
  constructor() {
    super('/roles');
  }
}

export const roleService = new RoleService();
