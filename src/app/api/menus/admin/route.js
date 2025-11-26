import { NextResponse } from 'next/server';
import models, { sequelize } from '../../../../models/sequelize/index.js';

const { Menu } = models;

/**
 * @swagger
 * /api/menus/admin:
 *   get:
 *     tags:
 *       - Menus (Admin)
 *     summary: Get all menus (Admin only)
 *     description: Fetch all menu items across all tenants and stages (Admin access required)
 *     parameters:
 *       - in: header
 *         name: x-user-role
 *         schema:
 *           type: string
 *           default: admin
 *         description: User role (must be admin)
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
 *         description: Stage ID
 *     responses:
 *       200:
 *         description: List of menus retrieved successfully
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
 *                     $ref: '#/components/schemas/Menu'
 *                 count:
 *                   type: integer
 *       403:
 *         description: Unauthorized (Admin role required)
 *       500:
 *         description: Server error
 */
export async function GET(request) {
    try {
        const userRole = request.headers.get('x-user-role') || 'user';

        // Check admin role
        if (userRole !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const ten_id = request.headers.get('x-tenant-id') || '1000';
        const stg_id = request.headers.get('x-stage-id') || 'DEV';

        const menus = await Menu.findAll({
            where: { ten_id, stg_id },
            order: [
                ['level', 'ASC'],
                ['order', 'ASC'],
            ],
        });

        return NextResponse.json({
            success: true,
            data: menus,
            count: menus.length,
        });
    } catch (error) {
        console.error('[API] /api/menus/admin GET error:', error);
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

/**
 * @swagger
 * /api/menus/admin:
 *   post:
 *     tags:
 *       - Menus (Admin)
 *     summary: Create menu item
 *     description: Create a new menu item (Admin only)
 *     parameters:
 *       - in: header
 *         name: x-user-role
 *         schema:
 *           type: string
 *           default: admin
 *         description: User role (must be admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - path
 *             properties:
 *               name:
 *                 type: string
 *               path:
 *                 type: string
 *               icon:
 *                 type: string
 *               level:
 *                 type: integer
 *               order:
 *                 type: integer
 *               parentId:
 *                 type: string
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Menu created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Menu'
 *       403:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function POST(request) {
    try {
        const userRole = request.headers.get('x-user-role') || 'user';

        // Check admin role
        if (userRole !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const ten_id = request.headers.get('x-tenant-id') || '1000';
        const stg_id = request.headers.get('x-stage-id') || 'DEV';

        const body = await request.json();

        // Add tenant and stage info
        const menuData = {
            ...body,
            ten_id,
            stg_id,
        };

        const newMenu = await Menu.create(menuData);

        return NextResponse.json({
            success: true,
            data: newMenu,
        }, { status: 201 });
    } catch (error) {
        console.error('[API] /api/menus/admin POST error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create menu',
                message: error.message,
            },
            { status: 500 }
        );
    }
}

/**
 * @swagger
 * /api/menus/admin:
 *   put:
 *     tags:
 *       - Menus (Admin)
 *     summary: Update menu item
 *     description: Update an existing menu item (Admin only)
 *     parameters:
 *       - in: header
 *         name: x-user-role
 *         schema:
 *           type: string
 *           default: admin
 *         description: User role (must be admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               path:
 *                 type: string
 *               icon:
 *                 type: string
 *               level:
 *                 type: integer
 *               order:
 *                 type: integer
 *               parentId:
 *                 type: string
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Menu updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Menu'
 *       400:
 *         description: Menu ID required
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Menu not found
 *       500:
 *         description: Server error
 */
export async function PUT(request) {
    try {
        const userRole = request.headers.get('x-user-role') || 'user';

        // Check admin role
        if (userRole !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Menu ID is required' },
                { status: 400 }
            );
        }

        const menu = await Menu.findByPk(id);

        if (!menu) {
            return NextResponse.json(
                { success: false, error: 'Menu not found' },
                { status: 404 }
            );
        }

        await menu.update(updateData);

        return NextResponse.json({
            success: true,
            data: menu,
        });
    } catch (error) {
        console.error('[API] /api/menus/admin PUT error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update menu',
                message: error.message,
            },
            { status: 500 }
        );
    }
}

/**
 * @swagger
 * /api/menus/admin:
 *   delete:
 *     tags:
 *       - Menus (Admin)
 *     summary: Delete menu item
 *     description: Delete a menu item by ID (Admin only)
 *     parameters:
 *       - in: header
 *         name: x-user-role
 *         schema:
 *           type: string
 *           default: admin
 *         description: User role (must be admin)
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu ID to delete
 *     responses:
 *       200:
 *         description: Menu deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *       400:
 *         description: Menu ID required
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Menu not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request) {
    try {
        const userRole = request.headers.get('x-user-role') || 'user';

        // Check admin role
        if (userRole !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Menu ID is required' },
                { status: 400 }
            );
        }

        const deleted = await Menu.destroy({
            where: { id },
        });

        if (!deleted) {
            return NextResponse.json(
                { success: false, error: 'Menu not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Menu deleted successfully',
        });
    } catch (error) {
        console.error('[API] /api/menus/admin DELETE error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to delete menu',
                message: error.message,
            },
            { status: 500 }
        );
    }
}
