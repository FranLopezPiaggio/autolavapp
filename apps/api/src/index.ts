import Fastify from 'fastify';
import { orderRoutes } from './modules/orders/infrastructure/order.routes.js';

const fastify = Fastify({ logger: true });

// Registrar módulo de órdenes
fastify.register(orderRoutes);

const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
        console.log('🚀 API corriendo en http://localhost:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();