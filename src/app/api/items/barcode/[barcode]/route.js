import { getItemService } from '@/lib/services/ItemService';
import { extractTenantContext } from '@/lib/tenantContext';
import * as apiResponse from '@/lib/apiResponse';

/**
 * @swagger
 * /api/items/barcode/{barcode}:
 *   get:
 *     tags:
 *       - Items
 *     summary: Lookup item by barcode
 *     description: Find an item using its barcode
 *     parameters:
 *       - name: barcode
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 */
export async function GET(request, { params }) {
    const { barcode } = await params;
    try {
        const tenantContext = extractTenantContext(request);

        const itemService = getItemService();
        const item = await itemService.lookupByBarcode(barcode, tenantContext);

        return apiResponse.success(item);
    } catch (error) {
        console.error(`[API] Error looking up barcode ${barcode}:`, error);
        return apiResponse.error(error);
    }
}
