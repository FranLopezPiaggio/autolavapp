import type { Order, OrderStatus } from '../domain/order.entity.js';
import type { OrderRepository } from '../domain/order.repository.js';

export interface ChangeOrderStatusInput {
    orderId: string;
    newStatus: OrderStatus;
}

export class ChangeOrderStatusUseCase {
    constructor(private readonly orderRepository: OrderRepository) { }

    async execute(input: ChangeOrderStatusInput): Promise<Order> {
        const order = await this.orderRepository.findById(input.orderId);

        if (!order) {
            throw new Error(`Orden con ID ${input.orderId} no encontrada`);
        }

        // Ejecuta la regla de negocio encapsulated en la Entidad
        order.changeStatus(input.newStatus);

        // Guarda el estado actualizado
        await this.orderRepository.save(order);

        return order;
    }
}