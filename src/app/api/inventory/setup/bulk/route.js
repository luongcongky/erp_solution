import { NextResponse } from 'next/server';
import { extractTenantContext } from '@/lib/tenantContext';
import { getInventorySetupService } from '@/lib/services/InventorySetupService';
import * as apiResponse from '@/lib/apiResponse';

/**
 * POST /api/inventory/setup/bulk
 * Bulk update inventory setups
 */
export async function POST(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const service = getInventorySetupService();
        const body = await request.json();

        const { ids, data } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return apiResponse.error(new Error('No setup IDs provided'));
        }

        const updated = await service.bulkUpdateSetups(ids, data, tenantContext);
        return apiResponse.success(updated);
    } catch (error) {
        return apiResponse.error(error);
    }
}
