import { NextResponse } from 'next/server';
import { extractTenantContext } from '@/lib/tenantContext';
import { getInventorySetupService } from '@/lib/services/InventorySetupService';
import * as apiResponse from '@/lib/apiResponse';

/**
 * POST /api/inventory/setup/duplicate
 * Duplicate inventory setup to other warehouses
 */
export async function POST(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const service = getInventorySetupService();
        const body = await request.json();

        const { sourceId, targetWarehouseIds, adjustments } = body;

        if (!sourceId) {
            return apiResponse.error(new Error('Source setup ID is required'));
        }

        if (!targetWarehouseIds || !Array.isArray(targetWarehouseIds) || targetWarehouseIds.length === 0) {
            return apiResponse.error(new Error('Target warehouse IDs are required'));
        }

        const result = await service.duplicateSetup(
            sourceId,
            targetWarehouseIds,
            adjustments,
            tenantContext
        );

        return apiResponse.success(result);
    } catch (error) {
        return apiResponse.error(error);
    }
}
