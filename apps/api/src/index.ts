import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import { orderRoutes } from './modules/orders/infrastructure/order.routes.js';
import { dashboardRoutes } from './modules/orders/infrastructure/dashboard.routes.js';
import { catalogRoutes } from './modules/orders/infrastructure/catalog.routes.js';
import { authRoutes } from './modules/auth/infrastructure/auth.routes.js';
import { pool } from './infrastructure/database.js';

// Fastify type extension to enable fastify.authenticate and request.user
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

const fastify = Fastify({ logger: true });

const start = async () => {
    try {
        // 1. Core plugins
        await fastify.register(cors, { origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] });

        // JWT_SECRET is required: fail fast if not configured
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is required. Set it in the environment before starting.');
        }

        await fastify.register(fastifyJwt, {
            secret: jwtSecret,
        });

        // 2. Global auth decorator
        fastify.decorate(
            'authenticate',
            async (request: FastifyRequest, reply: FastifyReply) => {
                try {
                    await request.jwtVerify();
                } catch (err) {
                    // return breaks the hook chain: the handler does NOT run
                    return reply.status(401).send({ message: 'Unauthorized or expired token' });
                }
            }
        );

        // 3. Register Modules / Routes (unified base path under /api)
        await fastify.register(authRoutes, { prefix: '/api' });
        await fastify.register(orderRoutes, { prefix: '/api' });
        await fastify.register(catalogRoutes, { prefix: '/api' });
        await fastify.register(dashboardRoutes, { prefix: '/api' });

        // 4. Verify DB connection (schema lives in apps/db/schema-supabase.sql, seeded manually)
        await pool.query('SELECT 1');

        // 5. Iniciar Servidor
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        console.log('🚀 API corriendo en http://localhost:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();