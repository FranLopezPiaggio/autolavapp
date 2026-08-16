import type { Order, OrderStatus } from '../domain/order.entity.js';
import type { OrderRepository } from '../domain/order.repository.js';

export interface ChangeOrderStatusInput {
    orderId: string;
    newStatus: OrderStatus;
    changedBy?: string;
    reason?: string;
}

export class ChangeOrderStatusUseCase {
    constructor(private readonly orderRepository: OrderRepository) { }

    async execute(input: ChangeOrderStatusInput): Promise<Order> {
        const order = await this.orderRepository.findById(input.orderId);

        if (!order) {
            throw new Error(`Order with ID ${input.orderId} not found`);
        }

        const previousStatus = order.status;

        // Ejecuta la regla de negocio encapsulated en la Entidad
        order.changeStatus(input.newStatus);

        // Guarda el estado actualizado
        await this.orderRepository.save(order);

        // Soft update: entrada inmutable en order_audits
        const audit: import('../domain/order.repository.js').StatusChangeAudit = {
            orderId: order.id,
            previousStatus,
            newStatus: order.status,
        };
        if (input.changedBy) audit.changedBy = input.changedBy;
        if (input.reason) audit.reason = input.reason;
        await this.orderRepository.recordStatusChange(audit);

        return order;
    }
}
