import { pgTable, uuid, varchar, text, decimal, timestamp, date, integer, boolean, pgSchema } from 'drizzle-orm/pg-core';

// Manufacturing schema
export const manufacturingSchema = pgSchema('manufacturing');

// BOMs (Bill of Materials) table
export const boms = manufacturingSchema.table('boms', {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id').notNull(),
    version: varchar('version', { length: 20 }).default('1.0'),
    isActive: boolean('is_active').default(true),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Work Orders table
export const workOrders = manufacturingSchema.table('work_orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    woNumber: varchar('wo_number', { length: 50 }).notNull().unique(),
    productId: uuid('product_id').notNull(),
    quantity: decimal('quantity', { precision: 18, scale: 4 }).notNull(),
    startDate: date('start_date'),
    endDate: date('end_date'),
    status: varchar('status', { length: 20 }).default('draft'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Quality Checks table
export const qualityChecks = manufacturingSchema.table('quality_checks', {
    id: uuid('id').primaryKey().defaultRandom(),
    workOrderId: uuid('work_order_id').references(() => workOrders.id),
    checkDate: timestamp('check_date').notNull(),
    inspector: varchar('inspector', { length: 100 }),
    result: varchar('result', { length: 20 }).default('pending'),
    notes: text('notes'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Type exports
export type Bom = typeof boms.$inferSelect;
export type NewBom = typeof boms.$inferInsert;
export type WorkOrder = typeof workOrders.$inferSelect;
export type NewWorkOrder = typeof workOrders.$inferInsert;
export type QualityCheck = typeof qualityChecks.$inferSelect;
export type NewQualityCheck = typeof qualityChecks.$inferInsert;
