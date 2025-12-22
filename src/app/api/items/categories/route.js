import { NextResponse } from 'next/server';
import { extractTenantContext } from '@/lib/tenantContext';
import { ItemService } from '@/lib/services/ItemService';
import * as apiResponse from '@/lib/apiResponse';

export async function GET(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const itemService = new ItemService();
        const categories = await itemService.getItemCategories(tenantContext);
        return apiResponse.success(categories);
    } catch (error) {
        return apiResponse.error(error);
    }
}

export async function POST(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const itemService = new ItemService();
        const body = await request.json();

        const newCategory = await itemService.createItemCategory(body, tenantContext);
        return apiResponse.created(newCategory);
    } catch (error) {
        return apiResponse.error(error);
    }
}
