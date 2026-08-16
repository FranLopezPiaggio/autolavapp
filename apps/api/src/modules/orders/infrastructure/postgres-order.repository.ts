import { pool } from '../../../infrastructure/database.js';
import { Order } from '../domain/order.entity.js';
import type { OrderStatus, ServiceItem } from '../domain/order.entity.js';
import type { OrderRepository, StatusChangeAudit } from '../domain/order.repository.js';

// Estructura de la fila tal como retorna de PostgreSQL
interface OrderRow {
    id: string;
    customer_name: string;
    vehicle_plate: string;
    services: ServiceItem[] | string;
    status: OrderStatus;
    total_amount: string;
    created_at: Date;
    customer_id?: string;
    vehicle_id?: string;
    scheduled_at?: Date;
}

export class PostgresOrderRepository implements OrderRepository {
    async save(order: Order): Promise<void> {
        const query = `
      INSERT INTO orders (id, customer_name, vehicle_plate, services, status, total_amount, created_at,
                          customer_id, vehicle_id, scheduled_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        services = EXCLUDED.services,
        total_amount = EXCLUDED.total_amount,
        customer_id = EXCLUDED.customer_id,
        vehicle_id = EXCLUDED.vehicle_id,
        scheduled_at = EXCLUDED.scheduled_at;
    `;

        const values = [
            order.id,
            order.customerName,
            order.vehiclePlate,
            JSON.stringify(order.services),
            order.status,
            order.totalAmount,
            order.createdAt,
            order.customerId ?? null,
            order.vehicleId ?? null,
            order.scheduledAt ?? null,
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

    async recordStatusChange(audit: StatusChangeAudit): Promise<void> {
        const query = `
      INSERT INTO order_audits (id, order_id, previous_status, new_status, changed_by, reason)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

        await pool.query(query, [
            crypto.randomUUID(),
            audit.orderId,
            audit.previousStatus,
            audit.newStatus,
            audit.changedBy ?? 'ADMIN',
            audit.reason ?? null,
        ]);
    }

    // Convierte el registro SQL plano a la Entidad del Dominio
    private mapToDomain(row: OrderRow): Order {
        const props: ConstructorParameters<typeof Order>[0] = {
            id: row.id,
            customerName: row.customer_name,
            vehiclePlate: row.vehicle_plate,
            services: typeof row.services === 'string' ? JSON.parse(row.services) : row.services,
            status: row.status,
            totalAmount: parseFloat(row.total_amount),
            createdAt: new Date(row.created_at),
        };
        if (row.customer_id) props.customerId = row.customer_id;
        if (row.vehicle_id) props.vehicleId = row.vehicle_id;
        if (row.scheduled_at) props.scheduledAt = new Date(row.scheduled_at);

        return new Order(props);
    }
}
