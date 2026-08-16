import { ServicesRepository } from './services.repository.js';
import { ServiceDTO, WorkingHoursDTO } from '@repo/shared';

export class ServicesService {
    constructor(private readonly repository: ServicesRepository) { }

    async getActiveServices(): Promise<ServiceDTO[]> {
        return this.repository.findAllActive();
    }

    async createService(data: Omit<ServiceDTO, 'id'>): Promise<ServiceDTO> {
        if (!data.name || data.price <= 0 || data.durationMinutes <= 0) {
            throw new Error('Datos de servicio inválidos. Nombre, precio y duración son obligatorios.');
        }
        return this.repository.createService(data);
    }

    async getWorkingHours(): Promise<WorkingHoursDTO[]> {
        return this.repository.getWorkingHours();
    }

    async getWorkingHoursForDay(dayOfWeek: number): Promise<WorkingHoursDTO | null> {
        return this.repository.getWorkingHoursByDay(dayOfWeek);
    }
}