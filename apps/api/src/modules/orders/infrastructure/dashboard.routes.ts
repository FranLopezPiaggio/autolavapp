import type { FastifyInstance } from 'fastify';
import { pool } from '../../../infrastructure/database.js';

export async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.get('/dashboard/summary', async () => {
    const result = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN created_at::date = CURRENT_DATE AND status = 'COMPLETED' THEN total_amount ELSE 0 END), 0) AS today_revenue,
        COALESCE(SUM(CASE WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) AND status = 'COMPLETED' THEN total_amount ELSE 0 END), 0) AS monthly_revenue,
        COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) AS active_vehicles,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) AS pending_turns
      FROM orders;
    `);

    const row = result.rows[0];
    return {
      todayRevenue: parseFloat(row?.today_revenue ?? '0'),
      monthlyRevenue: parseFloat(row?.monthly_revenue ?? '0'),
      activeVehicles: parseInt(row?.active_vehicles ?? '0', 10),
      pendingTurns: parseInt(row?.pending_turns ?? '0', 10),
    };
  });
}