import { getItemService } from '@/lib/services/ItemService';
import { extractTenantContext } from '@/lib/tenantContext';
import * as apiResponse from '@/lib/apiResponse';

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     tags:
 *       - Items
 *     summary: Get item by ID
 *     description: Retrieve detailed information about a specific item
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 */
export async function GET(request, { params }) {
    try {
        const tenantContext = extractTenantContext(request);
        const { id } = params;

        const itemService = getItemService();
        const item = await itemService.getItemById(id, tenantContext);

        return apiResponse.success(item);
    } catch (error) {
        console.error(`[API] Error fetching item ${params.id}:`, error);
        return apiResponse.error(error);
    }
}

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     tags:
 *       - Items
 *     summary: Update item
 *     description: Update an existing item
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               minStock:
 *                 type: number
 *               maxStock:
 *                 type: number
 *               standardCost:
 *                 type: number
 */
export async function PUT(request, { params }) {
    try {
        const tenantContext = extractTenantContext(request);
        const { id } = params;
        const body = await request.json();

        const itemService = getItemService();
        const updatedItem = await itemService.updateItem(id, body, tenantContext);

        return apiResponse.success(updatedItem);
    } catch (error) {
        console.error(`[API] Error updating item ${params.id}:`, error);
        return apiResponse.error(error);
    }
}

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     tags:
 *       - Items
 *     summary: Delete item
 *     description: Delete an item from the inventory
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 */
export async function DELETE(request, { params }) {
    try {
        const tenantContext = extractTenantContext(request);
        const { id } = params;

        const itemService = getItemService();
        await itemService.deleteItem(id, tenantContext);

        return apiResponse.noContent();
    } catch (error) {
        console.error(`[API] Error deleting item ${params.id}:`, error);
        return apiResponse.error(error);
    }
}
