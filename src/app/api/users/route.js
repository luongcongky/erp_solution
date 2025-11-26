import { NextResponse } from 'next/server';
import { sequelize } from '@/models/sequelize/index.js';

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     description: Retrieve all users from the database
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
export async function GET(request) {
    try {
        const [users] = await sequelize.query(
            `SELECT 
                u.id, 
                u.email, 
                u."firstName", 
                u."lastName",
                CONCAT(u."firstName", ' ', u."lastName") as name,
                u."isActive",
                u."createdAt" as "lastLogin",
                COALESCE(
                    (SELECT STRING_AGG(r.name, ', ')
                     FROM "core"."user_roles" ur
                     JOIN "core"."roles" r ON ur.role_id = r.id
                     WHERE ur.user_id = u.id),
                    'No Role'
                ) as role,
                CASE 
                    WHEN u."isActive" = true THEN 'active'
                    ELSE 'inactive'
                END as status
             FROM "core"."users" u
             ORDER BY u."createdAt" DESC`
        );

        return NextResponse.json({ success: true, data: users });
    } catch (error) {
        console.error('[API] Error fetching users:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
