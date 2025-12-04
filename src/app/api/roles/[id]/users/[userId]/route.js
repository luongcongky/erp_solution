import { NextResponse } from 'next/server';
import { db } from '@/db';
import { userRoles } from '@/db/schema/core';
import { eq, and } from 'drizzle-orm';

/**
 * @swagger
 * /api/roles/{id}/users/{userId}:
 *   delete:
 *     tags:
 *       - Roles
 *     summary: Remove user from role
 *     description: Remove a specific user from a role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successfully removed user from role
 *       500:
 *         description: Internal server error
 */
export async function DELETE(request, { params }) {
    try {
        const { id, userId } = await params;

        const ten_id = request.headers.get('x-tenant-id') || '1000';
        const stg_id = request.headers.get('x-stage-id') || 'DEV';

        if (!id || !userId) {
            return NextResponse.json(
                { success: false, error: 'Role ID and User ID are required' },
                { status: 400 }
            );
        }

        // Delete from user_roles table
        await db
            .delete(userRoles)
            .where(
                and(
                    eq(userRoles.roleId, id),
                    eq(userRoles.userId, userId),
                    eq(userRoles.tenId, ten_id),
                    eq(userRoles.stgId, stg_id)
                )
            );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API] Error removing user from role:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
