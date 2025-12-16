import { getItemService } from '@/lib/services/ItemService';
import { extractTenantContext, extractPagination } from '@/lib/tenantContext';
import * as apiResponse from '@/lib/apiResponse';

/**
 * @swagger
 * /api/items:
 *   get:
 *     tags:
 *       - Items
 *     summary: Get all items
 *     description: Retrieve paginated list of items with optional search and filters
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *       - name: search
 *         in: query
 *         description: Search in SKU, name, description, keywords
 *         schema:
 *           type: string
 *       - name: type
 *         in: query
 *         description: Filter by item type
 *         schema:
 *           type: string
 *           enum: [raw_material, semi_finished, finished, service, asset]
 *       - name: active
 *         in: query
 *         description: Filter by active status
 *         schema:
 *           type: boolean
 *       - name: sort
 *         in: query
 *         description: Sort field
 *         schema:
 *           type: string
 *           enum: [sku, name, createdAt]
 *       - name: order
 *         in: query
 *         description: Sort order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 */
export async function GET(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const pagination = extractPagination(request);

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const groupId = searchParams.get('groupId');
        const active = searchParams.get('active');
        const hasMinStock = searchParams.get('hasMinStock');
        const hasMaxStock = searchParams.get('hasMaxStock');
        const sort = searchParams.get('sort') || 'createdAt';
        const order = searchParams.get('order') || 'desc';

        const filters = {};
        if (groupId) filters.itemGroupId = groupId;
        if (active !== null) filters.isActive = active === 'true';
        if (hasMinStock === 'true') filters.hasMinStock = true;
        if (hasMaxStock === 'true') filters.hasMaxStock = true;

        const itemService = getItemService();
        const result = await itemService.getAllItems(tenantContext, {
            ...pagination,
            search,
            filters,
            sort,
            order
        });

        return apiResponse.paginated(result.data, result.pagination);
    } catch (error) {
        console.error('[API] Error fetching items:', error);
        return apiResponse.error(error);
    }
}

/**
 * @swagger
 * /api/items:
 *   post:
 *     tags:
 *       - Items
 *     summary: Create a new item
 *     description: Create a new item in the inventory
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sku
 *               - name
 *             properties:
 *               sku:
 *                 type: string
 *               name:
 *                 type: string
 *               shortName:
 *                 type: string
 *               description:
 *                 type: string
 *               itemType:
 *                 type: string
 *                 enum: [raw_material, semi_finished, finished, service, asset]
 *               itemGroupId:
 *                 type: string
 *                 format: uuid
 *               itemCategoryId:
 *                 type: string
 *                 format: uuid
 *               baseUomId:
 *                 type: string
 *                 format: uuid
 *               isPurchaseItem:
 *                 type: boolean
 *               isSalesItem:
 *                 type: boolean
 *               minStock:
 *                 type: number
 *               maxStock:
 *                 type: number
 *               reorderPoint:
 *                 type: number
 *               standardCost:
 *                 type: number
 *               defaultSellingPrice:
 *                 type: number
 */
export async function POST(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const body = await request.json();

        const itemService = getItemService();
        const newItem = await itemService.createItem(body, tenantContext);

        return apiResponse.created(newItem);
    } catch (error) {
        console.error('[API] Error creating item:', error);
        return apiResponse.error(error);
    }
}
