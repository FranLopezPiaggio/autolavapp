import Fastify from 'fastify';
import cors from '@fastify/cors';
import { orderRoutes } from './modules/orders/infrastructure/order.routes.js';
import { dashboardRoutes } from './modules/orders/infrastructure/dashboard.routes.js';
import { initDatabase } from './infrastructure/database.js';

const fastify = Fastify({ logger: true });

const start = async () => {
    try {
        await fastify.register(cors, { origin: '*' });

        // Registrar plugins/rutas una sola vez
        await fastify.register(orderRoutes);
        await fastify.register(dashboardRoutes);

        await initDatabase();
        await fastify.listen({ port: 3000 });
        console.log('🚀 API corriendo en http://localhost:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();