import type { FastifyInstance } from 'fastify';
import { pool } from '../../../infrastructure/database.js';

// Catalog lookups for the booking wizard (READ-only).
// SPEC §5: GET /services, GET /customers?search=, GET /vehicles?plate=
export async function catalogRoutes(fastify: FastifyInstance) {
    // GET /api/services?active=true
    fastify.get('/services', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { active } = request.query as { active?: string };
        const activeFilter = active === 'true' ? 'WHERE is_active = true' : '';
        const result = await pool.query(
            `SELECT id, name, description, price, duration_minutes, is_active
             FROM services ${activeFilter}
             ORDER BY name`
        );
        return reply.send(result.rows.map((r: any) => ({ ...r, price: parseFloat(r.price) })));
    });

    // GET /api/customers?search=name-or-phone
    fastify.get('/customers', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { search } = request.query as { search?: string };
        if (!search) return reply.send([]);
        const result = await pool.query(
            `SELECT id, name, phone, email
             FROM customers
             WHERE name ILIKE $1 OR phone ILIKE $1
             ORDER BY created_at DESC
             LIMIT 10`,
            [`%${search}%`]
        );
        return reply.send(result.rows);
    });

    // GET /api/vehicles?plate=ABC123 (+ owner for the "is this your vehicle?" card)
    fastify.get('/vehicles', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const { plate } = request.query as { plate?: string };
        if (!plate) return reply.send([]);
        const result = await pool.query(
            `SELECT v.id, v.plates, v.vehicle_type, v.vehicle_size,
                    c.id AS customer_id, c.name AS customer_name
             FROM vehicles v
             LEFT JOIN customers c ON c.id = v.customer_id
             WHERE v.plates ILIKE $1
             ORDER BY v.created_at DESC
             LIMIT 10`,
            [`%${plate}%`]
        );
        return reply.send(result.rows);
    });
}