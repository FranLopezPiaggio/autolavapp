import type { FastifyInstance } from 'fastify';
import { CreateOrderUseCase } from '../application/create-order.use-case.js';
import { ChangeOrderStatusUseCase } from '../application/change-order-status.use-case.js';
import { CheckAvailabilityUseCase } from '../application/check-availability.use-case.js';
import { PostgresOrderRepository } from './postgres-order.repository.js';
import type { ServiceItem, Order, OrderStatus } from '../domain/order.entity.js';

const orderRepository = new PostgresOrderRepository();
const createOrderUseCase = new CreateOrderUseCase(orderRepository);
const changeOrderStatusUseCase = new ChangeOrderStatusUseCase(orderRepository);
const checkAvailabilityUseCase = new CheckAvailabilityUseCase();

const DAY_NAMES_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export async function orderRoutes(fastify: FastifyInstance) {
    // 0. GET /availability?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD&serviceIds=a,b,c
    // SPEC: window of days with slots. Backward compatible with ?date= (single day).
    fastify.get('/availability', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const q = request.query as { date?: string; date_from?: string; date_to?: string; serviceIds: string };
        const serviceIds = (q.serviceIds ?? '').split(',').filter(Boolean);
        if (serviceIds.length === 0) {
            return reply.status(400).send({ message: 'serviceIds query param required' });
        }

        // Range mode: iterate days server-side (1 HTTP request for the 7-day grid)
        if (q.date_from && q.date_to) {
            const start = new Date(q.date_from + 'T00:00:00');
            const end = new Date(q.date_to + 'T00:00:00');
            if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
                return reply.status(400).send({ message: 'invalid date_from/date_to' });
            }
            const days = [];
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const result = await checkAvailabilityUseCase.execute({ date: iso, serviceIds });
                days.push({
                    date: iso,
                    day_name: DAY_NAMES_ES[d.getDay()],
                    slots: result.availableSlots,
                });
            }
            return reply.send({ service_ids: serviceIds, days });
        }

        // Single-day mode
        if (!q.date) {
            return reply.status(400).send({ message: 'date (or date_from/date_to) query param required' });
        }
        const result = await checkAvailabilityUseCase.execute({ date: q.date, serviceIds });
        return reply.send(result);
    });

    // 1. POST /orders (single entry) - REQ §2: customer/vehicle from a new plate
    fastify.post('/orders', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const body = request.body as {
            customerName: string;
            customerPhone: string;
            vehiclePlate: string;
            services: ServiceItem[];
            scheduledAt?: string;
        };

        const input: {
            customerName: string;
            customerPhone: string;
            vehiclePlate: string;
            services: ServiceItem[];
            scheduledAt?: Date;
        } = {
            customerName: body.customerName,
            customerPhone: body.customerPhone,
            vehiclePlate: body.vehiclePlate,
            services: body.services,
        };
        if (body.scheduledAt) {
            input.scheduledAt = new Date(body.scheduledAt);
        }
        const order = await createOrderUseCase.execute(input);
        return reply.status(201).send(order.toJSON());
    });

    // 2. GET /orders (list, newest first)
    fastify.get('/orders', { onRequest: [fastify.authenticate] }, async () => {
        const orders: Order[] = await orderRepository.findAll();
        return orders.map((order: Order) => order.toJSON());
    });

    // 3. GET /orders/:id
    fastify.get('/orders/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const order = await orderRepository.findById(id);

        if (!order) {
            return reply.status(404).send({ message: 'Order not found' });
        }

        return reply.send(order.toJSON());
    });

    // 4. PATCH /orders/:id/status
    fastify.patch('/orders/:id/status', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const { status, reason } = request.body as { status: OrderStatus; reason?: string };
        const user = request.user as { email?: string } | undefined;

        try {
            const input: import('../application/change-order-status.use-case.js').ChangeOrderStatusInput = {
                orderId: id,
                newStatus: status,
                changedBy: user?.email ?? 'ADMIN',
            };
            if (reason) input.reason = reason;
            const updatedOrder = await changeOrderStatusUseCase.execute(input);
            return reply.send(updatedOrder.toJSON());
        } catch (error) {
            return reply.status(400).send({ message: (error as Error).message });
        }
    });
}