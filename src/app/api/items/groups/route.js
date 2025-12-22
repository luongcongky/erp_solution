import { NextResponse } from 'next/server';
import { extractTenantContext } from '@/lib/tenantContext';
import { ItemService } from '@/lib/services/ItemService';
import * as apiResponse from '@/lib/apiResponse';

export async function GET(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const itemService = new ItemService();

        const groups = await itemService.getItemGroups(tenantContext);

        return apiResponse.success(groups);
    } catch (error) {
        return apiResponse.error(error);
    }
}

export async function POST(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const itemService = new ItemService();
        const body = await request.json();

        // Basic validation or mapping if needed
        // Assuming ItemService has a createGroup method or we use a generic one?
        // Checking ItemService... it has createItem but maybe not createGroup yet.
        // I should probably add createGroup to ItemService first or handle repository directly if simple.
        // Let's check ItemService again properly.

        // Actually, let's look at ItemService.js content I viewed earlier.
        // It has getItemGroups but NO createItemGroup. 
        // I will add createItemGroup to ItemService as well.

        const newGroup = await itemService.createItemGroup(body, tenantContext);
        return apiResponse.created(newGroup);
    } catch (error) {
        return apiResponse.error(error);
    }
}
