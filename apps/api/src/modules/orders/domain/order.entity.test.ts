import { describe, it, expect } from 'vitest';
import { Order, InvalidStatusTransitionError } from './order.entity.js';
import type { OrderStatus } from './order.entity.js';

function makeOrder(status: OrderStatus): Order {
    return new Order({
        id: '1',
        customerName: 'John Doe',
        vehiclePlate: 'AAA111',
        services: [{ id: 's1', name: 'Full Wash', price: 4000 }],
        status,
        totalAmount: 4000,
        createdAt: new Date(),
    });
}

describe('Order state machine', () => {
    it('follows the happy path PENDING -> CONFIRMED -> IN_PROGRESS -> READY -> COMPLETED', () => {
        const order = makeOrder('PENDING');
        order.changeStatus('CONFIRMED');
        order.changeStatus('IN_PROGRESS');
        order.changeStatus('READY');
        order.changeStatus('COMPLETED');
        expect(order.status).toBe('COMPLETED');
    });

    it('allows CANCELLED only from CONFIRMED', () => {
        const order = makeOrder('CONFIRMED');
        order.changeStatus('CANCELLED');
        expect(order.status).toBe('CANCELLED');
    });

    it('rejects CANCELLED from PENDING', () => {
        const order = makeOrder('PENDING');
        expect(() => order.changeStatus('CANCELLED')).toThrow(InvalidStatusTransitionError);
        expect(order.status).toBe('PENDING');
    });

    it('rejects skipping states (PENDING -> COMPLETED)', () => {
        const order = makeOrder('PENDING');
        expect(() => order.changeStatus('COMPLETED')).toThrow(InvalidStatusTransitionError);
    });

    it('is immutable from terminal states', () => {
        const order = makeOrder('COMPLETED');
        expect(() => order.changeStatus('CANCELLED')).toThrow(InvalidStatusTransitionError);
    });

    it('freezes the services snapshot (immutable)', () => {
        const order = makeOrder('PENDING');
        expect(Object.isFrozen(order.services)).toBe(false); // defensive copy on getter
        order.services.push({ id: 'x', name: 'Injected', price: 1 });
        expect(order.services.length).toBe(1); // original unchanged
    });
});
