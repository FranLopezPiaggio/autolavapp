import { pool } from '../../../infrastructure/database.js';
import { Order } from '../domain/order.entity.js';
import type { OrderStatus, ServiceItem } from '../domain/order.entity.js';
import type { OrderRepository } from '../domain/order.repository.js';

// Estructura de la fila tal como retorna de PostgreSQL
interface OrderRow {
    id: string;
    customer_name: string;
    vehicle_plate: string;
    services: ServiceItem[] | string;
    status: OrderStatus;
    total_amount: string;
    created_at: Date;
}

export class PostgresOrderRepository implements OrderRepository {
    async save(order: Order): Promise<void> {
        const query = `
      INSERT INTO orders (id, customer_name, vehicle_plate, services, status, total_amount, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        services = EXCLUDED.services,
        total_amount = EXCLUDED.total_amount;
    `;

        const values = [
            order.id,
            order.customerName,
            order.vehiclePlate,
            JSON.stringify(order.services),
            order.status,
            order.totalAmount,
            order.createdAt,
        ];

        await pool.query(query, values);
    }

    async findById(id: string): Promise<Order | null> {
        const query = 'SELECT * FROM orders WHERE id = $1';
        const result = await pool.query<OrderRow>(query, [id]);

        const row = result.rows[0];
        if (!row) {
            return null;
        }

        return this.mapToDomain(row);
    }

    async findAll(): Promise<Order[]> {
        const query = 'SELECT * FROM orders ORDER BY created_at DESC';
        const result = await pool.query<OrderRow>(query);

        return result.rows.map((row) => this.mapToDomain(row));
    }

    // Convierte el registro SQL plano a la Entidad del Dominio
    private mapToDomain(row: OrderRow): Order {
        return new Order({
            id: row.id,
            customerName: row.customer_name,
            vehiclePlate: row.vehicle_plate,
            services: typeof row.services === 'string' ? JSON.parse(row.services) : row.services,
            status: row.status,
            totalAmount: parseFloat(row.total_amount),
            createdAt: new Date(row.created_at),
        });
    }
}