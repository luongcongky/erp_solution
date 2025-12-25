/**
 * Inventory Setup Repository
 * Data access layer for inventory_setup table
 */

import { BaseRepository } from './BaseRepository.js';
import { inventorySetup, items, warehouses } from '@/db/schema/inventory';
import { eq, and, sql, inArray, asc } from 'drizzle-orm';
import { DatabaseError } from '@/lib/errors.js';

export class InventorySetupRepository extends BaseRepository {
    constructor() {
        super(inventorySetup, 'InventorySetup');
    }

    /**
     * Find all inventory setups with optional filtering and joins
     */
    async findAll(tenantContext, filters = {}) {
        try {
            const { ten_id, stg_id } = tenantContext;
            const conditions = [
                eq(inventorySetup.tenId, ten_id),
                eq(inventorySetup.stgId, stg_id)
            ];

            // Add warehouse filter
            if (filters.warehouseId) {
                if (Array.isArray(filters.warehouseId)) {
                    conditions.push(inArray(inventorySetup.warehouseId, filters.warehouseId));
                } else {
                    conditions.push(eq(inventorySetup.warehouseId, filters.warehouseId));
                }
            }

            // Add item type filter (requires join with items)
            if (filters.itemType) {
                conditions.push(eq(items.itemType, filters.itemType));
            }

            // Add tracking filter
            if (filters.tracking) {
                conditions.push(eq(inventorySetup.tracking, filters.tracking));
            }

            // Add item group filter
            if (filters.itemGroupId) {
                conditions.push(eq(items.itemGroupId, filters.itemGroupId));
            }

            // Add item category filter
            if (filters.itemCategoryId) {
                conditions.push(eq(items.itemCategoryId, filters.itemCategoryId));
            }

            // Add low stock configured filter
            if (filters.lowStockConfigured !== undefined) {
                if (filters.lowStockConfigured) {
                    conditions.push(sql`${inventorySetup.reorderPoint} IS NOT NULL`);
                } else {
                    conditions.push(sql`${inventorySetup.reorderPoint} IS NULL`);
                }
            }

            // Add active filter
            if (filters.isActive !== undefined) {
                conditions.push(eq(inventorySetup.isActive, filters.isActive));
            }

            console.log('[InventorySetupRepository] Executing query with filters:', filters);

            const results = await this.db
                .select({
                    id: inventorySetup.id,
                    itemId: inventorySetup.itemId,
                    itemCode: items.sku,
                    itemName: items.name,
                    itemType: items.itemType,
                    warehouseId: inventorySetup.warehouseId,
                    warehouseCode: warehouses.code,
                    warehouseName: warehouses.name,
                    tracking: inventorySetup.tracking,
                    reorderPoint: inventorySetup.reorderPoint,
                    reorderQty: inventorySetup.reorderQty,
                    minStock: inventorySetup.minStock,
                    maxStock: inventorySetup.maxStock,
                    safetyStock: inventorySetup.safetyStock,
                    valuationMethod: inventorySetup.valuationMethod,
                    isStocked: inventorySetup.isStocked,
                    allowNegativeStock: inventorySetup.allowNegativeStock,
                    isActive: inventorySetup.isActive,
                    notes: inventorySetup.notes,
                    createdAt: inventorySetup.createdAt,
                    updatedAt: inventorySetup.updatedAt,
                })
                .from(inventorySetup)
                .leftJoin(items, eq(inventorySetup.itemId, items.id))
                .leftJoin(warehouses, eq(inventorySetup.warehouseId, warehouses.id))
                .where(and(...conditions))
                .orderBy(asc(items.sku), asc(warehouses.code));

            console.log('[InventorySetupRepository] Query executed successfully, results:', results.length);

            // Transform results to ensure proper serialization
            const transformedResults = results.map(row => ({
                ...row,
                // Convert Date objects to ISO strings
                createdAt: row.createdAt ? row.createdAt.toISOString() : null,
                updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
                // Convert decimal values to strings to avoid precision issues
                reorderPoint: row.reorderPoint ? row.reorderPoint.toString() : null,
                reorderQty: row.reorderQty ? row.reorderQty.toString() : null,
                minStock: row.minStock ? row.minStock.toString() : null,
                maxStock: row.maxStock ? row.maxStock.toString() : null,
                safetyStock: row.safetyStock ? row.safetyStock.toString() : null,
            }));

            return transformedResults;
        } catch (error) {
            console.error('[InventorySetupRepository] Error in findAll:', error);
            console.error('[InventorySetupRepository] Error stack:', error.stack);
            console.error('[InventorySetupRepository] Filters:', filters);
            throw new DatabaseError('Failed to fetch inventory setups', error);
        }
    }

