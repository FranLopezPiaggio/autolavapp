import { Order } from '../domain/order.entity.js';
import type { OrderRepository, StatusChangeAudit } from '../domain/order.repository.js';

export class InMemoryOrderRepository implements OrderRepository {
    // Declaramos que el Map guarda: Clave (string - ID) y Valor (instancia de Order)
    private orders: Map<string, Order> = new Map<string, Order>();
    public audits: StatusChangeAudit[] = [];

    // ORDER SEED FOR TESTS
    constructor() {
        // Datos semilla para que nunca esté vacío al reiniciar
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

    // Devuelve una promesa sin valor de retorno (void)
    async save(order: Order): Promise<void> {
        this.orders.set(order.id, order);
    }

    // Devuelve la orden encontrada o null
    async findById(id: string): Promise<Order | null> {
        return this.orders.get(id) || null;
    }

    // Devuelve un arreglo de órdenes
    async findAll(): Promise<Order[]> {
        return Array.from(this.orders.values());
    }

    async recordStatusChange(audit: StatusChangeAudit): Promise<void> {
        this.audits.push(audit);
    }
}