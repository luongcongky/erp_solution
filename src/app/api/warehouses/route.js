import { NextResponse } from 'next/server';
import { extractTenantContext } from '@/lib/tenantContext';
import { getWarehouseService } from '@/lib/services/WarehouseService';
import * as apiResponse from '@/lib/apiResponse';

/**
 * GET /api/warehouses
 * Get all warehouses with optional filtering
 */
export async function GET(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const warehouseService = getWarehouseService();

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const filters = {};

        if (searchParams.get('warehouseType')) {
            filters.warehouseType = searchParams.get('warehouseType');
        }

        if (searchParams.get('isActive')) {
            filters.isActive = searchParams.get('isActive') === 'true';
        }

        const warehouses = await warehouseService.getAllWarehouses(tenantContext, filters);

        return apiResponse.success(warehouses);
    } catch (error) {
        return apiResponse.error(error);
    }
}

/**
 * POST /api/warehouses
 * Create new warehouse
 */
export async function POST(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const warehouseService = getWarehouseService();
        const body = await request.json();

        const newWarehouse = await warehouseService.createWarehouse(body, tenantContext);
        return apiResponse.created(newWarehouse);
    } catch (error) {
        return apiResponse.error(error);
    }
}
