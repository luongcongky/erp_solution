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
