import type { Order, OrderStatus } from './order.entity.js';

export interface StatusChangeAudit {
    orderId: string;
    previousStatus: OrderStatus;
    newStatus: OrderStatus;
    changedBy?: string;
    reason?: string;
}

export interface OrderRepository {
    save(order: Order): Promise<void>;
    findById(id: string): Promise<Order | null>;
    findAll(): Promise<Order[]>;
    recordStatusChange(audit: StatusChangeAudit): Promise<void>;
}
