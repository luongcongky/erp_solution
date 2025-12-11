import { getItemService } from '@/lib/services/ItemService';
import { extractTenantContext } from '@/lib/tenantContext';
import * as apiResponse from '@/lib/apiResponse';

/**
 * @swagger
 * /api/items/{id}/barcodes:
 *   get:
 *     tags:
 *       - Items
 *     summary: Get item barcodes
 *     description: Retrieve all barcodes for a specific item
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

        return apiResponse.success(item.barcodes || []);
    } catch (error) {
        console.error(`[API] Error fetching barcodes for item ${params.id}:`, error);
        return apiResponse.error(error);
    }
}

/**
 * @swagger
 * /api/items/{id}/barcodes:
 *   post:
 *     tags:
 *       - Items
 *     summary: Add barcode to item
 *     description: Add a new barcode to an item
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
 *             required:
 *               - barcode
 *               - barcodeType
 *             properties:
 *               barcode:
 *                 type: string
 *               barcodeType:
 *                 type: string
 *                 enum: [EAN13, UPC, CODE128, QR, Custom]
 *               uomId:
 *                 type: string
 *                 format: uuid
 *               isPrimary:
 *                 type: boolean
 */
export async function POST(request, { params }) {
    try {
        const tenantContext = extractTenantContext(request);
        const { id } = params;
        const body = await request.json();

        const itemService = getItemService();
        const newBarcode = await itemService.addBarcode(id, body, tenantContext);

        return apiResponse.created(newBarcode);
    } catch (error) {
        console.error(`[API] Error adding barcode to item ${params.id}:`, error);
        return apiResponse.error(error);
    }
}
