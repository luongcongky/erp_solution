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
