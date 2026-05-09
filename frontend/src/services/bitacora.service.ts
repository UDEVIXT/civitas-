import { BaseService } from './base.service';
import apiClient from '../api/axios';

// 1. Definimos la interfaz basada en tu tabla de Bitácora
export interface Bitacora {
    id: number;
    visitorName: string;
    visitorType: string;
    qrCode?: string;
    entryTime: string;
    exitTime?: string;
    visitReason: string;
    guardNotes?: string;
    propertyId: number; // o string, dependiendo de tu BD
}

export interface CreateBitacoraDto extends Omit<Bitacora, 'id'> { }
export interface UpdateBitacoraDto extends Partial<CreateBitacoraDto> { }

class BitacoraService extends BaseService<Bitacora, CreateBitacoraDto, UpdateBitacoraDto> {
    constructor() {
        super('/bitacora'); // Asegúrate de que coincida con el endpoint de tu backend (ej: '/logs', '/audit')
    }

    // Método específico para registrar una salida
    async registerExit(id: number, notes?: string): Promise<Bitacora> {
        const response = await apiClient.patch<Bitacora>(`${this.endpoint}/${id}/salida`, { guardNotes: notes });
        return response.data;
    }

}

export const bitacoraService = new BitacoraService();
