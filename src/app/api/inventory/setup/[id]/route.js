import { NextResponse } from 'next/server';
import { extractTenantContext } from '@/lib/tenantContext';
import { getInventorySetupService } from '@/lib/services/InventorySetupService';
import * as apiResponse from '@/lib/apiResponse';

/**
 * GET /api/inventory/setup/[id]
 * Get single inventory setup by ID
 */
export async function GET(request, { params }) {
    try {
        const tenantContext = extractTenantContext(request);
        const service = getInventorySetupService();
        const { id } = params;

        const setup = await service.getSetupById(id, tenantContext);
        return apiResponse.success(setup);
    } catch (error) {
        return apiResponse.error(error);
    }
}

/**
 * PUT /api/inventory/setup/[id]
 * Update inventory setup
 */
export async function PUT(request, { params }) {
    try {
        const tenantContext = extractTenantContext(request);
        const service = getInventorySetupService();
        const { id } = params;
        const body = await request.json();

        const updated = await service.updateSetup(id, body, tenantContext);
        return apiResponse.success(updated);
    } catch (error) {
        return apiResponse.error(error);
    }
}

/**
 * DELETE /api/inventory/setup/[id]
 * Delete (soft delete) inventory setup
 */
export async function DELETE(request, { params }) {
    try {
        const tenantContext = extractTenantContext(request);
        const service = getInventorySetupService();
        const { id } = params;

        const deleted = await service.deleteSetup(id, tenantContext);
        return apiResponse.success(deleted);
    } catch (error) {
        return apiResponse.error(error);
    }
}
