import { getItemService } from '@/lib/services/ItemService';
import { extractTenantContext } from '@/lib/tenantContext';
import * as apiResponse from '@/lib/apiResponse';

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/items/stats:
 *   get:
 *     tags:
 *       - Items
 *     summary: Get item statistics
 *     description: Get counts for total, active, low stock, and out of stock items
 */
export async function GET(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const itemService = getItemService();
        const stats = await itemService.getItemStats(tenantContext);

        return apiResponse.success(stats);
    } catch (error) {
        console.error('[API] Error fetching item stats:', error);
        return apiResponse.error(error);
    }
}
