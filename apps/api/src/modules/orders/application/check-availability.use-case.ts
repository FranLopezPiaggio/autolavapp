import { pool } from '../../../infrastructure/database.js';

export interface CheckAvailabilityInput {
    date: string; // ISO date string (YYYY-MM-DD)
    serviceIds: string[];
}

export interface AvailableSlot {
    startTime: string; // ISO string with date + time
    endTime: string;
}

export interface CheckAvailabilityOutput {
    date: string;
    availableSlots: AvailableSlot[];
}

export class CheckAvailabilityUseCase {
    async execute(input: CheckAvailabilityInput): Promise<CheckAvailabilityOutput> {
        const date = new Date(input.date);
        const dayOfWeek = date.getDay(); // 0 = Sunday

        // 1. Get working hours for the day
        const whResult = await pool.query(
            `SELECT start_time, end_time, slot_duration_minutes
             FROM working_hours
             WHERE day_of_week = $1 AND is_active = true`,
            [dayOfWeek]
        );

        if (whResult.rows.length === 0) {
            return { date: input.date, availableSlots: [] }; // Day closed
        }

        const { start_time, end_time, slot_duration_minutes } = whResult.rows[0];

        // 2. Get durations of the requested services
        const serviceIds = input.serviceIds;
        if (serviceIds.length === 0) {
            return { date: input.date, availableSlots: [] };
        }

        const placeholders = serviceIds.map((_, i) => `$${i + 1}`).join(',');
        const servicesResult = await pool.query(
            `SELECT id, duration_minutes FROM services WHERE id IN (${placeholders})`,
            serviceIds
        );

        if (servicesResult.rows.length !== serviceIds.length) {
            return { date: input.date, availableSlots: [] }; // Services not found
        }

        const totalDurationMinutes = servicesResult.rows.reduce(
            (sum, s) => sum + (s.duration_minutes || 0), 0
        );

        // 3. Get existing non-cancelled orders for that day
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const ordersResult = await pool.query(
            `SELECT scheduled_at, services FROM orders
             WHERE scheduled_at >= $1 AND scheduled_at <= $2
             AND status != 'CANCELLED'`,
            [dayStart.toISOString(), dayEnd.toISOString()]
        );

        // 4. Compute occupied blocks (start/end of each existing order)
        const occupied: { start: number; end: number }[] = [];
        for (const row of ordersResult.rows) {
            const orderStart = new Date(row.scheduled_at).getTime();
            const orderServices = typeof row.services === 'string' ? JSON.parse(row.services) : row.services;
            const orderDuration = orderServices.reduce((sum: number, s: { durationMinutes?: number }) => sum + (s.durationMinutes || 0), 0);
            occupied.push({ start: orderStart, end: orderStart + orderDuration * 60000 });
        }
        occupied.sort((a, b) => a.start - b.start);

        // 5. Generate available slots within working hours
        // ponytail: naive O(n*m) slot check (orders × services), optimize with DB query if latency > 100ms
        const [startH, startM] = start_time.split(':').map(Number);
        const [endH, endM] = end_time.split(':').map(Number);

        const workStartMs = dayStart.getTime() + startH * 3600000 + startM * 60000;
        const workEndMs = dayStart.getTime() + endH * 3600000 + endM * 60000;
        const slotMs = slot_duration_minutes * 60000;

        const availableSlots: AvailableSlot[] = [];
        let currentMs = workStartMs;

        while (currentMs + totalDurationMinutes * 60000 <= workEndMs) {
            const slotEnd = currentMs + totalDurationMinutes * 60000;

            // Check overlap against existing orders
            const overlaps = occupied.some(o => currentMs < o.end && slotEnd > o.start);

            if (!overlaps) {
                availableSlots.push({
                    startTime: new Date(currentMs).toISOString(),
                    endTime: new Date(slotEnd).toISOString(),
                });
            }

            currentMs += slotMs;
        }

        return { date: input.date, availableSlots };
    }
}