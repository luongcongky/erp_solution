/**
 * Item Repository
 * Data access layer for items table
 */

import { BaseRepository } from './BaseRepository.js';
import { items, itemGroups, itemCategories, uomMaster, warehouses } from '@/db/schema/inventory';
import { eq, and, sql, or, like, ilike } from 'drizzle-orm';
import { DatabaseError } from '@/lib/errors.js';

export class ItemRepository extends BaseRepository {
    constructor() {
        super(items, 'Item');
    }

    /**
     * Find item by SKU
     */
    async findBySku(sku, tenantContext) {
        try {
            const conditions = [
                eq(items.sku, sku),
                ...this.buildTenantFilter(tenantContext)
            ];

            const [item] = await this.db
                .select()
                .from(items)
                .where(and(...conditions))
                .limit(1);

            return item || null;
        } catch (error) {
            throw new DatabaseError('Failed to find item by SKU', error);
        }
    }

    /**
     * Check if SKU already exists
     */
    async skuExists(sku, tenantContext, excludeId = null) {
        try {
            const conditions = [
                eq(items.sku, sku),
                ...this.buildTenantFilter(tenantContext)
            ];

            if (excludeId) {
                conditions.push(sql`${items.id} != ${excludeId}`);
            }

            const [existing] = await this.db
                .select({ id: items.id })
                .from(items)
                .where(and(...conditions))
                .limit(1);

            return !!existing;
        } catch (error) {
            throw new DatabaseError('Failed to check SKU existence', error);
        }
    }

