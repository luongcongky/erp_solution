import { NextResponse } from 'next/server';
import { extractTenantContext } from '@/lib/tenantContext';
import { getWarehouseService } from '@/lib/services/WarehouseService';
import * as apiResponse from '@/lib/apiResponse';

/**
 * GET /api/warehouses/[id]
 * Get warehouse by ID with locations
 */
export async function GET(request, { params }) {
    try {
        const tenantContext = extractTenantContext(request);
        const warehouseService = getWarehouseService();
        const { id } = await params;

        const warehouse = await warehouseService.getWarehouseById(id, tenantContext);

        return apiResponse.success(warehouse);
    } catch (error) {
        return apiResponse.error(error);
    }
}

/**
 * PUT /api/warehouses/[id]
 * Update warehouse
 */
export async function PUT(request, { params }) {
    try {
        const tenantContext = extractTenantContext(request);
        const warehouseService = getWarehouseService();
        const { id } = await params;
        const body = await request.json();

        const updated = await warehouseService.updateWarehouse(id, body, tenantContext);
        return apiResponse.success(updated);
    } catch (error) {
        return apiResponse.error(error);
    }
}

/**
 * DELETE /api/warehouses/[id]
 * Delete (soft delete) warehouse
 */
export async function DELETE(request, { params }) {
    try {
        const tenantContext = extractTenantContext(request);
        const warehouseService = getWarehouseService();
        const { id } = await params;

        await warehouseService.deleteWarehouse(id, tenantContext);
        return apiResponse.success({ message: 'Warehouse deleted successfully' });
    } catch (error) {
        return apiResponse.error(error);
    }
}