    /**
     * Find inventory setup by ID with item and warehouse details
     */
    async findById(id, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;

            const [result] = await this.db
                .select({
                    id: inventorySetup.id,
                    itemId: inventorySetup.itemId,
                    itemCode: items.sku,
                    itemName: items.name,
                    itemType: items.itemType,
                    warehouseId: inventorySetup.warehouseId,
                    warehouseCode: warehouses.code,
                    warehouseName: warehouses.name,
                    tracking: inventorySetup.tracking,
                    reorderPoint: inventorySetup.reorderPoint,
                    reorderQty: inventorySetup.reorderQty,
                    minStock: inventorySetup.minStock,
                    maxStock: inventorySetup.maxStock,
                    safetyStock: inventorySetup.safetyStock,
                    valuationMethod: inventorySetup.valuationMethod,
                    isStocked: inventorySetup.isStocked,
                    allowNegativeStock: inventorySetup.allowNegativeStock,
                    isActive: inventorySetup.isActive,
                    notes: inventorySetup.notes,
                    createdAt: inventorySetup.createdAt,
                    updatedAt: inventorySetup.updatedAt,
                })
                .from(inventorySetup)
                .leftJoin(items, eq(inventorySetup.itemId, items.id))
                .leftJoin(warehouses, eq(inventorySetup.warehouseId, warehouses.id))
                .where(and(
                    eq(inventorySetup.id, id),
                    eq(inventorySetup.tenId, ten_id),
                    eq(inventorySetup.stgId, stg_id)
                ))
                .limit(1);

            return result || null;
        } catch (error) {
            throw new DatabaseError('Failed to fetch inventory setup', error);
        }
    }

    /**
     * Check if setup already exists for item-warehouse combination
     */
    async setupExists(itemId, warehouseId, tenantContext, excludeId = null) {
        try {
            const conditions = [
                eq(inventorySetup.itemId, itemId),
                eq(inventorySetup.warehouseId, warehouseId),
                ...this.buildTenantFilter(tenantContext)
            ];

            if (excludeId) {
                conditions.push(sql`${inventorySetup.id} != ${excludeId}`);
            }

            const [existing] = await this.db
                .select({ id: inventorySetup.id })
                .from(inventorySetup)
                .where(and(...conditions))
                .limit(1);

            return !!existing;
        } catch (error) {
            throw new DatabaseError('Failed to check setup existence', error);
        }
    }

    /**
     * Create inventory setup
     */
    async create(data, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;
            const [newSetup] = await this.db.insert(inventorySetup).values({
                ...data,
                tenId: ten_id,
                stgId: stg_id
            }).returning();
            return newSetup;
        } catch (error) {
            throw new DatabaseError('Failed to create inventory setup', error);
        }
    }

    /**
     * Update inventory setup
     */
    async update(id, data, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;
            const [updated] = await this.db
                .update(inventorySetup)
                .set({
                    ...data,
                    updatedAt: new Date()
                })
                .where(and(
                    eq(inventorySetup.id, id),
                    eq(inventorySetup.tenId, ten_id),
                    eq(inventorySetup.stgId, stg_id)
                ))
                .returning();
            return updated;
        } catch (error) {
            throw new DatabaseError('Failed to update inventory setup', error);
        }
    }

    /**
     * Bulk update inventory setups
     */
    async bulkUpdate(ids, data, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;

            const updated = await this.db
                .update(inventorySetup)
                .set({
                    ...data,
                    updatedAt: new Date()
                })
                .where(and(
                    inArray(inventorySetup.id, ids),
                    eq(inventorySetup.tenId, ten_id),
                    eq(inventorySetup.stgId, stg_id)
                ))
                .returning();

            return updated;
        } catch (error) {
            throw new DatabaseError('Failed to bulk update inventory setups', error);
        }
    }

    /**
     * Soft delete inventory setup
     */
    async delete(id, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;
            const [deleted] = await this.db
                .update(inventorySetup)
                .set({
                    isActive: false,
                    updatedAt: new Date()
                })
                .where(and(
                    eq(inventorySetup.id, id),
                    eq(inventorySetup.tenId, ten_id),
                    eq(inventorySetup.stgId, stg_id)
                ))
                .returning();
            return deleted;
        } catch (error) {
            throw new DatabaseError('Failed to delete inventory setup', error);
        }
    }

    /**
     * Build tenant filter
     */
    buildTenantFilter(tenantContext) {
        const { ten_id, stg_id } = tenantContext;
        return [
            eq(inventorySetup.tenId, ten_id),
            eq(inventorySetup.stgId, stg_id)
        ];
    }
}

// Export singleton instance
let inventorySetupRepositoryInstance = null;

export function getInventorySetupRepository() {
    if (!inventorySetupRepositoryInstance) {
        inventorySetupRepositoryInstance = new InventorySetupRepository();
    }
    return inventorySetupRepositoryInstance;
}
