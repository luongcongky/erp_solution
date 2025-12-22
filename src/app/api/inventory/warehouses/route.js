import { NextResponse } from 'next/server';
import { extractTenantContext } from '@/lib/tenantContext';
import { ItemService } from '@/lib/services/ItemService';
import * as apiResponse from '@/lib/apiResponse';

export async function GET(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const itemService = new ItemService();
        const warehouses = await itemService.getWarehouses(tenantContext);
        return apiResponse.success(warehouses);
    } catch (error) {
        return apiResponse.error(error);
    }
}

export async function POST(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const itemService = new ItemService();
        const body = await request.json();

        const newWarehouse = await itemService.createWarehouse(body, tenantContext);
        return apiResponse.created(newWarehouse);
    } catch (error) {
        return apiResponse.error(error);
    }
}
