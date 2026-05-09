import apiClient from '../api/axios';

export class BaseService<T, CreateDTO, UpdateDTO> {
    protected endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    // Leer todos los registros de la tabla
    async getAll(params?: Record<string, any>): Promise<T[]> {
        const response = await apiClient.get<T[]>(this.endpoint, { params });
        return response.data;
    }

    // Leer un registro por su ID
    async getById(id: number | string): Promise<T> {
        const response = await apiClient.get<T>(`${this.endpoint}/${id}`);
        return response.data;
    }

    // Crear un nuevo registro
    async create(data: CreateDTO): Promise<T> {
        const response = await apiClient.post<T>(this.endpoint, data);
        return response.data;
    }

    // Actualizar un registro existente
    async update(id: number | string, data: UpdateDTO): Promise<T> {
        const response = await apiClient.patch<T>(`${this.endpoint}/${id}`, data);
        return response.data;
    }

    // Eliminar un registro
    async delete(id: number | string): Promise<void> {
        await apiClient.delete(`${this.endpoint}/${id}`);
    }
}
