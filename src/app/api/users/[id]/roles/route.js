import { NextResponse } from 'next/server';
import { db } from '@/db';
import { userRoles, roles } from '@/db/schema/core';
import { eq, and } from 'drizzle-orm';

/**
 * @swagger
 * /api/users/{id}/roles:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user's roles
 *     description: Fetch all roles assigned to a specific user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User roles retrieved successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const ten_id = request.headers.get('x-tenant-id') || '1000';
        const stg_id = request.headers.get('x-stage-id') || 'DEV';

        console.log(`[API] Fetching roles for user ${id} in tenant ${ten_id} stage ${stg_id}`);

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Fetch user's roles
        const userRolesList = await db
            .select({
                id: roles.id,
                name: roles.name,
                description: roles.description
            })
            .from(userRoles)
            .innerJoin(roles, eq(userRoles.roleId, roles.id))
            .where(
                and(
                    eq(userRoles.userId, id),
                    eq(userRoles.tenId, ten_id),
                    eq(userRoles.stgId, stg_id)
                )
            );

        console.log('[API] User roles found:', userRolesList);

        return NextResponse.json({
            success: true,
            data: userRolesList
        });
    } catch (error) {
        console.error('[API] Error fetching user roles:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
