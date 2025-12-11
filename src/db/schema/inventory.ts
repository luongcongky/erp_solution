import { pgTable, uuid, varchar, text, boolean, decimal, timestamp, jsonb, pgSchema, pgEnum, date, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Inventory schema
export const inventorySchema = pgSchema('inventory');

// Enums
export const itemTypeEnum = pgEnum('item_type', ['raw_material', 'semi_finished', 'finished', 'service', 'asset']);
export const trackingEnum = pgEnum('tracking', ['none', 'batch', 'serial']);
export const movementTypeEnum = pgEnum('movement_type', ['in', 'out', 'transfer', 'adjustment']);
export const abcClassificationEnum = pgEnum('abc_classification', ['A', 'B', 'C']);
export const costingMethodEnum = pgEnum('costing_method', ['FIFO', 'LIFO', 'Average', 'Standard']);
export const barcodeTypeEnum = pgEnum('barcode_type', ['EAN13', 'UPC', 'CODE128', 'QR', 'Custom']);
export const uomTypeEnum = pgEnum('uom_type', ['Quantity', 'Weight', 'Volume', 'Length', 'Area', 'Time']);
export const imageTypeEnum = pgEnum('image_type', ['Product', 'Technical', 'Certificate', 'Other']);
export const documentTypeEnum = pgEnum('document_type', ['Datasheet', 'MSDS', 'Certificate', 'Drawing', 'Manual', 'Other']);

// ============================================
// MASTER DATA TABLES
// ============================================

// Item Groups table
export const itemGroups = inventorySchema.table('item_groups', {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 200 }).notNull(),
    parentGroupId: uuid('parent_group_id'),
    description: text('description'),
    isActive: boolean('is_active').default(true),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Item Categories table
export const itemCategories = inventorySchema.table('item_categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 200 }).notNull(),
    itemGroupId: uuid('item_group_id').references(() => itemGroups.id),
    description: text('description'),
    isActive: boolean('is_active').default(true),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// UOM Master table
export const uomMaster = inventorySchema.table('uom_master', {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 20 }).notNull().unique(),
    name: varchar('name', { length: 100 }).notNull(),
    uomType: uomTypeEnum('uom_type').default('Quantity'),
    symbol: varchar('symbol', { length: 10 }),
    isActive: boolean('is_active').default(true),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Price Lists table
export const priceLists = inventorySchema.table('price_lists', {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 200 }).notNull(),
    description: text('description'),
    isDefault: boolean('is_default').default(false),
    isActive: boolean('is_active').default(true),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// ENHANCED ITEMS TABLE
// ============================================

export const items = inventorySchema.table('items', {
    id: uuid('id').primaryKey().defaultRandom(),

    // Basic Information
    sku: varchar('sku', { length: 100 }).notNull().unique(),
    name: varchar('name', { length: 200 }).notNull(),
    shortName: varchar('short_name', { length: 50 }),
    description: text('description'),
    searchKeywords: text('search_keywords'),
    hsCode: varchar('hs_code', { length: 20 }),

    // Classification
    itemType: itemTypeEnum('item_type').default('finished'),
    itemGroupId: uuid('item_group_id').references(() => itemGroups.id),
    itemCategoryId: uuid('item_category_id').references(() => itemCategories.id),

    // UOM
    baseUomId: uuid('base_uom_id').references(() => uomMaster.id),

    // Tracking
    tracking: trackingEnum('tracking').default('none'),
    expiryControl: boolean('expiry_control').default(false),
    shelfLifeDays: integer('shelf_life_days'),

    // Purchasing
    isPurchaseItem: boolean('is_purchase_item').default(false),
    defaultSupplierId: uuid('default_supplier_id'),
    purchaseUomId: uuid('purchase_uom_id').references(() => uomMaster.id),
    leadTimeDays: integer('lead_time_days'),

    // Sales
    isSalesItem: boolean('is_sales_item').default(false),
    salesUomId: uuid('sales_uom_id').references(() => uomMaster.id),
    warrantyMonths: integer('warranty_months'),

    // Manufacturing
    isManufacturedItem: boolean('is_manufactured_item').default(false),
    hasBom: boolean('has_bom').default(false),

    // Inventory Control
    minStock: decimal('min_stock', { precision: 18, scale: 4 }).default('0'),
    maxStock: decimal('max_stock', { precision: 18, scale: 4 }).default('0'),
    reorderPoint: decimal('reorder_point', { precision: 18, scale: 4 }).default('0'),
    reorderQty: decimal('reorder_qty', { precision: 18, scale: 4 }).default('0'),
    safetyStock: decimal('safety_stock', { precision: 18, scale: 4 }).default('0'),
    abcClassification: abcClassificationEnum('abc_classification'),

    // Quality Control
    requiresQc: boolean('requires_qc').default(false),
    qcTemplateId: uuid('qc_template_id'),

    // Costing & Pricing
    standardCost: decimal('standard_cost', { precision: 18, scale: 4 }).default('0'),
    lastPurchasePrice: decimal('last_purchase_price', { precision: 18, scale: 4 }).default('0'),
    defaultSellingPrice: decimal('default_selling_price', { precision: 18, scale: 4 }).default('0'),
    costingMethod: costingMethodEnum('costing_method').default('FIFO'),

    // Dimensions & Weight
    weight: decimal('weight', { precision: 18, scale: 4 }),
    weightUom: varchar('weight_uom', { length: 10 }),
    length: decimal('length', { precision: 18, scale: 4 }),
    width: decimal('width', { precision: 18, scale: 4 }),
    height: decimal('height', { precision: 18, scale: 4 }),
    dimensionUom: varchar('dimension_uom', { length: 10 }),

    // Images
    primaryImageUrl: varchar('primary_image_url', { length: 500 }),

    // Metadata
    notes: text('notes'),
    tags: text('tags').array(),
    attributes: jsonb('attributes').default({}),

    // Status
    isActive: boolean('is_active').default(true),

    // Multi-tenant
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// ITEM RELATED TABLES
// ============================================

// Item Barcodes table
export const itemBarcodes = inventorySchema.table('item_barcodes', {
    id: uuid('id').primaryKey().defaultRandom(),
    itemId: uuid('item_id').notNull().references(() => items.id, { onDelete: 'cascade' }),
    barcode: varchar('barcode', { length: 100 }).notNull().unique(),
    barcodeType: barcodeTypeEnum('barcode_type').default('EAN13'),
    uomId: uuid('uom_id').references(() => uomMaster.id),
    isPrimary: boolean('is_primary').default(false),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Item Suppliers table
export const itemSuppliers = inventorySchema.table('item_suppliers', {
    id: uuid('id').primaryKey().defaultRandom(),
    itemId: uuid('item_id').notNull().references(() => items.id, { onDelete: 'cascade' }),
    supplierId: uuid('supplier_id').notNull(),
    supplierPartNumber: varchar('supplier_part_number', { length: 100 }),
    supplierPartName: varchar('supplier_part_name', { length: 200 }),
    leadTimeDays: integer('lead_time_days'),
    minOrderQty: decimal('min_order_qty', { precision: 18, scale: 4 }),
    pricePerUnit: decimal('price_per_unit', { precision: 18, scale: 4 }),
    currency: varchar('currency', { length: 3 }).default('USD'),
    isPreferred: boolean('is_preferred').default(false),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Item Customers table
export const itemCustomers = inventorySchema.table('item_customers', {
    id: uuid('id').primaryKey().defaultRandom(),
    itemId: uuid('item_id').notNull().references(() => items.id, { onDelete: 'cascade' }),
    customerId: uuid('customer_id').notNull(),
    customerPartNumber: varchar('customer_part_number', { length: 100 }),
    customerPartName: varchar('customer_part_name', { length: 200 }),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Item Prices table
export const itemPrices = inventorySchema.table('item_prices', {
    id: uuid('id').primaryKey().defaultRandom(),
    itemId: uuid('item_id').notNull().references(() => items.id, { onDelete: 'cascade' }),
    priceListId: uuid('price_list_id').notNull().references(() => priceLists.id),
    uomId: uuid('uom_id').references(() => uomMaster.id),
    price: decimal('price', { precision: 18, scale: 4 }).notNull(),
    currency: varchar('currency', { length: 3 }).default('USD'),
    minQty: decimal('min_qty', { precision: 18, scale: 4 }).default('1'),
    validFrom: date('valid_from'),
    validTo: date('valid_to'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Item Specifications table
export const itemSpecifications = inventorySchema.table('item_specifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    itemId: uuid('item_id').notNull().references(() => items.id, { onDelete: 'cascade' }),
    specKey: varchar('spec_key', { length: 100 }).notNull(),
    specValue: text('spec_value'),
    specUnit: varchar('spec_unit', { length: 20 }),
    specGroup: varchar('spec_group', { length: 50 }),
    displayOrder: integer('display_order').default(0),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Item Images table
export const itemImages = inventorySchema.table('item_images', {
    id: uuid('id').primaryKey().defaultRandom(),
    itemId: uuid('item_id').notNull().references(() => items.id, { onDelete: 'cascade' }),
    imageUrl: varchar('image_url', { length: 500 }).notNull(),
    imageType: imageTypeEnum('image_type').default('Product'),
    isPrimary: boolean('is_primary').default(false),
    displayOrder: integer('display_order').default(0),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Item Documents table
export const itemDocuments = inventorySchema.table('item_documents', {
    id: uuid('id').primaryKey().defaultRandom(),
    itemId: uuid('item_id').notNull().references(() => items.id, { onDelete: 'cascade' }),
    documentName: varchar('document_name', { length: 200 }).notNull(),
    documentUrl: varchar('document_url', { length: 500 }).notNull(),
    documentType: documentTypeEnum('document_type').default('Other'),
    version: varchar('version', { length: 20 }),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Item Variants table
export const itemVariants = inventorySchema.table('item_variants', {
    id: uuid('id').primaryKey().defaultRandom(),
    parentItemId: uuid('parent_item_id').notNull().references(() => items.id),
    variantItemId: uuid('variant_item_id').notNull().references(() => items.id),
    variantType: varchar('variant_type', { length: 50 }),
    variantValue: varchar('variant_value', { length: 100 }),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// EXISTING TABLES (KEPT AS-IS)
// ============================================

// Warehouses table
export const warehouses = inventorySchema.table('warehouses', {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 200 }).notNull(),
    address: jsonb('address'),
    isActive: boolean('is_active').default(true),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
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
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
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
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
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
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
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

// UOM Conversion table (ENHANCED)
export const uomConversion = inventorySchema.table('uom_conversions', {
    id: uuid('id').primaryKey().defaultRandom(),
    itemId: uuid('item_id').notNull().references(() => items.id),
    fromUomId: uuid('from_uom_id').notNull().references(() => uomMaster.id),
    toUomId: uuid('to_uom_id').notNull().references(() => uomMaster.id),
    conversionFactor: decimal('conversion_factor', { precision: 18, scale: 6 }).notNull(),
    isDefault: boolean('is_default').default(false),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
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
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
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

// ============================================
// TYPE EXPORTS
// ============================================

export type ItemGroup = typeof itemGroups.$inferSelect;
export type NewItemGroup = typeof itemGroups.$inferInsert;

export type ItemCategory = typeof itemCategories.$inferSelect;
export type NewItemCategory = typeof itemCategories.$inferInsert;

export type UomMaster = typeof uomMaster.$inferSelect;
export type NewUomMaster = typeof uomMaster.$inferInsert;

export type PriceList = typeof priceLists.$inferSelect;
export type NewPriceList = typeof priceLists.$inferInsert;

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;

export type ItemBarcode = typeof itemBarcodes.$inferSelect;
export type NewItemBarcode = typeof itemBarcodes.$inferInsert;

export type ItemSupplier = typeof itemSuppliers.$inferSelect;
export type NewItemSupplier = typeof itemSuppliers.$inferInsert;

export type ItemCustomer = typeof itemCustomers.$inferSelect;
export type NewItemCustomer = typeof itemCustomers.$inferInsert;

export type ItemPrice = typeof itemPrices.$inferSelect;
export type NewItemPrice = typeof itemPrices.$inferInsert;

export type ItemSpecification = typeof itemSpecifications.$inferSelect;
export type NewItemSpecification = typeof itemSpecifications.$inferInsert;

export type ItemImage = typeof itemImages.$inferSelect;
export type NewItemImage = typeof itemImages.$inferInsert;

export type ItemDocument = typeof itemDocuments.$inferSelect;
export type NewItemDocument = typeof itemDocuments.$inferInsert;

export type ItemVariant = typeof itemVariants.$inferSelect;
export type NewItemVariant = typeof itemVariants.$inferInsert;

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

export type UomConversion = typeof uomConversion.$inferSelect;
export type NewUomConversion = typeof uomConversion.$inferInsert;

export type InventoryCount = typeof inventoryCount.$inferSelect;
export type NewInventoryCount = typeof inventoryCount.$inferInsert;

export type InventoryCountLine = typeof inventoryCountLines.$inferSelect;
export type NewInventoryCountLine = typeof inventoryCountLines.$inferInsert;
