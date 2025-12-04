import { pgTable, uuid, varchar, text, decimal, timestamp, pgSchema } from 'drizzle-orm/pg-core';

// Ecommerce schema
export const ecommerceSchema = pgSchema('ecommerce');

// POS Sessions table
export const posSessions = ecommerceSchema.table('pos_sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionNumber: varchar('session_number', { length: 50 }).notNull().unique(),
    cashierId: uuid('cashier_id').notNull(),
    startTime: timestamp('start_time').notNull(),
    endTime: timestamp('end_time'),
    openingBalance: decimal('opening_balance', { precision: 18, scale: 2 }).default('0'),
    closingBalance: decimal('closing_balance', { precision: 18, scale: 2 }),
    status: varchar('status', { length: 20 }).default('open'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// POS Orders table
export const posOrders = ecommerceSchema.table('pos_orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
    sessionId: uuid('session_id').references(() => posSessions.id),
    customerId: uuid('customer_id'),
    subtotal: decimal('subtotal', { precision: 18, scale: 2 }).notNull(),
    taxAmount: decimal('tax_amount', { precision: 18, scale: 2 }).default('0'),
    total: decimal('total', { precision: 18, scale: 2 }).notNull(),
    paymentMethod: varchar('payment_method', { length: 50 }),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Online Orders table
export const onlineOrders = ecommerceSchema.table('online_orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
    customerId: uuid('customer_id').notNull(),
    subtotal: decimal('subtotal', { precision: 18, scale: 2 }).notNull(),
    shippingCost: decimal('shipping_cost', { precision: 18, scale: 2 }).default('0'),
    taxAmount: decimal('tax_amount', { precision: 18, scale: 2 }).default('0'),
    total: decimal('total', { precision: 18, scale: 2 }).notNull(),
    status: varchar('status', { length: 20 }).default('pending'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Carts table
export const carts = ecommerceSchema.table('carts', {
    id: uuid('id').primaryKey().defaultRandom(),
    customerId: uuid('customer_id'),
    sessionId: varchar('session_id', { length: 100 }),
    status: varchar('status', { length: 20 }).default('active'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Type exports
export type PosSession = typeof posSessions.$inferSelect;
export type NewPosSession = typeof posSessions.$inferInsert;
export type PosOrder = typeof posOrders.$inferSelect;
export type NewPosOrder = typeof posOrders.$inferInsert;
export type OnlineOrder = typeof onlineOrders.$inferSelect;
export type NewOnlineOrder = typeof onlineOrders.$inferInsert;
export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;
