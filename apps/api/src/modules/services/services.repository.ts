import { Pool } from 'pg';
import { ServiceDTO, WorkingHoursDTO } from '@repo/shared';

export class ServicesRepository {
    constructor(private readonly pool: Pool) { }

    // --- SERVICIOS ---

    async findAllActive(): Promise<ServiceDTO[]> {
        const query = `
      SELECT 
        id, 
        name, 
        description, 
        price::float as price, 
        duration_minutes as "durationMinutes", 
        is_active as "isActive"
      FROM services
      WHERE is_active = TRUE
      ORDER BY name ASC;
    `;
        const { rows } = await this.pool.query(query);
        return rows;
    }

    async findByIds(ids: string[]): Promise<ServiceDTO[]> {
        if (ids.length === 0) return [];
        const query = `
      SELECT 
        id, 
        name, 
        description, 
        price::float as price, 
        duration_minutes as "durationMinutes", 
        is_active as "isActive"
      FROM services
      WHERE id = ANY($1::uuid[]) AND is_active = TRUE;
    `;
        const { rows } = await this.pool.query(query, [ids]);
        return rows;
    }

    async createService(data: Omit<ServiceDTO, 'id'>): Promise<ServiceDTO> {
        const query = `
      INSERT INTO services (name, description, price, duration_minutes, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING 
        id, 
        name, 
        description, 
        price::float as price, 
        duration_minutes as "durationMinutes", 
        is_active as "isActive";
    `;
        const values = [
            data.name,
            data.description || '',
            data.price,
            data.durationMinutes,
            data.isActive ?? true,
        ];
        const { rows } = await this.pool.query(query, values);
        return rows[0];
    }

    // --- HORARIOS DE ATENCIÓN ---

    async getWorkingHours(): Promise<WorkingHoursDTO[]> {
        const query = `
      SELECT 
        id, 
        day_of_week as "dayOfWeek", 
        start_time as "startTime", 
        end_time as "endTime", 
        slot_duration_minutes as "slotDurationMinutes"
      FROM working_hours
      ORDER BY day_of_week ASC;
    `;
        const { rows } = await this.pool.query(query);
        return rows;
    }

    async getWorkingHoursByDay(dayOfWeek: number): Promise<WorkingHoursDTO | null> {
        const query = `
      SELECT 
        id, 
        day_of_week as "dayOfWeek", 
        start_time as "startTime", 
        end_time as "endTime", 
        slot_duration_minutes as "slotDurationMinutes"
      FROM working_hours
      WHERE day_of_week = $1;
    `;
        const { rows } = await this.pool.query(query, [dayOfWeek]);
        return rows[0] || null;
    }
}