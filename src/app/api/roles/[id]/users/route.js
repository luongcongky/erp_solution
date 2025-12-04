import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, userRoles } from '@/db/schema/core';
import { eq, and, asc } from 'drizzle-orm';

/**
 * @swagger
 * /api/roles/{id}/users:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Get users by role ID
 *     description: Retrieve all users assigned to a specific role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *       500:
 *         description: Internal server error
 */
export async function GET(request, { params }) {
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

        // Get users with this role using join
        const usersWithRole = await db
            .select({
                id: users.id,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                isActive: users.isActive,
                createdAt: users.createdAt,
            })
            .from(users)
            .innerJoin(userRoles, eq(users.id, userRoles.userId))
            .where(
                and(
                    eq(userRoles.roleId, id),
                    eq(userRoles.tenId, ten_id),
                    eq(userRoles.stgId, stg_id)
                )
            )
            .orderBy(asc(users.firstName), asc(users.lastName));

        return NextResponse.json({ success: true, data: usersWithRole });
    } catch (error) {
        console.error('[API] Error fetching role users:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
