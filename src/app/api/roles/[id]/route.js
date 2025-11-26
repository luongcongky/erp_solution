import { NextResponse } from 'next/server';
import models, { sequelize } from '@/models/sequelize/index.js';

const { Role } = models;

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     tags:
 *       - Roles
 *     summary: Delete a role
 *     description: Delete a role by ID. Cannot delete if users are assigned.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       400:
 *         description: Cannot delete role with assigned users
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Role ID is required' },
                { status: 400 }
            );
        }

        // Check if role has users
        const [countResult] = await sequelize.query(
            `SELECT COUNT(*) as count FROM "core"."user_roles" WHERE role_id = :roleId`,
            {
                replacements: { roleId: id },
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (countResult && parseInt(countResult.count) > 0) {
            return NextResponse.json(
                { success: false, error: 'Cannot delete role that has assigned users. Please remove all users from this role first.' },
                { status: 400 }
            );
        }

        const deleted = await Role.destroy({
            where: { id }
        });

        if (!deleted) {
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
 *     description: Update role details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       404:
 *         description: Role not found
 */
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, description } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: 'Role ID is required' }, { status: 400 });
        }

        const role = await Role.findByPk(id);
        if (!role) {
            return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });
        }

        await role.update({
            name,
            description
        });

        return NextResponse.json({ success: true, data: role });
    } catch (error) {
        console.error('[API] Error updating role:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
