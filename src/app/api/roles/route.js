import { NextResponse } from 'next/server';
import { db } from '@/db';
import { roles, userRoles } from '@/db/schema/core';
import { eq, and, sql } from 'drizzle-orm';

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
        const ten_id = request.headers.get('x-tenant-id') || '1000';
        const stg_id = request.headers.get('x-stage-id') || 'DEV';

        console.log('[ROLES] Fetching roles for:', { ten_id, stg_id });

        // Fetch roles
        const rolesList = await db
            .select()
            .from(roles)
            .where(
                and(
                    eq(roles.tenId, ten_id),
                    eq(roles.stgId, stg_id)
                )
            );

        // Fetch user counts for each role
        // We can optimize this with a left join and group by, but for now simple loop is fine for small number of roles
        const rolesWithCount = await Promise.all(rolesList.map(async (role) => {
            const [countResult] = await db
                .select({ count: sql`count(*)` })
                .from(userRoles)
                .where(
                    and(
                        eq(userRoles.roleId, role.id),
                        eq(userRoles.tenId, ten_id),
                        eq(userRoles.stgId, stg_id)
                    )
                );

            return {
                ...role,
                usersCount: Number(countResult?.count || 0)
            };
        }));

        return NextResponse.json({ success: true, data: rolesWithCount });
    } catch (error) {
        console.error('[API] Error fetching roles:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
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
    console.log('[API] POST /api/roles started');
    try {
        const body = await request.json();
        const { name, description, ten_id = '1000', stg_id = 'DEV', permissions: permIds = [] } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Name is required' },
                { status: 400 }
            );
        }

        // Create role
        const [newRole] = await db
            .insert(roles)
            .values({
                name,
                description,
                tenId: ten_id,
                stgId: stg_id,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning();


        // Add permissions if provided (TODO: Implement permissions junction table insert if needed)
        // Currently permissions table is separate, usually there is role_permissions table.
        // But schema only shows 'permissions' table and 'user_roles'. 
        // Assuming there might be a role_permissions table missing or logic is different.
        // For now, just create the role.

        return NextResponse.json({ success: true, data: newRole }, { status: 201 });
    } catch (error) {
        console.error('[API] Error creating role:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
