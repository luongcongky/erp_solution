import { NextResponse } from 'next/server';
import { extractTenantContext } from '@/lib/tenantContext';
import { ItemService } from '@/lib/services/ItemService';
import * as apiResponse from '@/lib/apiResponse';

export async function GET(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const itemService = new ItemService();
        const uoms = await itemService.getUoms(tenantContext);
        return apiResponse.success(uoms);
    } catch (error) {
        return apiResponse.error(error);
    }
}

export async function POST(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const itemService = new ItemService();
        const body = await request.json();

        const newUom = await itemService.createUom(body, tenantContext);
        return apiResponse.created(newUom);
    } catch (error) {
        return apiResponse.error(error);
    }
}
