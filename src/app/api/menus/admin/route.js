/* 
 * ✅ CONVERTED TO DRIZZLE ORM
 * All queries now use Drizzle instead of Sequelize
 */

import { NextResponse } from 'next/server';
import { db } from '@/db';
import { menus } from '@/db/schema/core';
import { eq, and, asc, inArray } from 'drizzle-orm';

/**
 * Helper to get all descendant IDs (up to 3 levels as per current structure)
 */
async function getDescendantIds(rootId) {

    // Level 1 (Children)
    const children = await db
        .select({ id: menus.id })
        .from(menus)
        .where(eq(menus.parentId, rootId));

    const childIds = children.map(c => c.id);

    if (childIds.length === 0) return [];

    // Level 2 (Grandchildren)
    const grandchildren = await db
        .select({ id: menus.id })
        .from(menus)
        .where(inArray(menus.parentId, childIds));

    const grandchildIds = grandchildren.map(gc => gc.id);

    return [...childIds, ...grandchildIds];
}

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

        const menusList = await db
            .select()
            .from(menus)
            .where(
                and(
                    eq(menus.tenId, ten_id),
                    eq(menus.stgId, stg_id)
                )
            )
            .orderBy(asc(menus.level), asc(menus.order));

        return NextResponse.json({
            success: true,
            data: menusList,
            count: menusList.length,
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
 *               - label
 *               - href
 *             properties:
 *               label:
 *                 type: string
 *               href:
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
            tenId: ten_id,
            stgId: stg_id,
        };

        const [newMenu] = await db
            .insert(menus)
            .values(menuData)
            .returning();

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
 *     description: Update an existing menu item. If isActive changes, it cascades to children. (Admin only)
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
 *               label:
 *                 type: string
 *               href:
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

        // Check if menu exists
        const [existingMenu] = await db
            .select()
            .from(menus)
            .where(eq(menus.id, id))
            .limit(1);

        if (!existingMenu) {
            return NextResponse.json(
                { success: false, error: 'Menu not found' },
                { status: 404 }
            );
        }

        // Check for cascade update on isActive
        let idsToUpdate = [id];
        if (updateData.isActive !== undefined && updateData.isActive !== existingMenu.isActive) {
            const descendantIds = await getDescendantIds(id);
            idsToUpdate = [...idsToUpdate, ...descendantIds];
        }

        // Execute Update
        let result;
        if (idsToUpdate.length > 1) {
            // Use transaction for consistency
            await db.transaction(async (tx) => {
                // 1. Update target with all data
                await tx.update(menus)
                    .set(updateData)
                    .where(eq(menus.id, id));

                // 2. Update descendants (only isActive)
                await tx.update(menus)
                    .set({ isActive: updateData.isActive })
                    .where(inArray(menus.id, idsToUpdate.filter(tid => tid !== id)));
            });
            // Fetch updated
            [result] = await db.select().from(menus).where(eq(menus.id, id));
        } else {
            [result] = await db
                .update(menus)
                .set(updateData)
                .where(eq(menus.id, id))
                .returning();
        }

        return NextResponse.json({
            success: true,
            data: result,
            message: idsToUpdate.length > 1 ? `Updated menu and ${idsToUpdate.length - 1} descendants` : undefined
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

        // Check if menu exists
        const [existingMenu] = await db
            .select()
            .from(menus)
            .where(eq(menus.id, id))
            .limit(1);

        if (!existingMenu) {
            return NextResponse.json(
                { success: false, error: 'Menu not found' },
                { status: 404 }
            );
        }

        // Get all descendant IDs
        const descendantIds = await getDescendantIds(id);
        const allIdsToDelete = [id, ...descendantIds];

        // Delete all
        await db
            .delete(menus)
            .where(inArray(menus.id, allIdsToDelete));

        return NextResponse.json({
            success: true,
            message: `Menu and ${descendantIds.length} descendants deleted successfully`,
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
