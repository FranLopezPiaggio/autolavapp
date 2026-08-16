import { pgTable, uuid, varchar, numeric, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { OrderServiceItem, OrderStatus, VehicleSize, VehicleType } from '@repo/shared';

export const customers = pgTable('customers', {
    id: uuid('id').defaultRandom().primaryKey(),
    fullName: varchar('full_name', { length: 120 }).notNull(),
    phone: varchar('phone', { length: 30 }).notNull().unique(),
    email: varchar('email', { length: 120 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const vehicles = pgTable('vehicles', {
    id: uuid('id').defaultRandom().primaryKey(),
    customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
    plates: varchar('plates', { length: 10 }).notNull().unique(),
    vehicleType: varchar('vehicle_type', { length: 20 }).$type<VehicleType>().notNull(),
    vehicleSize: varchar('vehicle_size', { length: 10 }).$type<VehicleSize>().notNull(),
    notes: varchar('notes', { length: 255 }).default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const services = pgTable('services', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    description: varchar('description', { length: 255 }).default(''),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    durationMinutes: integer('duration_minutes').default(30).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
});

export const orders = pgTable('orders', {
    id: uuid('id').defaultRandom().primaryKey(),
    customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
    vehicleId: uuid('vehicle_id').references(() => vehicles.id, { onDelete: 'set null' }),
    customerName: varchar('customer_name', { length: 100 }).notNull(),
    customerPhone: varchar('customer_phone', { length: 30 }),
    vehiclePlate: varchar('vehicle_plate', { length: 20 }).notNull(),
    services: jsonb('services').$type<OrderServiceItem[]>().notNull(),
    status: varchar('status', { length: 20 }).$type<OrderStatus>().notNull(),
    totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
    estimatedMinutes: integer('estimated_minutes').default(30).notNull(),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const orderAudits = pgTable('order_audits', {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
    previousStatus: varchar('previous_status', { length: 20 }).$type<OrderStatus>().notNull(),
    newStatus: varchar('new_status', { length: 20 }).$type<OrderStatus>().notNull(),
    changedBy: varchar('changed_by', { length: 100 }).default('ADMIN').notNull(),
    reason: varchar('reason', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});