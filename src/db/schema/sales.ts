import { pgTable, uuid, varchar, text, decimal, timestamp, date, pgSchema } from 'drizzle-orm/pg-core';

// Sales schema
export const salesSchema = pgSchema('sales');

// Leads table
export const leads = salesSchema.table('leads', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 200 }).notNull(),
    company: varchar('company', { length: 200 }),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 50 }),
    source: varchar('source', { length: 100 }),
    status: varchar('status', { length: 50 }).default('new'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Opportunities table
export const opportunities = salesSchema.table('opportunities', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 200 }).notNull(),
    leadId: uuid('lead_id').references(() => leads.id),
    expectedRevenue: decimal('expected_revenue', { precision: 18, scale: 2 }),
    probability: decimal('probability', { precision: 5, scale: 2 }),
    stage: varchar('stage', { length: 50 }).default('qualification'),
    expectedCloseDate: date('expected_close_date'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Quotations table
export const quotations = salesSchema.table('quotations', {
    id: uuid('id').primaryKey().defaultRandom(),
    quoteNumber: varchar('quote_number', { length: 50 }).notNull().unique(),
    opportunityId: uuid('opportunity_id').references(() => opportunities.id),
    quoteDate: date('quote_date').notNull(),
    validUntil: date('valid_until'),
    subtotal: decimal('subtotal', { precision: 18, scale: 2 }).notNull(),
    taxAmount: decimal('tax_amount', { precision: 18, scale: 2 }).default('0'),
    total: decimal('total', { precision: 18, scale: 2 }).notNull(),
    status: varchar('status', { length: 20 }).default('draft'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Sales Orders table
export const salesOrders = salesSchema.table('sales_orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
    customerId: uuid('customer_id').notNull(),
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
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Opportunity = typeof opportunities.$inferSelect;
export type NewOpportunity = typeof opportunities.$inferInsert;
export type Quotation = typeof quotations.$inferSelect;
export type NewQuotation = typeof quotations.$inferInsert;
export type SalesOrder = typeof salesOrders.$inferSelect;
export type NewSalesOrder = typeof salesOrders.$inferInsert;
