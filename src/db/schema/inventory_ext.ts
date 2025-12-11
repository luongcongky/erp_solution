import { pgTable, uuid, varchar, text, decimal, timestamp, pgSchema } from 'drizzle-orm/pg-core';
import { items } from './inventory';

// Inventory Extensions schema for industry-specific fields
export const inventoryExtSchema = pgSchema('inventory_ext');

// ============================================
// PLASTICS INDUSTRY EXTENSION
// ============================================

export const itemPlastics = inventoryExtSchema.table('item_plastics', {
    id: uuid('id').primaryKey().defaultRandom(),
    itemId: uuid('item_id').notNull().references(() => items.id, { onDelete: 'cascade' }),

    // Plastic-specific properties
    resinType: varchar('resin_type', { length: 50 }),
    grade: varchar('grade', { length: 50 }),
    meltFlowIndex: decimal('melt_flow_index', { precision: 18, scale: 4 }),
    density: decimal('density', { precision: 18, scale: 4 }),
    color: varchar('color', { length: 50 }),
    additivesPercent: decimal('additives_percent', { precision: 5, scale: 2 }),
    recycledContent: decimal('recycled_content', { precision: 5, scale: 2 }),

    // Processing parameters
    meltingTemp: decimal('melting_temp', { precision: 18, scale: 2 }),
    moldingTemp: decimal('molding_temp', { precision: 18, scale: 2 }),
    coolingTime: decimal('cooling_time', { precision: 18, scale: 2 }),

    // Additional info
    manufacturer: varchar('manufacturer', { length: 200 }),
    tradeName: varchar('trade_name', { length: 200 }),
    notes: text('notes'),

    // Multi-tenant
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// FOOD/FMCG INDUSTRY EXTENSION
// ============================================

export const itemFood = inventoryExtSchema.table('item_food', {
    id: uuid('id').primaryKey().defaultRandom(),
    itemId: uuid('item_id').notNull().references(() => items.id, { onDelete: 'cascade' }),

    // Food-specific properties
    ingredients: text('ingredients'),
    allergens: text('allergens').array(),
    nutritionalInfo: text('nutritional_info'),

    // Storage requirements
    storageTemp: varchar('storage_temp', { length: 50 }),
    storageHumidity: varchar('storage_humidity', { length: 50 }),
    storageInstructions: text('storage_instructions'),

    // Certifications
    certifications: text('certifications').array(),
    isHalal: varchar('is_halal', { length: 20 }),
    isOrganic: varchar('is_organic', { length: 20 }),
    isVegan: varchar('is_vegan', { length: 20 }),
    isGlutenFree: varchar('is_gluten_free', { length: 20 }),

    // Packaging
    servingSize: varchar('serving_size', { length: 50 }),
    servingsPerContainer: decimal('servings_per_container', { precision: 18, scale: 2 }),

    // Regulatory
    fdaApprovalNumber: varchar('fda_approval_number', { length: 100 }),
    batchCodeFormat: varchar('batch_code_format', { length: 100 }),

    // Additional info
    brand: varchar('brand', { length: 100 }),
    countryOfOrigin: varchar('country_of_origin', { length: 100 }),
    notes: text('notes'),

    // Multi-tenant
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// MECHANICAL/ENGINEERING EXTENSION
// ============================================

export const itemMechanical = inventoryExtSchema.table('item_mechanical', {
    id: uuid('id').primaryKey().defaultRandom(),
    itemId: uuid('item_id').notNull().references(() => items.id, { onDelete: 'cascade' }),

    // Engineering properties
    material: varchar('material', { length: 100 }),
    materialGrade: varchar('material_grade', { length: 50 }),
    drawingNumber: varchar('drawing_number', { length: 100 }),
    revision: varchar('revision', { length: 20 }),

    // Surface treatment
    surfaceTreatment: varchar('surface_treatment', { length: 100 }),
    coating: varchar('coating', { length: 100 }),
    finish: varchar('finish', { length: 100 }),

    // Mechanical properties
    hardness: varchar('hardness', { length: 50 }),
    tensileStrength: decimal('tensile_strength', { precision: 18, scale: 4 }),
    yieldStrength: decimal('yield_strength', { precision: 18, scale: 4 }),
    elongation: decimal('elongation', { precision: 18, scale: 4 }),

    // Tolerances
    tolerance: varchar('tolerance', { length: 50 }),
    toleranceClass: varchar('tolerance_class', { length: 20 }),

    // Standards
    standard: varchar('standard', { length: 100 }),
    specification: varchar('specification', { length: 100 }),

    // Additional info
    manufacturer: varchar('manufacturer', { length: 200 }),
    manufacturerPartNumber: varchar('manufacturer_part_number', { length: 100 }),
    notes: text('notes'),

    // Multi-tenant
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// TEXTILE/GARMENT EXTENSION
// ============================================

export const itemTextile = inventoryExtSchema.table('item_textile', {
    id: uuid('id').primaryKey().defaultRandom(),
    itemId: uuid('item_id').notNull().references(() => items.id, { onDelete: 'cascade' }),

    // Textile properties
    fabricType: varchar('fabric_type', { length: 100 }),
    composition: text('composition'),
    gsm: decimal('gsm', { precision: 18, scale: 2 }),
    threadCount: decimal('thread_count', { precision: 18, scale: 2 }),

    // Garment properties
    color: varchar('color', { length: 50 }),
    colorCode: varchar('color_code', { length: 50 }),
    size: varchar('size', { length: 20 }),
    sizeChart: varchar('size_chart', { length: 50 }),

    // Collection info
    season: varchar('season', { length: 50 }),
    collection: varchar('collection', { length: 100 }),
    style: varchar('style', { length: 100 }),
    styleNumber: varchar('style_number', { length: 100 }),

    // Brand & Origin
    brand: varchar('brand', { length: 100 }),
    designer: varchar('designer', { length: 100 }),
    countryOfOrigin: varchar('country_of_origin', { length: 100 }),

    // Care instructions
    washingInstructions: text('washing_instructions'),
    careLabel: varchar('care_label', { length: 200 }),

    // Certifications
    certifications: text('certifications').array(),
    isOrganic: varchar('is_organic', { length: 20 }),
    isFairTrade: varchar('is_fair_trade', { length: 20 }),

    // Additional info
    pattern: varchar('pattern', { length: 100 }),
    printType: varchar('print_type', { length: 100 }),
    notes: text('notes'),

    // Multi-tenant
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type ItemPlastic = typeof itemPlastics.$inferSelect;
export type NewItemPlastic = typeof itemPlastics.$inferInsert;

export type ItemFood = typeof itemFood.$inferSelect;
export type NewItemFood = typeof itemFood.$inferInsert;

export type ItemMechanical = typeof itemMechanical.$inferSelect;
export type NewItemMechanical = typeof itemMechanical.$inferInsert;

export type ItemTextile = typeof itemTextile.$inferSelect;
export type NewItemTextile = typeof itemTextile.$inferInsert;
