import { NextResponse } from 'next/server';
import { sequelize } from '@/models/sequelize/index.js';

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       500:
 *         description: Internal server error
 */
export async function DELETE(request, { params }) {
    try {
        const { id, userId } = await params;

        if (!id || !userId) {
            return NextResponse.json(
                { success: false, error: 'Role ID and User ID are required' },
                { status: 400 }
            );
        }

        // Delete from user_roles table
        await sequelize.query(
            `DELETE FROM "core"."user_roles" WHERE role_id = :roleId AND user_id = :userId AND ten_id = '1000' AND stg_id = 'DEV'`,
            {
                replacements: { roleId: id, userId: userId }
            }
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
