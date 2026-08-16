import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import { orderRoutes } from './modules/orders/infrastructure/order.routes.js';
import { dashboardRoutes } from './modules/orders/infrastructure/dashboard.routes.js';
import { authRoutes } from './modules/auth/infrastructure/auth.routes.js';
import { initDatabase } from './infrastructure/database.js';

// Extensión de tipos de Fastify para habilitar fastify.authenticate y request.user
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

const fastify = Fastify({ logger: true });

const start = async () => {
    try {
        // 1. Plugins principales
        await fastify.register(cors, { origin: '*' });

        // JWT_SECRET es obligatorio: fail fast si no está configurado
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is required. Set it in the environment before starting.');
        }

        await fastify.register(fastifyJwt, {
            secret: jwtSecret,
        });

        // 2. Decorator global para autenticación
        fastify.decorate(
            'authenticate',
            async (request: FastifyRequest, reply: FastifyReply) => {
                try {
                    await request.jwtVerify();
                } catch (err) {
                    // return corta la cadena de hooks: el handler NO se ejecuta
                    return reply.status(401).send({ message: 'No autorizado o token expirado' });
                }
            }
        );

        // 3. Registrar Módulos / Rutas (base path unificado bajo /api)
        await fastify.register(authRoutes, { prefix: '/api' });
        await fastify.register(orderRoutes, { prefix: '/api' });
        await fastify.register(dashboardRoutes, { prefix: '/api' });

        // 4. Base de datos
        await initDatabase();

        // 5. Iniciar Servidor
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        console.log('🚀 API corriendo en http://localhost:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();