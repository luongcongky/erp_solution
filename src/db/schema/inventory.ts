import { pgTable, uuid, varchar, text, boolean, decimal, timestamp, jsonb, pgSchema, pgEnum, date } from 'drizzle-orm/pg-core';

// Inventory schema
export const inventorySchema = pgSchema('inventory');

// Enums
export const itemTypeEnum = pgEnum('item_type', ['raw_material', 'semi_finished', 'finished', 'service']);
export const trackingEnum = pgEnum('tracking', ['none', 'batch', 'serial']);
export const movementTypeEnum = pgEnum('movement_type', ['in', 'out', 'transfer', 'adjustment']);

// Items table
export const items = inventorySchema.table('items', {
    id: uuid('id').primaryKey().defaultRandom(),
    sku: varchar('sku', { length: 100 }).notNull().unique(),
    name: varchar('name', { length: 200 }).notNull(),
    description: text('description'),
    itemType: itemTypeEnum('item_type').default('finished'),
    baseUom: varchar('base_uom', { length: 20 }).default('pcs'),
    attributes: jsonb('attributes').default({}),
    tracking: trackingEnum('tracking').default('none'),
    expiryControl: boolean('expiry_control').default(false),
    minStock: decimal('min_stock', { precision: 18, scale: 4 }).default('0'),
    maxStock: decimal('max_stock', { precision: 18, scale: 4 }).default('0'),
    isActive: boolean('is_active').default(true),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Warehouses table
export const warehouses = inventorySchema.table('warehouses', {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 200 }).notNull(),
    address: jsonb('address'),
    isActive: boolean('is_active').default(true),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Locations table
export const locations = inventorySchema.table('locations', {
    id: uuid('id').primaryKey().defaultRandom(),
    warehouseId: uuid('warehouse_id').notNull().references(() => warehouses.id),
    parentLocationId: uuid('parent_location_id'),
    code: varchar('code', { length: 50 }).notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    path: varchar('path', { length: 500 }),
    meta: jsonb('meta'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Stock Lots table
export const stockLots = inventorySchema.table('stock_lots', {
    id: uuid('id').primaryKey().defaultRandom(),
    itemId: uuid('item_id').notNull().references(() => items.id),
    lotNumber: varchar('lot_number', { length: 100 }).notNull(),
    supplierLot: varchar('supplier_lot', { length: 100 }),
    expiryDate: date('expiry_date'),
    manufactureDate: date('manufacture_date'),
    meta: jsonb('meta'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Stock Balance table
export const stockBalance = inventorySchema.table('stock_balance', {
    id: uuid('id').primaryKey().defaultRandom(),
    itemId: uuid('item_id').notNull().references(() => items.id),
    warehouseId: uuid('warehouse_id').notNull().references(() => warehouses.id),
    locationId: uuid('location_id').references(() => locations.id),
    lotId: uuid('lot_id').references(() => stockLots.id),
    quantity: decimal('quantity', { precision: 18, scale: 4 }).notNull().default('0'),
    reservedQty: decimal('reserved_qty', { precision: 18, scale: 4 }).default('0'),
    availableQty: decimal('available_qty', { precision: 18, scale: 4 }).default('0'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Stock Movement table
export const stockMovement = inventorySchema.table('stock_movements', {
    id: uuid('id').primaryKey().defaultRandom(),
    reference: varchar('reference', { length: 100 }),
    itemId: uuid('item_id').notNull().references(() => items.id),
    lotId: uuid('lot_id').references(() => stockLots.id),
    fromWarehouseId: uuid('from_warehouse_id'),
    fromLocationId: uuid('from_location_id'),
    toWarehouseId: uuid('to_warehouse_id'),
    toLocationId: uuid('to_location_id'),
    quantity: decimal('quantity', { precision: 18, scale: 4 }).notNull(),
    uom: varchar('uom', { length: 20 }).notNull(),
    date: timestamp('date'),
    createdBy: uuid('created_by'),
    meta: jsonb('meta'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// UOM Conversion table
export const uomConversion = inventorySchema.table('uom_conversions', {
    id: uuid('id').primaryKey().defaultRandom(),
    itemId: uuid('item_id').notNull().references(() => items.id),
    fromUom: varchar('from_uom', { length: 20 }).notNull(),
    toUom: varchar('to_uom', { length: 20 }).notNull(),
    conversionFactor: decimal('conversion_factor', { precision: 18, scale: 6 }).notNull(),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Inventory Count table
export const inventoryCount = inventorySchema.table('inventory_counts', {
    id: uuid('id').primaryKey().defaultRandom(),
    countNumber: varchar('count_number', { length: 50 }).notNull().unique(),
    warehouseId: uuid('warehouse_id').notNull().references(() => warehouses.id),
    countDate: timestamp('count_date').notNull(),
    status: varchar('status', { length: 20 }).default('draft'),
    notes: text('notes'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Inventory Count Lines table
export const inventoryCountLines = inventorySchema.table('inventory_count_lines', {
    id: uuid('id').primaryKey().defaultRandom(),
    countId: uuid('count_id').notNull().references(() => inventoryCount.id),
    itemId: uuid('item_id').notNull().references(() => items.id),
    locationId: uuid('location_id').references(() => locations.id),
    systemQty: decimal('system_qty', { precision: 18, scale: 4 }).default('0'),
    countedQty: decimal('counted_qty', { precision: 18, scale: 4 }).default('0'),
    variance: decimal('variance', { precision: 18, scale: 4 }).default('0'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
});

// Type exports
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type Warehouse = typeof warehouses.$inferSelect;
export type NewWarehouse = typeof warehouses.$inferInsert;
export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;
export type StockLot = typeof stockLots.$inferSelect;
export type NewStockLot = typeof stockLots.$inferInsert;
export type StockBalance = typeof stockBalance.$inferSelect;
export type NewStockBalance = typeof stockBalance.$inferInsert;
export type StockMovement = typeof stockMovement.$inferSelect;
export type NewStockMovement = typeof stockMovement.$inferInsert;
