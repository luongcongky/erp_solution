/**
 * Product Repository (Inventory Items)
 * Data access layer for inventory items table
 */

import { BaseRepository } from './BaseRepository.js';
import { items } from '@/db/schema/inventory';
import { eq, and, sql, like } from 'drizzle-orm';
import { DatabaseError, ConflictError } from '@/lib/errors.js';

export class ProductRepository extends BaseRepository {
    constructor() {
        super(items, 'Product');
    }

    /**
     * Find product by SKU
     */
    async findBySku(sku, tenantContext) {
        try {
            const conditions = [
                eq(items.sku, sku),
                ...this.buildTenantFilter(tenantContext)
            ];

            const [product] = await this.db
                .select()
                .from(items)
                .where(and(...conditions))
                .limit(1);

            return product || null;
        } catch (error) {
            throw new DatabaseError('Failed to find product by SKU', error);
        }
    }

    /**
     * Check if SKU already exists
     */
    async skuExists(sku, tenantContext, excludeProductId = null) {
        const conditions = [
            eq(items.sku, sku),
            ...this.buildTenantFilter(tenantContext)
        ];

        if (excludeProductId) {
            conditions.push(sql`${items.id} != ${excludeProductId}`);
        }

        const [existing] = await this.db
            .select({ id: items.id })
            .from(items)
            .where(and(...conditions))
            .limit(1);

        return !!existing;
    }

    /**
     * Search products by name or SKU
     */
    async search(searchTerm, tenantContext, options = {}) {
        try {
            const { limit = 100, offset = 0 } = options;
            const conditions = [...this.buildTenantFilter(tenantContext)];

            if (searchTerm) {
                conditions.push(
                    sql`(${items.name} ILIKE ${`%${searchTerm}%`} OR ${items.sku} ILIKE ${`%${searchTerm}%`})`
                );
            }

            const results = await this.db
                .select()
                .from(items)
                .where(and(...conditions))
                .limit(limit)
                .offset(offset)
                .orderBy(items.name);

            return results;
        } catch (error) {
            throw new DatabaseError('Failed to search products', error);
        }
    }

    /**
     * Get products by type
     */
    async findByType(itemType, tenantContext, options = {}) {
        try {
            const filters = { itemType };
            return await this.findAll(filters, tenantContext, options);
        } catch (error) {
            throw new DatabaseError('Failed to find products by type', error);
        }
    }

    /**
     * Get low stock products
     */
    async findLowStock(tenantContext, options = {}) {
        try {
            const { limit = 100, offset = 0 } = options;
            const { ten_id, stg_id } = tenantContext;

            // This would need to join with stock_balance table
            // For now, return products where minStock > 0
            const results = await this.db.execute(sql`
                SELECT 
                    i.*,
                    COALESCE(SUM(sb.available_qty), 0) as current_stock
                FROM "inventory"."items" i
                LEFT JOIN "inventory"."stock_balance" sb ON i.id = sb.item_id
                WHERE i.ten_id = ${ten_id} 
                  AND i.stg_id = ${stg_id}
                  AND i.min_stock > 0
                GROUP BY i.id
                HAVING COALESCE(SUM(sb.available_qty), 0) < i.min_stock
                ORDER BY i.name
                LIMIT ${limit} OFFSET ${offset}
            `);

            return results.rows;
        } catch (error) {
            throw new DatabaseError('Failed to find low stock products', error);
        }
    }
}

// Export singleton instance
let productRepositoryInstance = null;

export function getProductRepository() {
    if (!productRepositoryInstance) {
        productRepositoryInstance = new ProductRepository();
    }
    return productRepositoryInstance;
}

export default ProductRepository;
