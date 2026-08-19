import { Order } from '../domain/order.entity.js';
import type { OrderRepository, StatusChangeAudit } from '../domain/order.repository.js';

export class InMemoryOrderRepository implements OrderRepository {
    // Map key: id (string), value: Order instance
    private orders: Map<string, Order> = new Map<string, Order>();
    public audits: StatusChangeAudit[] = [];

    // ORDER SEED FOR TESTS
    constructor() {
        // Seed data so it is never empty on restart
        const seedOrder = new Order({
            id: '123e4567-e89b-12d3-a456-426614174000',
            customerName: 'Cliente Prueba',
            vehiclePlate: 'AAA111',
            services: [{ id: '1', name: 'Lavado Express', price: 4000 }],
            status: 'PENDING',
            totalAmount: 4000,
            createdAt: new Date(),
        });

        this.orders.set(seedOrder.id, seedOrder);
    }

    // Returns a void promise
    async save(order: Order): Promise<void> {
        this.orders.set(order.id, order);
    }

    // Returns the found order or null
    async findById(id: string): Promise<Order | null> {
        return this.orders.get(id) || null;
    }

    // Returns an array of orders
    async findAll(): Promise<Order[]> {
        return Array.from(this.orders.values());
    }

    async recordStatusChange(audit: StatusChangeAudit): Promise<void> {
        this.audits.push(audit);
    }
}