import type { OrderRepository } from '../domain/order.repository.js';
import { pool } from '../../../infrastructure/database.js';
import crypto from 'crypto';

export interface CreateVehicleInput {
    plate: string;
    customerId: string;
    vehicleType?: string;
    vehicleSize?: string;
}

export interface VehicleOutput {
    id: string;
    plates: string;
    customerId: string;
    vehicleType: string;
    vehicleSize: string;
}

export class CreateVehicleUseCase {
    constructor() { }

    async execute(input: CreateVehicleInput): Promise<VehicleOutput> {
        // 1. Check if the vehicle already exists by plate
        const existing = await pool.query(
            'SELECT id, plates, customer_id, vehicle_type, vehicle_size FROM vehicles WHERE plates = $1',
            [input.plate]
        );

        if (existing.rows.length > 0) {
            // Existing vehicle: return its data (owner may have changed)
            return {
                id: existing.rows[0].id,
                plates: existing.rows[0].plates,
                customerId: existing.rows[0].customer_id,
                vehicleType: existing.rows[0].vehicle_type || input.vehicleType || 'CAR',
                vehicleSize: existing.rows[0].vehicle_size || input.vehicleSize || 'MEDIUM',
            };
        }

        // 2. Create new vehicle linked to the customer
        const vehicleId = crypto.randomUUID();
        const type = input.vehicleType || 'CAR';
        const size = input.vehicleSize || 'MEDIUM';

        await pool.query(
            `INSERT INTO vehicles (id, customer_id, plates, vehicle_type, vehicle_size, created_at)
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
            [vehicleId, input.customerId, input.plate, type, size]
        );

        return {
            id: vehicleId,
            plates: input.plate,
            customerId: input.customerId,
            vehicleType: type,
            vehicleSize: size,
        };
    }
}