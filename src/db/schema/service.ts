import { pgTable, uuid, varchar, text, timestamp, date, integer, pgSchema } from 'drizzle-orm/pg-core';

// Service schema
export const serviceSchema = pgSchema('service');

// Tickets table
export const tickets = serviceSchema.table('tickets', {
    id: uuid('id').primaryKey().defaultRandom(),
    ticketNumber: varchar('ticket_number', { length: 50 }).notNull().unique(),
    customerId: uuid('customer_id').notNull(),
    subject: varchar('subject', { length: 200 }).notNull(),
    description: text('description'),
    priority: varchar('priority', { length: 20 }).default('medium'),
    status: varchar('status', { length: 20 }).default('open'),
    assignedTo: uuid('assigned_to'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// SLAs (Service Level Agreements) table
export const slas = serviceSchema.table('slas', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    responseTime: integer('response_time'),
    resolutionTime: integer('resolution_time'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Warranties table
export const warranties = serviceSchema.table('warranties', {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id').notNull(),
    customerId: uuid('customer_id').notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    terms: text('terms'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Type exports
export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type Sla = typeof slas.$inferSelect;
export type NewSla = typeof slas.$inferInsert;
export type Warranty = typeof warranties.$inferSelect;
export type NewWarranty = typeof warranties.$inferInsert;
