
import { extractTenantContext } from '@/lib/tenantContext';
import { getItemRepository } from '@/lib/repositories/ItemRepository.js';
import * as apiResponse from '@/lib/apiResponse';

/**
 * GET /api/inventory/items
 * Get all inventory items with optional filters
 */
export async function GET(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const service = getItemRepository(); // In this simple case we use repo directly, or service if exists

        // Extract query parameters
        const { searchParams } = new URL(request.url);
        const filters = {};

        // Parse filters
        if (searchParams.get('itemType')) {
            filters.itemType = searchParams.get('itemType');
        }
        if (searchParams.get('search')) {
            filters.search = searchParams.get('search');
        }

        const items = await service.findAll(filters, tenantContext);
        return apiResponse.success(items);
    } catch (error) {
        return apiResponse.error(error);
    }
}
