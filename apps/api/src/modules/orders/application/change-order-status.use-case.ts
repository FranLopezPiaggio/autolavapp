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

        // Execute the business rule encapsulated in the Entity
        order.changeStatus(input.newStatus);

        // Persist updated status
        await this.orderRepository.save(order);

        // Soft update: immutable entry in order_audits
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
