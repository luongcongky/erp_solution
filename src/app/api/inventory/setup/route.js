import { NextResponse } from 'next/server';
import { extractTenantContext } from '@/lib/tenantContext';
import { getInventorySetupService } from '@/lib/services/InventorySetupService';
import * as apiResponse from '@/lib/apiResponse';

/**
 * GET /api/inventory/setup
 * Get all inventory setups with optional filters
 */
export async function GET(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const service = getInventorySetupService();

        // Extract query parameters
        const { searchParams } = new URL(request.url);
        const filters = {};

        // Parse warehouse filter (can be multiple)
        const warehouseId = searchParams.get('warehouseId');
        if (warehouseId) {
            filters.warehouseId = warehouseId.includes(',')
                ? warehouseId.split(',')
                : warehouseId;
        }

        // Parse other filters
        if (searchParams.get('itemType')) {
            filters.itemType = searchParams.get('itemType');
        }
        if (searchParams.get('tracking')) {
            filters.tracking = searchParams.get('tracking');
        }
        if (searchParams.get('itemGroupId')) {
            filters.itemGroupId = searchParams.get('itemGroupId');
        }
        if (searchParams.get('itemCategoryId')) {
            filters.itemCategoryId = searchParams.get('itemCategoryId');
        }
        if (searchParams.get('lowStockConfigured')) {
            filters.lowStockConfigured = searchParams.get('lowStockConfigured') === 'true';
        }
        if (searchParams.get('isActive')) {
            filters.isActive = searchParams.get('isActive') === 'true';
        }

        const setups = await service.getAllSetups(tenantContext, filters);
        return apiResponse.success(setups);
    } catch (error) {
        return apiResponse.error(error);
    }
}

/**
 * POST /api/inventory/setup
 * Create new inventory setup
 */
export async function POST(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const service = getInventorySetupService();
        const body = await request.json();

        const newSetup = await service.createSetup(body, tenantContext);
        return apiResponse.created(newSetup);
    } catch (error) {
        return apiResponse.error(error);
    }
}
