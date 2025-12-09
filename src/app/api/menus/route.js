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

        // --- INJECT INVENTORY MENU (Temporary/Dev) ---
        const existingInventory = menusList.find(m => m.label === 'Inventory');
        const invRootId = existingInventory ? existingInventory.id : 'inv-root-uuid';
        const stockMgmtId = 'inv-stock-mgmt-uuid';
        const pluginsId = 'inv-plugins-uuid';

        if (!existingInventory) {
            menusList.push({
                id: invRootId,
                label: 'Inventory',
                href: null,
                icon: 'InventoryIcon',
                parentId: null,
                level: 1,
                order: 30,
                roles: ['user', 'admin'],
                isActive: true,
                ten_id, stg_id
            });
        }

        // Remove old inventory submenu items
        const oldInvItems = ['inv-dash-uuid', 'inv-prod-uuid', 'inv-stock-in-uuid',
            'inv-stock-out-uuid', 'inv-stock-balance-uuid', 'inv-locations-uuid',
            'inv-batch-serial-uuid', 'inv-count-uuid', 'inv-min-stock-uuid',
            'inv-discrepancy-uuid', stockMgmtId, pluginsId, 'inv-plugin-plastic-uuid',
            'inv-plugin-food-uuid', 'inv-plugin-mechanical-uuid', 'inv-plugin-wood-uuid'];

        for (let i = menusList.length - 1; i >= 0; i--) {
            if (oldInvItems.includes(menusList[i].id) || menusList[i].parentId === invRootId) {
                menusList.splice(i, 1);
            }
        }

        // Add inventory menu items
        menusList.push(
            { id: 'inv-dash-uuid', label: 'Dashboard', href: '/inventory', icon: null, parentId: invRootId, level: 2, order: 10, roles: ['user', 'admin'], isActive: true, ten_id, stg_id },
            { id: stockMgmtId, label: 'Stock Management', href: null, icon: null, parentId: invRootId, level: 2, order: 20, roles: ['user', 'admin'], isActive: true, ten_id, stg_id },
            { id: 'inv-stock-in-uuid', label: 'Stock In', href: '/inventory/stock-in', icon: null, parentId: stockMgmtId, level: 3, order: 10, roles: ['user', 'admin'], isActive: true, ten_id, stg_id },
            { id: 'inv-stock-out-uuid', label: 'Stock Out', href: '/inventory/stock-out', icon: null, parentId: stockMgmtId, level: 3, order: 20, roles: ['user', 'admin'], isActive: true, ten_id, stg_id },
            { id: 'inv-stock-balance-uuid', label: 'Stock Balance', href: '/inventory/stock', icon: null, parentId: stockMgmtId, level: 3, order: 30, roles: ['user', 'admin'], isActive: true, ten_id, stg_id },
            { id: 'inv-locations-uuid', label: 'Locations', href: '/inventory/locations', icon: null, parentId: invRootId, level: 2, order: 30, roles: ['user', 'admin'], isActive: true, ten_id, stg_id },
            { id: 'inv-batch-serial-uuid', label: 'Batch & Serial', href: '/inventory/batch-serial', icon: null, parentId: invRootId, level: 2, order: 40, roles: ['user', 'admin'], isActive: true, ten_id, stg_id },
            { id: 'inv-count-uuid', label: 'Inventory Count', href: '/inventory/inventory-count', icon: null, parentId: invRootId, level: 2, order: 50, roles: ['user', 'admin'], isActive: true, ten_id, stg_id },
            { id: 'inv-min-stock-uuid', label: 'Min Stock & Alerts', href: '/inventory/min-stock', icon: null, parentId: invRootId, level: 2, order: 60, roles: ['user', 'admin'], isActive: true, ten_id, stg_id },
            { id: 'inv-discrepancy-uuid', label: 'Discrepancy Handling', href: '/inventory/discrepancy', icon: null, parentId: invRootId, level: 2, order: 70, roles: ['user', 'admin'], isActive: true, ten_id, stg_id },
            { id: pluginsId, label: 'Industry Plugins', href: null, icon: null, parentId: invRootId, level: 2, order: 80, roles: ['user', 'admin'], isActive: true, ten_id, stg_id },
            { id: 'inv-plugin-plastic-uuid', label: 'Plastic - Waste Tracking', href: '/inventory/plugins/plastic/waste-tracking', icon: null, parentId: pluginsId, level: 3, order: 10, roles: ['user', 'admin'], isActive: true, ten_id, stg_id },
            { id: 'inv-plugin-food-uuid', label: 'Food - Expiry Management', href: '/inventory/plugins/food/expiry', icon: null, parentId: pluginsId, level: 3, order: 20, roles: ['user', 'admin'], isActive: true, ten_id, stg_id },
            { id: 'inv-plugin-mechanical-uuid', label: 'Mechanical - Serial Mgmt', href: '/inventory/plugins/mechanical/serial-management', icon: null, parentId: pluginsId, level: 3, order: 30, roles: ['user', 'admin'], isActive: true, ten_id, stg_id },
            { id: 'inv-plugin-wood-uuid', label: 'Wood - Moisture Tracking', href: '/inventory/plugins/wood/moisture', icon: null, parentId: pluginsId, level: 3, order: 40, roles: ['user', 'admin'], isActive: true, ten_id, stg_id }
        );

        console.log('[MENUS] Total menus after injection:', menusList.length);

        // Filter by role and build tree
        console.log('[MENUS] Filtering by role:', userRole);
        const filteredMenus = filterMenuByRole(menusList, userRole);
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
