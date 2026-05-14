import { BaseService } from './base.service';
import apiClient from '../api/axios';

export interface Incidente {
    id: number;
    titulo: string;
    tipo: 'Queja' | 'Incidencia' | 'Sugerencia';
    descripcionBreve: string;
    lugar: string;
    fechaHoraReporte: string;
    estadoActual: 'Pendiente' | 'En proceso' | 'Resuelto';
    prioridad: 'Baja' | 'Media' | 'Alta';
    fechaUltimaActualizacion: string;
    reportadoAnonimamente: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateIncidenteDto extends Omit<Incidente, 'id' | 'createdAt' | 'updatedAt'> {}
export interface UpdateIncidenteDto extends Partial<CreateIncidenteDto> {}

export interface IncidentesFilters {
    tipo?: string;
    prioridad?: string;
    lugar?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    ordenarPor?: 'reciente' | 'antiguo' | 'prioridad';
    busqueda?: string;
}

class IncidentesService extends BaseService<Incidente, CreateIncidenteDto, UpdateIncidenteDto> {
    constructor() {
        super('/incidencias');
    }

    // Método para obtener incidentes con filtros
    async getIncidentesConFiltros(filters: IncidentesFilters): Promise<{ data: Incidente[], total: number }> {
        const params = new URLSearchParams();
        
        if (filters.tipo) {
            params.append('tipo', filters.tipo);
        }
        if (filters.prioridad) {
            params.append('prioridad', filters.prioridad);
        }
        if (filters.lugar) {
            params.append('lugar', filters.lugar);
        }
        if (filters.fechaDesde) {
            params.append('fechaDesde', filters.fechaDesde);
        }
        if (filters.fechaHasta) {
            params.append('fechaHasta', filters.fechaHasta);
        }
        if (filters.ordenarPor) {
            params.append('ordenarPor', filters.ordenarPor);
        }
        if (filters.busqueda) {
            params.append('busqueda', filters.busqueda);
        }

        console.log('Making request to:', `${this.endpoint}?${params.toString()}`);
        
        try {
            const response = await apiClient.get(`${this.endpoint}?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error en getIncidentesConFiltros:', error);
            throw error;
        }
    }

    // Método para obtener un incidente por ID
    async getIncidenteById(id: number): Promise<Incidente> {
        const response = await apiClient.get(`${this.endpoint}/${id}`);
        return response.data;
    }

    // Método para crear un nuevo incidente
    async createIncidente(incidente: CreateIncidenteDto): Promise<Incidente> {
        const response = await apiClient.post(this.endpoint, incidente);
        return response.data;
    }

    // Método para actualizar un incidente
    async updateIncidente(id: number, incidente: UpdateIncidenteDto): Promise<Incidente> {
        const response = await apiClient.patch(`${this.endpoint}/${id}`, incidente);
        return response.data;
    }

    // Método para eliminar un incidente
    async deleteIncidente(id: number): Promise<void> {
        await apiClient.delete(`${this.endpoint}/${id}`);
    }
}

export const incidentesService = new IncidentesService();
