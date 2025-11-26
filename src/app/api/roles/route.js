import { NextResponse } from 'next/server';
import models, { sequelize, setupAssociations } from '@/models/sequelize/index.js';

// Force Rebuild 123
// Ensure associations are set up
setupAssociations();

const { Role, Permission } = models;

/**
 * @swagger
 * /api/roles:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Get all roles
 *     description: Retrieve all roles with user counts. Filtered by tenant and stage.
 *     responses:
 *       200:
 *         description: Successfully retrieved roles
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
 *                     $ref: '#/components/schemas/Role'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET(request) {
    try {
        // Raw query to bypass potential model/include issues
        const [roles] = await sequelize.query(
            `SELECT * FROM "core"."roles" WHERE ten_id = '1000' AND stg_id = 'DEV' ORDER BY name ASC`
        );

        // Manually fetch counts for each role to verify data
        for (let role of roles) {
            const [countResult] = await sequelize.query(
                `SELECT COUNT(*) as count FROM "core"."user_roles" WHERE role_id = :roleId`,
                {
                    replacements: { roleId: role.id },
                    type: sequelize.QueryTypes.SELECT
                }
            );
            role.usersCount = countResult ? countResult.count : 0;
        }

        return NextResponse.json({ success: true, data: roles });
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
 *     description: Create a new role with optional permissions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Role name
 *                 example: Manager
 *               description:
 *                 type: string
 *                 description: Role description
 *                 example: Manager with limited access
 *               ten_id:
 *                 type: string
 *                 description: Tenant ID
 *                 example: "1000"
 *                 default: "1000"
 *               stg_id:
 *                 type: string
 *                 description: Stage ID
 *                 example: DEV
 *                 default: DEV
 *               permissions:
 *                 type: array
 *                 description: Array of permission IDs
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, description, ten_id = '1000', stg_id = 'DEV', permissions = [] } = body;

        const role = await Role.create({
            name,
            description,
            ten_id,
            stg_id
        });

        // Add permissions if provided
        if (permissions.length > 0) {
            const permissionRecords = await Permission.findAll({
                where: { id: permissions }
            });
            await role.setPermissions(permissionRecords);
        }

        return NextResponse.json({ success: true, data: role }, { status: 201 });
    } catch (error) {
        console.error('[API] Error creating role:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
