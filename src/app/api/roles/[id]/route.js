import { NextResponse } from 'next/server';
import { db } from '@/db';
import { roles, userRoles } from '@/db/schema/core';
import { eq, and, sql } from 'drizzle-orm';

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     tags:
 *       - Roles
 *     summary: Delete a role
 *     description: Delete a role by ID. Cannot delete if users are assigned.
 */
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const ten_id = request.headers.get('x-tenant-id') || '1000';
        const stg_id = request.headers.get('x-stage-id') || 'DEV';

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Role ID is required' },
                { status: 400 }
            );
        }

        // Check if role has users
        const [countResult] = await db
            .select({ count: sql`count(*)` })
            .from(userRoles)
            .where(
                and(
                    eq(userRoles.roleId, id),
                    eq(userRoles.tenId, ten_id),
                    eq(userRoles.stgId, stg_id)
                )
            );

        if (countResult && Number(countResult.count) > 0) {
            return NextResponse.json(
                { success: false, error: 'Cannot delete role that has assigned users. Please remove all users from this role first.' },
                { status: 400 }
            );
        }

        // Delete role
        const [deletedRole] = await db
            .delete(roles)
            .where(
                and(
                    eq(roles.id, id),
                    eq(roles.tenId, ten_id),
                    eq(roles.stgId, stg_id)
                )
            )
            .returning();

        if (!deletedRole) {
            return NextResponse.json(
                { success: false, error: 'Role not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API] Error deleting role:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     tags:
 *       - Roles
 *     summary: Update a role
 */
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, description } = body;
        const ten_id = request.headers.get('x-tenant-id') || '1000';
        const stg_id = request.headers.get('x-stage-id') || 'DEV';

        if (!id) {
            return NextResponse.json({ success: false, error: 'Role ID is required' }, { status: 400 });
        }

        // Update role
        const [updatedRole] = await db
            .update(roles)
            .set({
                name,
                description,
                updatedAt: new Date()
            })
            .where(
                and(
                    eq(roles.id, id),
                    eq(roles.tenId, ten_id),
                    eq(roles.stgId, stg_id)
                )
            )
            .returning();

        if (!updatedRole) {
            return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedRole });
    } catch (error) {
        console.error('[API] Error updating role:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
