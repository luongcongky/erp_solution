import { NextResponse } from 'next/server';
import models from '../../../models/sequelize/index.js';
import { filterMenuByRole, buildMenuTree } from '../../../lib/menuHelpers.js';

const { Menu } = models;

/**
 * @swagger
 * /api/menus:
 *   get:
 *     tags:
 *       - Menus
 *     summary: Get menu tree
 *     description: Fetch hierarchical menu tree filtered by user role, tenant, and stage
 *     parameters:
 *       - in: header
 *         name: x-user-role
 *         schema:
 *           type: string
 *           default: user
 *         description: User role for filtering menu items
 *       - in: header
 *         name: x-tenant-id
 *         schema:
 *           type: string
 *           default: "1000"
 *         description: Tenant ID
 *       - in: header
 *         name: x-stage-id
 *         schema:
 *           type: string
 *           default: DEV
 *         description: Stage ID (DEV, UAT, PROD)
 *     responses:
 *       200:
 *         description: Menu tree retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       path:
 *                         type: string
 *                       icon:
 *                         type: string
 *                       level:
 *                         type: integer
 *                       order:
 *                         type: integer
 *                       children:
 *                         type: array
 *                         items:
 *                           type: object
 *                 count:
 *                   type: integer
 *                   description: Total number of menu items (including nested)
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request) {
    try {
        const userRole = request.headers.get('x-user-role') || 'user';
        const ten_id = request.headers.get('x-tenant-id') || '1000';
        const stg_id = request.headers.get('x-stage-id') || 'DEV';

        // Fetch all menus for this tenant and stage
        const menus = await Menu.findAll({
            where: {
                ten_id,
                stg_id,
                isActive: true,
            },
            order: [
                ['level', 'ASC'],
                ['order', 'ASC'],
            ],
            raw: true,
        });


        // --- INJECT INVENTORY MENU (Temporary/Dev) ---
        // Find existing Inventory menu or create new one
        const existingInventory = menus.find(m => m.label === 'Inventory');
        const invRootId = existingInventory ? existingInventory.id : 'inv-root-uuid';
        const stockMgmtId = 'inv-stock-mgmt-uuid';
        const pluginsId = 'inv-plugins-uuid';

        // Create root Inventory menu if it doesn't exist
        if (!existingInventory) {
            menus.push({
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

        // Remove old inventory submenu items to avoid duplicates
        const oldInvItems = ['inv-dash-uuid', 'inv-prod-uuid', 'inv-stock-in-uuid', 'inv-stock-out-uuid',
            'inv-stock-balance-uuid', 'inv-locations-uuid', 'inv-batch-serial-uuid',
            'inv-count-uuid', 'inv-min-stock-uuid', 'inv-discrepancy-uuid',
            stockMgmtId, pluginsId, 'inv-plugin-plastic-uuid', 'inv-plugin-food-uuid',
            'inv-plugin-mechanical-uuid', 'inv-plugin-wood-uuid'];
        for (let i = menus.length - 1; i >= 0; i--) {
            if (oldInvItems.includes(menus[i].id) || menus[i].parentId === invRootId) {
                menus.splice(i, 1);
            }
        }

        // Dashboard
        menus.push({
            id: 'inv-dash-uuid',
            label: 'Dashboard',
            href: '/inventory',
            icon: null,
            parentId: invRootId,
            level: 2,
            order: 10,
            roles: ['user', 'admin'],
            isActive: true,
            ten_id, stg_id
        });

        // Stock Management (Parent)
        menus.push({
            id: stockMgmtId,
            label: 'Stock Management',
            href: null,
            icon: null,
            parentId: invRootId,
            level: 2,
            order: 20,
            roles: ['user', 'admin'],
            isActive: true,
            ten_id, stg_id
        });

        // Stock In
        menus.push({
            id: 'inv-stock-in-uuid',
            label: 'Stock In',
            href: '/inventory/stock-in',
            icon: null,
            parentId: stockMgmtId,
            level: 3,
            order: 10,
            roles: ['user', 'admin'],
            isActive: true,
            ten_id, stg_id
        });

        // Stock Out
        menus.push({
            id: 'inv-stock-out-uuid',
            label: 'Stock Out',
            href: '/inventory/stock-out',
            icon: null,
            parentId: stockMgmtId,
            level: 3,
            order: 20,
            roles: ['user', 'admin'],
            isActive: true,
            ten_id, stg_id
        });

        // Stock Balance
        menus.push({
            id: 'inv-stock-balance-uuid',
            label: 'Stock Balance',
            href: '/inventory/stock',
            icon: null,
            parentId: stockMgmtId,
            level: 3,
            order: 30,
            roles: ['user', 'admin'],
            isActive: true,
            ten_id, stg_id
        });

        // Locations
        menus.push({
            id: 'inv-locations-uuid',
            label: 'Locations',
            href: '/inventory/locations',
            icon: null,
            parentId: invRootId,
            level: 2,
            order: 30,
            roles: ['user', 'admin'],
            isActive: true,
            ten_id, stg_id
        });

        // Batch & Serial
        menus.push({
            id: 'inv-batch-serial-uuid',
            label: 'Batch & Serial',
            href: '/inventory/batch-serial',
            icon: null,
            parentId: invRootId,
            level: 2,
            order: 40,
            roles: ['user', 'admin'],
            isActive: true,
            ten_id, stg_id
        });

        // Inventory Count
        menus.push({
            id: 'inv-count-uuid',
            label: 'Inventory Count',
            href: '/inventory/inventory-count',
            icon: null,
            parentId: invRootId,
            level: 2,
            order: 50,
            roles: ['user', 'admin'],
            isActive: true,
            ten_id, stg_id
        });

        // Min Stock & Alerts
        menus.push({
            id: 'inv-min-stock-uuid',
            label: 'Min Stock & Alerts',
            href: '/inventory/min-stock',
            icon: null,
            parentId: invRootId,
            level: 2,
            order: 60,
            roles: ['user', 'admin'],
            isActive: true,
            ten_id, stg_id
        });

        // Discrepancy Handling
        menus.push({
            id: 'inv-discrepancy-uuid',
            label: 'Discrepancy Handling',
            href: '/inventory/discrepancy',
            icon: null,
            parentId: invRootId,
            level: 2,
            order: 70,
            roles: ['user', 'admin'],
            isActive: true,
            ten_id, stg_id
        });

        // Industry Plugins (Parent)
        menus.push({
            id: pluginsId,
            label: 'Industry Plugins',
            href: null,
            icon: null,
            parentId: invRootId,
            level: 2,
            order: 80,
            roles: ['user', 'admin'],
            isActive: true,
            ten_id, stg_id
        });

        // Plastic - Waste Tracking
        menus.push({
            id: 'inv-plugin-plastic-uuid',
            label: 'Plastic - Waste Tracking',
            href: '/inventory/plugins/plastic/waste-tracking',
            icon: null,
            parentId: pluginsId,
            level: 3,
            order: 10,
            roles: ['user', 'admin'],
            isActive: true,
            ten_id, stg_id
        });

        // Food - Expiry Management
        menus.push({
            id: 'inv-plugin-food-uuid',
            label: 'Food - Expiry Management',
            href: '/inventory/plugins/food/expiry',
            icon: null,
            parentId: pluginsId,
            level: 3,
            order: 20,
            roles: ['user', 'admin'],
            isActive: true,
            ten_id, stg_id
        });

        // Mechanical - Serial Management
        menus.push({
            id: 'inv-plugin-mechanical-uuid',
            label: 'Mechanical - Serial Mgmt',
            href: '/inventory/plugins/mechanical/serial-management',
            icon: null,
            parentId: pluginsId,
            level: 3,
            order: 30,
            roles: ['user', 'admin'],
            isActive: true,
            ten_id, stg_id
        });

        // Wood - Moisture Tracking
        menus.push({
            id: 'inv-plugin-wood-uuid',
            label: 'Wood - Moisture Tracking',
            href: '/inventory/plugins/wood/moisture',
            icon: null,
            parentId: pluginsId,
            level: 3,
            order: 40,
            roles: ['user', 'admin'],
            isActive: true,
            ten_id, stg_id
        });
        // ---------------------------------------------

        // Filter by role and build tree
        const filteredMenus = filterMenuByRole(menus, userRole);
        const menuTree = buildMenuTree(filteredMenus);

        // Count items
        const countItems = (items) => {
            return items.reduce((count, item) => {
                return count + 1 + (item.children ? countItems(item.children) : 0);
            }, 0);
        };

        return NextResponse.json({
            success: true,
            data: menuTree,
            count: countItems(menuTree),
        });
    } catch (error) {
        console.error('[API] /api/menus GET error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch menus',
                message: error.message,
            },
            { status: 500 }
        );
    }
}
