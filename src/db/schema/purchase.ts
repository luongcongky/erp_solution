import { pgTable, uuid, varchar, text, decimal, timestamp, date, pgSchema } from 'drizzle-orm/pg-core';

// Purchase schema
export const purchaseSchema = pgSchema('purchase');

// Purchase Requests table
export const purchaseRequests = purchaseSchema.table('purchase_requests', {
    id: uuid('id').primaryKey().defaultRandom(),
    requestNumber: varchar('request_number', { length: 50 }).notNull().unique(),
    requestDate: date('request_date').notNull(),
    requestedBy: uuid('requested_by').notNull(),
    status: varchar('status', { length: 20 }).default('draft'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// RFQs (Request for Quotation) table
export const rfqs = purchaseSchema.table('rfqs', {
    id: uuid('id').primaryKey().defaultRandom(),
    rfqNumber: varchar('rfq_number', { length: 50 }).notNull().unique(),
    rfqDate: date('rfq_date').notNull(),
    supplierId: uuid('supplier_id').notNull(),
    status: varchar('status', { length: 20 }).default('draft'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Purchase Orders table
export const purchaseOrders = purchaseSchema.table('purchase_orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    poNumber: varchar('po_number', { length: 50 }).notNull().unique(),
    supplierId: uuid('supplier_id').notNull(),
    orderDate: date('order_date').notNull(),
    deliveryDate: date('delivery_date'),
    subtotal: decimal('subtotal', { precision: 18, scale: 2 }).notNull(),
    taxAmount: decimal('tax_amount', { precision: 18, scale: 2 }).default('0'),
    total: decimal('total', { precision: 18, scale: 2 }).notNull(),
    status: varchar('status', { length: 20 }).default('draft'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Type exports
export type PurchaseRequest = typeof purchaseRequests.$inferSelect;
export type NewPurchaseRequest = typeof purchaseRequests.$inferInsert;
export type Rfq = typeof rfqs.$inferSelect;
export type NewRfq = typeof rfqs.$inferInsert;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type NewPurchaseOrder = typeof purchaseOrders.$inferInsert;