    /**
     * Find item with all relations (group, category, UOMs)
     */
    async findWithRelations(id, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;

            const result = await this.db.execute(sql`
                SELECT 
                    i.*,
                    ig.id as "itemGroup.id",
                    ig.code as "itemGroup.code",
                    ig.name as "itemGroup.name",
                    ic.id as "itemCategory.id",
                    ic.code as "itemCategory.code",
                    ic.name as "itemCategory.name",
                    uom_base.id as "baseUom.id",
                    uom_base.code as "baseUom.code",
                    uom_base.name as "baseUom.name",
                    uom_base.symbol as "baseUom.symbol",
                    uom_purchase.id as "purchaseUom.id",
                    uom_purchase.code as "purchaseUom.code",
                    uom_purchase.name as "purchaseUom.name",
                    uom_sales.id as "salesUom.id",
                    uom_sales.code as "salesUom.code",
                    uom_sales.name as "salesUom.name"
                FROM inventory.items i
                LEFT JOIN inventory.item_groups ig ON i.item_group_id = ig.id
                LEFT JOIN inventory.item_categories ic ON i.item_category_id = ic.id
                LEFT JOIN inventory.uom_master uom_base ON i.base_uom_id = uom_base.id
                LEFT JOIN inventory.uom_master uom_purchase ON i.purchase_uom_id = uom_purchase.id
                LEFT JOIN inventory.uom_master uom_sales ON i.sales_uom_id = uom_sales.id
                WHERE i.id = ${id}
                  AND i.ten_id = ${ten_id}
                  AND i.stg_id = ${stg_id}
            `);

            if (!result.rows || result.rows.length === 0) {
                return null;
            }

            // Transform flat result to nested object
            const row = result.rows[0];
            return this.transformRelationalRow(row);
        } catch (error) {
            throw new DatabaseError('Failed to fetch item with relations', error);
        }
    }

    /**
     * Search items with filters
     */
    async search(query, filters, tenantContext, options = {}) {
        try {
            const { limit = 50, offset = 0, orderBy = 'createdAt', orderDir = 'desc' } = options;
            const { ten_id, stg_id } = tenantContext;

            // Build WHERE conditions
            let whereConditions = `i.ten_id = '${ten_id}' AND i.stg_id = '${stg_id}'`;

            // Full-text search
            if (query) {
                whereConditions += ` AND (
                    i.sku ILIKE '%${query}%' OR
                    i.name ILIKE '%${query}%' OR
                    i.description ILIKE '%${query}%' OR
                    i.search_keywords ILIKE '%${query}%'
                )`;
            }

            // Filters
            if (filters.itemType) {
                whereConditions += ` AND i.item_type = '${filters.itemType}'`;
            }
            if (filters.itemGroupId) {
                whereConditions += ` AND i.item_group_id = '${filters.itemGroupId}'`;
            }
            if (filters.itemCategoryId) {
                whereConditions += ` AND i.item_category_id = '${filters.itemCategoryId}'`;
            }
            if (filters.abcClassification) {
                whereConditions += ` AND i.abc_classification = '${filters.abcClassification}'`;
            }
            if (filters.isActive !== undefined) {
                whereConditions += ` AND i.is_active = ${filters.isActive}`;
            }
            if (filters.isPurchaseItem !== undefined) {
                whereConditions += ` AND i.is_purchase_item = ${filters.isPurchaseItem}`;
            }
            if (filters.isSalesItem !== undefined) {
                whereConditions += ` AND i.is_sales_item = ${filters.isSalesItem}`;
            }
            // Stock Limit Filters
            if (filters.hasMinStock === true) {
                whereConditions += ` AND i.min_stock IS NOT NULL`;
            }
            if (filters.hasMaxStock === true) {
                whereConditions += ` AND i.max_stock IS NOT NULL`;
            }

            // Order by
            const sortMapping = {
                'createdAt': 'created_at',
                'updatedAt': 'updated_at',
                'minStock': 'min_stock',
                'standardCost': 'standard_cost',
                'defaultSellingPrice': 'default_selling_price',
                'sku': 'sku',
                'name': 'name'
            };
            const sortColumn = sortMapping[orderBy] || 'created_at';
            const orderByClause = `i.${sortColumn} ${orderDir.toUpperCase()}`;

            const result = await this.db.execute(sql`
                SELECT 
                    i.id, i.sku, i.name, i.short_name as "shortName",
                    i.description,
                    i.item_group_id as "itemGroupId",
                    i.item_category_id as "itemCategoryId",
                    i.base_uom_id as "baseUomId",
                    i.is_active as "isActive",
                    i.is_purchase_item as "isPurchaseItem",
                    i.is_sales_item as "isSalesItem",
                    i.standard_cost as "standardCost",
                    i.default_selling_price as "defaultSellingPrice",
                    i.min_stock as "minStock", i.max_stock as "maxStock",
                    i.abc_classification as "abcClassification",
                    i.created_at as "createdAt",
                    ig.name as "itemGroupName",
                    ic.name as "itemCategoryName",
                    uom.code as "baseUomCode"
                FROM inventory.items i
                LEFT JOIN inventory.item_groups ig ON i.item_group_id = ig.id
                LEFT JOIN inventory.item_categories ic ON i.item_category_id = ic.id
                LEFT JOIN inventory.uom_master uom ON i.base_uom_id = uom.id
                WHERE ${sql.raw(whereConditions)}
                ORDER BY ${sql.raw(orderByClause)}
                LIMIT ${limit} OFFSET ${offset}
            `);

            return result.rows || [];
        } catch (error) {
            throw new DatabaseError('Failed to search items', error);
        }
    }



    /**
     * Count items with filters (override base)
     */
    async count(filters = {}, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;
            let whereConditions = `i.ten_id = '${ten_id}' AND i.stg_id = '${stg_id}'`;

            // Note: If 'search' query is passed via filters (service needs update to pass it), add it here.
            // Currently Service calls count(filters), but search param is separate in Service options.
            // Let's check Service.js getAllItems again. It calls count(filters). 
            // So for now we only handle the structured filters.

            if (filters.itemType) whereConditions += ` AND i.item_type = '${filters.itemType}'`;
            if (filters.itemGroupId) whereConditions += ` AND i.item_group_id = '${filters.itemGroupId}'`;
            if (filters.itemCategoryId) whereConditions += ` AND i.item_category_id = '${filters.itemCategoryId}'`;
            if (filters.isActive !== undefined) whereConditions += ` AND i.is_active = ${filters.isActive}`;
            if (filters.hasMinStock === true) whereConditions += ` AND i.min_stock IS NOT NULL`;
            if (filters.hasMaxStock === true) whereConditions += ` AND i.max_stock IS NOT NULL`;

            // Handle 'search' if it was theoretically passed in filters (though usually it's separate)
            // Ideally we'd unify the where clause generation.

            const result = await this.db.execute(sql`
                SELECT count(*) as count
                FROM inventory.items i
                WHERE ${sql.raw(whereConditions)}
            `);

            return Number(result.rows[0]?.count || 0);
        } catch (error) {
            throw new DatabaseError('Failed to count items', error);
        }
    }

    /**
     * Find item by barcode
     */
    async findByBarcode(barcode, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;

            const result = await this.db.execute(sql`
                SELECT i.*, b.barcode, b.barcode_type as "barcodeType"
                FROM inventory.items i
                INNER JOIN inventory.item_barcodes b ON i.id = b.item_id
                WHERE b.barcode = ${barcode}
                  AND i.ten_id = ${ten_id}
                  AND i.stg_id = ${stg_id}
                LIMIT 1
            `);

            return result.rows[0] || null;
        } catch (error) {
            throw new DatabaseError('Failed to find item by barcode', error);
        }
    }

    /**
     * Find items with low stock
     */
    async findLowStock(tenantContext, options = {}) {
        try {
            const { limit = 50, offset = 0 } = options;
            const { ten_id, stg_id } = tenantContext;

            const result = await this.db.execute(sql`
                SELECT 
                    i.id, i.sku, i.name,
                    i.min_stock as "minStock",
                    i.reorder_point as "reorderPoint",
                    COALESCE(
                        (SELECT SUM(sb.available_qty)
                         FROM inventory.stock_balance sb
                         WHERE sb.item_id = i.id
                           AND sb.ten_id = ${ten_id}
                           AND sb.stg_id = ${stg_id}),
                        0
                    ) as "currentStock"
                FROM inventory.items i
                WHERE i.ten_id = ${ten_id}
                  AND i.stg_id = ${stg_id}
                  AND i.is_active = true
                  AND i.reorder_point > 0
                HAVING COALESCE(
                    (SELECT SUM(sb.available_qty)
                     FROM inventory.stock_balance sb
                     WHERE sb.item_id = i.id
                       AND sb.ten_id = ${ten_id}
                       AND sb.stg_id = ${stg_id}),
                    0
                ) <= i.reorder_point
                ORDER BY "currentStock" ASC
                LIMIT ${limit} OFFSET ${offset}
            `);

            return result.rows || [];
        } catch (error) {
            throw new DatabaseError('Failed to find low stock items', error);
        }
    }

    /**
     * Get item statistics
     */
    async getStats(tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;
            const conditions = and(
                eq(items.tenId, ten_id),
                eq(items.stgId, stg_id)
            );

            // Using separate queries for clarity and to avoid complex conditional aggregation quirks in Drizzle for now
            // In a larger system, specialized analytics queries or materialized views would be better

            const [totalResult] = await this.db
                .select({ count: sql`count(*)` })
                .from(items)
                .where(conditions);

            const [activeResult] = await this.db
                .select({ count: sql`count(*)` })
                .from(items)
                .where(and(conditions, eq(items.isActive, true)));

            const [minStockResult] = await this.db
                .select({ count: sql`count(*)` })
                .from(items)
                .where(and(
                    conditions,
                    eq(items.isActive, true),
                    sql`${items.minStock} IS NOT NULL`
                ));

            const [maxStockResult] = await this.db
                .select({ count: sql`count(*)` })
                .from(items)
                .where(and(
                    conditions,
                    eq(items.isActive, true),
                    sql`${items.maxStock} IS NOT NULL`
                ));

            return {
                total: Number(totalResult?.count || 0),
                active: Number(activeResult?.count || 0),
                hasMinStock: Number(minStockResult?.count || 0),
                hasMaxStock: Number(maxStockResult?.count || 0)
            };
        } catch (error) {
            throw new DatabaseError('Failed to get item statistics', error);
        }
    }

    /**
     * Get all item groups
     */
    async getItemGroups(tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;

            const results = await this.db
                .select()
                .from(itemGroups)
                .where(and(
                    eq(itemGroups.tenId, ten_id),
                    eq(itemGroups.stgId, stg_id)
                ))
                .orderBy(itemGroups.name);

            return results;
        } catch (error) {
            throw new DatabaseError('Failed to get item groups', error);
        }
    }

    /**
     * Get all item categories
     */
    async getItemCategories(tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;

            const results = await this.db
                .select()
                .from(itemCategories)
                .where(and(
                    eq(itemCategories.tenId, ten_id),
                    eq(itemCategories.stgId, stg_id)
                ))
                .orderBy(itemCategories.name);

            return results;
        } catch (error) {
            throw new DatabaseError('Failed to get item categories', error);
        }
    }

    /**
     * Get all warehouses
     */
    async getWarehouses(tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;

            const results = await this.db
                .select()
                .from(warehouses)
                .where(and(
                    eq(warehouses.tenId, ten_id),
                    eq(warehouses.stgId, stg_id)
                ))
                .orderBy(warehouses.name);

            return results;
        } catch (error) {
            throw new DatabaseError('Failed to get warehouses', error);
        }
    }

    /**
     * Transform flat relational row to nested object
     */
    transformRelationalRow(row) {
        const item = {};
        const nested = {
            itemGroup: {},
            itemCategory: {},
            baseUom: {},
            purchaseUom: {},
            salesUom: {}
        };

        for (const [key, value] of Object.entries(row)) {
            if (key.includes('.')) {
                const [parent, child] = key.split('.');
                if (value !== null) {
                    nested[parent][child] = value;
                }
            } else {
                item[key] = value;
            }
        }

        // Only include nested objects if they have data
        if (Object.keys(nested.itemGroup).length > 0) item.itemGroup = nested.itemGroup;
        if (Object.keys(nested.itemCategory).length > 0) item.itemCategory = nested.itemCategory;
        if (Object.keys(nested.baseUom).length > 0) item.baseUom = nested.baseUom;
        if (Object.keys(nested.purchaseUom).length > 0) item.purchaseUom = nested.purchaseUom;
        if (Object.keys(nested.salesUom).length > 0) item.salesUom = nested.salesUom;

        return item;
    }

    /**
     * Create Item Group
     */
    async createItemGroup(data, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;
            const [newGroup] = await this.db.insert(itemGroups).values({
                ...data,
                tenId: ten_id,
                stgId: stg_id
            }).returning();
            return newGroup;
        } catch (error) {
            throw new DatabaseError('Failed to create item group', error);
        }
    }

    /**
     * Create Item Category
     */
    async createItemCategory(data, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;
            const [newCategory] = await this.db.insert(itemCategories).values({
                ...data,
                tenId: ten_id,
                stgId: stg_id
            }).returning();
            return newCategory;
        } catch (error) {
            throw new DatabaseError('Failed to create item category', error);
        }
    }

    /**
     * Create Warehouse
     */
    async createWarehouse(data, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;
            const [newWarehouse] = await this.db.insert(warehouses).values({
                ...data,
                tenId: ten_id,
                stgId: stg_id
            }).returning();
            return newWarehouse;
        } catch (error) {
            throw new DatabaseError('Failed to create warehouse', error);
        }
    }
}

// Export singleton instance
let itemRepositoryInstance = null;

export function getItemRepository() {
    if (!itemRepositoryInstance) {
        itemRepositoryInstance = new ItemRepository();
    }
    return itemRepositoryInstance;
}
