import { getMenuService } from '@/lib/services/MenuService';
import { extractTenantContext } from '@/lib/tenantContext';
import * as apiResponse from '@/lib/apiResponse';
import { filterMenuByRole, buildMenuTree } from '@/lib/utils/menuHelpers.js';

/**
 * @swagger
 * /api/menus:
 *   get:
 *     tags:
 *       - Menus
 *     summary: Get menu tree
 */
export async function GET(request) {
    try {
        const userRole = request.headers.get('x-user-role') || null;
        const tenantContext = extractTenantContext(request);
        const { ten_id, stg_id } = tenantContext;

        console.log('[MENUS] Fetching menus for:', { ten_id, stg_id, userRole });

        // Fetch menus using service
        const menuService = getMenuService();
        const result = await menuService.getFlatMenuList(tenantContext);

        // Convert to plain array for manipulation
        const menusList = result.data.map(m => ({
            id: m.id,
            label: m.label,
            href: m.href,
            icon: m.icon,
            parentId: m.parentId,
            level: m.level,
            order: m.order,
            roles: m.roles,
            isActive: m.isActive,
            ten_id: m.tenId,
            stg_id: m.stgId
        }));

        console.log('[MENUS] Total menus fetched:', menusList.length);

        // Filter by role and build tree
        console.log('[MENUS] Filtering by role:', userRole);
        let filteredMenus = filterMenuByRole(menusList, userRole);

        // Filter inactive items
        // The Sidebar uses this endpoint, so we only want active items.
        // Management pages use /api/menus/admin which includes everything.
        filteredMenus = filteredMenus.filter(item => item.isActive);
        console.log('[MENUS] Filtered active menus:', filteredMenus.length);

        console.log('[MENUS] Filtered menus count:', filteredMenus.length);

        console.log('[MENUS] Building menu tree...');
        const menuTree = buildMenuTree(filteredMenus);
        console.log('[MENUS] Menu tree built');

        const countItems = (items) => {
            return items.reduce((count, item) => {
                return count + 1 + (item.children ? countItems(item.children) : 0);
            }, 0);
        };

        console.log('[MENUS] Returning menu tree with', countItems(menuTree), 'items');

        return apiResponse.success(menuTree, {
            count: countItems(menuTree)
        });
    } catch (error) {
        console.error('[API] /api/menus GET error:', error);
        return apiResponse.error(error);
    }
}
