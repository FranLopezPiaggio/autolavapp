import type { FastifyInstance } from 'fastify';
import { CreateOrderUseCase } from '../application/create-order.use-case.js';
import { ChangeOrderStatusUseCase } from '../application/change-order-status.use-case.js';
import { PostgresOrderRepository } from './postgres-order.repository.js';
import type { ServiceItem, Order, OrderStatus } from '../domain/order.entity.js';

const orderRepository = new PostgresOrderRepository();
const createOrderUseCase = new CreateOrderUseCase(orderRepository);
const changeOrderStatusUseCase = new ChangeOrderStatusUseCase(orderRepository);

export async function orderRoutes(fastify: FastifyInstance) {
    // 1. POST /orders (ÚNICO)
    fastify.post('/orders', async (request, reply) => {
        const body = request.body as {
            customerName: string;
            vehiclePlate: string;
            services: ServiceItem[];
        };

        const order = await createOrderUseCase.execute(body);
        return reply.status(201).send(order.toJSON());
    });

    // 2. GET /orders
    fastify.get('/orders', async () => {
        const orders: Order[] = await orderRepository.findAll();
        return orders.map((order: Order) => order.toJSON());
    });

    // 3. GET /orders/:id
    fastify.get('/orders/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const order = await orderRepository.findById(id);

        if (!order) {
            return reply.status(404).send({ message: 'Orden no encontrada' });
        }

        return reply.send(order.toJSON());
    });

    // 4. PATCH /orders/:id/status
    fastify.patch('/orders/:id/status', async (request, reply) => {
        const { id } = request.params as { id: string };
        const { status } = request.body as { status: OrderStatus };

        try {
            const updatedOrder = await changeOrderStatusUseCase.execute({
                orderId: id,
                newStatus: status,
            });
            return reply.send(updatedOrder.toJSON());
        } catch (error) {
            return reply.status(400).send({ message: (error as Error).message });
        }
    });
}