import { NextResponse } from 'next/server';
import { extractTenantContext } from '@/lib/tenantContext';
import { getWarehouseService } from '@/lib/services/WarehouseService';
import * as apiResponse from '@/lib/apiResponse';

/**
 * GET /api/warehouses/[id]/locations
 * Get all locations for a warehouse
 */
export async function GET(request, { params }) {
    try {
        const tenantContext = extractTenantContext(request);
        const warehouseService = getWarehouseService();
        const { id } = await params;

        const locations = await warehouseService.getWarehouseLocations(id, tenantContext);

        return apiResponse.success(locations);
    } catch (error) {
        return apiResponse.error(error);
    }
}

/**
 * POST /api/warehouses/[id]/locations
 * Create new location in warehouse
 */
export async function POST(request, { params }) {
    try {
        const tenantContext = extractTenantContext(request);
        const warehouseService = getWarehouseService();
        const { id } = await params;
        const body = await request.json();

        // Ensure warehouseId is set from URL parameter
        body.warehouseId = id;

        const newLocation = await warehouseService.createLocation(body, tenantContext);
        return apiResponse.created(newLocation);
    } catch (error) {
        return apiResponse.error(error);
    }
}
