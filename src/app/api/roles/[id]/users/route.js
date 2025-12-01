import { NextResponse } from 'next/server';
import { sequelize } from '@/models/sequelize/index.js';

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 */
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Role ID is required' },
                { status: 400 }
            );
        }

        const [users] = await sequelize.query(
            `SELECT u.id, u.email, u."firstName", u."lastName", u."isActive", u."createdAt"
             FROM "core"."users" u
             JOIN "core"."user_roles" ur ON u.id = ur.user_id
             WHERE ur.role_id = :roleId AND ur.ten_id = '1000' AND ur.stg_id = 'DEV'
             ORDER BY u."firstName" ASC, u."lastName" ASC`,
            {
                replacements: { roleId: id }
            }
        );

        return NextResponse.json({ success: true, data: users });
    } catch (error) {
        console.error('[API] Error fetching role users:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
