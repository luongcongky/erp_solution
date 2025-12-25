import { NextResponse } from 'next/server';
import { extractTenantContext } from '@/lib/tenantContext';
import { db } from '@/db';
import { items, inventorySetup } from '@/db/schema/inventory';
import { eq, and, notInArray, sql, or, ilike } from 'drizzle-orm';
import * as apiResponse from '@/lib/apiResponse';

/**
 * GET /api/inventory/items-without-setup
 * Get items that don't have inventory setup for a specific warehouse
 * Supports filtering, search, and pagination
 */
export async function GET(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const { ten_id, stg_id } = tenantContext;

        const { searchParams } = new URL(request.url);
        const warehouseId = searchParams.get('warehouseId');
        const search = searchParams.get('search');
        const itemGroupId = searchParams.get('itemGroupId');
        const itemCategoryId = searchParams.get('itemCategoryId');
        const itemType = searchParams.get('itemType');
        const notInAnyWarehouse = searchParams.get('notInAnyWarehouse') === 'true'; // New parameter
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        if (!warehouseId) {
            return apiResponse.error(new Error('warehouseId is required'));
        }

        // Determine which items to exclude
        let exclusionQuery = db
            .select({ itemId: inventorySetup.itemId })
            .from(inventorySetup)
            .where(and(
                eq(inventorySetup.tenId, ten_id),
                eq(inventorySetup.stgId, stg_id)
            ));

        // If notInAnyWarehouse is FALSE (default behavior), only exclude items in CURRENT warehouse
        // If TRUE, we exclude items in ANY warehouse (so we don't add specific warehouse filter)
        if (!notInAnyWarehouse) {
            exclusionQuery = exclusionQuery.where(eq(inventorySetup.warehouseId, warehouseId));
        }

        const existingSetups = await exclusionQuery;
        const existingItemIds = existingSetups.map(s => s.itemId);

        // Build conditions
        const conditions = [
            eq(items.tenId, ten_id),
            eq(items.stgId, stg_id),
            eq(items.isActive, true)
        ];

        // Add search condition
        if (search) {
            conditions.push(
                or(
                    ilike(items.sku, `%${search}%`),
                    ilike(items.name, `%${search}%`)
                )
            );
        }

        // Add filter conditions
        if (itemGroupId) {
            conditions.push(eq(items.itemGroupId, itemGroupId));
        }
        if (itemCategoryId) {
            conditions.push(eq(items.itemCategoryId, itemCategoryId));
        }
        if (itemType) {
            conditions.push(eq(items.itemType, itemType));
        }

        // Exclude items that already have setup
        if (existingItemIds.length > 0) {
            conditions.push(notInArray(items.id, existingItemIds));
        }

        // Get total count
        const [countResult] = await db
            .select({ count: sql`count(*)::int` })
            .from(items)
            .where(and(...conditions));

        const total = countResult?.count || 0;
        const totalPages = Math.ceil(total / limit);

        // Get paginated items
        const offset = (page - 1) * limit;
        const itemsWithoutSetup = await db
            .select({
                id: items.id,
                sku: items.sku,
                name: items.name,
                itemType: items.itemType,
                tracking: items.tracking,
                isActive: items.isActive
            })
            .from(items)
            .where(and(...conditions))
            .orderBy(items.sku)
            .limit(limit)
            .offset(offset);

        return apiResponse.success({
            items: itemsWithoutSetup,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error('Error fetching items without setup:', error);
        return apiResponse.error(error);
    }
}
