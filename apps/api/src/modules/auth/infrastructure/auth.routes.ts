import type { FastifyInstance } from 'fastify';
import type { LoginDTO, AuthResponse } from '@repo/shared';
import { LoginUseCase } from '../application/login.use-case.js';
import { PostgresUserRepository } from './postgres-user.repository.js';

export async function authRoutes(fastify: FastifyInstance) {
    const userRepository = new PostgresUserRepository();
    const loginUseCase = new LoginUseCase(userRepository);

    // Endpoint de Login
    fastify.post('/auth/login', async (request, reply) => {
        const { email, password } = request.body as LoginDTO;

        try {
            const user = await loginUseCase.execute(email, password);

            // Firma del JWT usando el plugin de Fastify
            const token = fastify.jwt.sign({
                id: user.id,
                email: user.email,
                role: user.role,
            });

            const response: AuthResponse = { token, user };
            return reply.send(response);
        } catch (error) {
            return reply.status(401).send({ message: (error as Error).message });
        }
    });

    // Endpoint Protegido para validar token activa
    fastify.get('/auth/me', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        return reply.send({ user: request.user });
    });
}
