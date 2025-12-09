import { getUserService } from '@/lib/services/UserService';
import { extractTenantContext, extractPagination } from '@/lib/tenantContext';
import * as apiResponse from '@/lib/apiResponse';

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     description: Retrieve all users from the database with their roles
 */
export async function GET(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const pagination = extractPagination(request);

        const userService = getUserService();
        const result = await userService.getAllUsers(tenantContext, pagination);

        return apiResponse.paginated(result.data, result.pagination);
    } catch (error) {
        console.error('[API] Error fetching users:', error);
        return apiResponse.error(error);
    }
}

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags:
 *       - Users
 *     summary: Create a new user
 *     description: Create a new user with email, name, password, and role assignments
 */
export async function POST(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const body = await request.json();

        const userService = getUserService();
        const newUser = await userService.createUser(body, tenantContext);

        return apiResponse.created(newUser);
    } catch (error) {
        console.error('[API] Error creating user:', error);
        return apiResponse.error(error);
    }
}
