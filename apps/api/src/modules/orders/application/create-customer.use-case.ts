import { pool } from '../../../infrastructure/database.js';
import crypto from 'crypto';

export interface CreateCustomerInput {
    phone: string;
    name: string;
}

export interface CustomerOutput {
    id: string;
    name: string;
    phone: string;
}

export class CreateCustomerUseCase {
    async execute(input: CreateCustomerInput): Promise<CustomerOutput> {
        // 1. Check if the customer already exists by phone
        const existing = await pool.query(
            'SELECT id, name, phone FROM customers WHERE phone = $1',
            [input.phone]
        );

        if (existing.rows.length > 0) {
            // Existing customer: return its data
            return {
                id: existing.rows[0].id,
                name: existing.rows[0].name,
                phone: existing.rows[0].phone,
            };
        }

        // 2. Create new customer
        const customerId = crypto.randomUUID();
        const name = input.name || `Customer ${input.phone.slice(-4)}`;

        await pool.query(
            `INSERT INTO customers (id, name, phone, created_at)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
            [customerId, name, input.phone]
        );

        return {
            id: customerId,
            name,
            phone: input.phone,
        };
    }
}