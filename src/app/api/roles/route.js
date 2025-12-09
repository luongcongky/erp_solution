import { getRoleService } from '@/lib/services/RoleService';
import { extractTenantContext, extractPagination } from '@/lib/tenantContext';
import * as apiResponse from '@/lib/apiResponse';

/**
 * @swagger
 * /api/roles:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Get all roles
 *     description: Retrieve all roles with user counts. Filtered by tenant and stage.
 */
export async function GET(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const pagination = extractPagination(request);

        const roleService = getRoleService();
        const result = await roleService.getAllRoles(tenantContext, pagination);

        return apiResponse.paginated(result.data, result.pagination);
    } catch (error) {
        console.error('[API] Error fetching roles:', error);
        return apiResponse.error(error);
    }
}

/**
 * @swagger
 * /api/roles:
 *   post:
 *     tags:
 *       - Roles
 *     summary: Create new role
 */
export async function POST(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const body = await request.json();

        const roleService = getRoleService();
        const newRole = await roleService.createRole(body, tenantContext);

        return apiResponse.created(newRole);
    } catch (error) {
        console.error('[API] Error creating role:', error);
        return apiResponse.error(error);
    }
}
