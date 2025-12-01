import { NextResponse } from 'next/server';
import { sequelize } from '@/models/sequelize/index.js';

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update a user
 *     description: Update user details including email, name, password, and role assignments
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
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               password:
 *                 type: string
 *               roleIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { email, firstName, lastName, password, roleIds = [], isActive } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const [existingUser] = await sequelize.query(
            `SELECT id, email FROM "core"."users" WHERE id = :id`,
            {
                replacements: { id },
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (!existingUser) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Check email uniqueness (excluding current user)
        if (email && email !== existingUser.email) {
            const [emailCheck] = await sequelize.query(
                `SELECT id FROM "core"."users" WHERE email = :email AND id != :id`,
                {
                    replacements: { email, id },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            if (emailCheck) {
                return NextResponse.json(
                    { success: false, error: 'Email already exists' },
                    { status: 400 }
                );
            }
        }

        // Build update query
        let updateFields = [];
        let replacements = { id };

        if (email) {
            updateFields.push('"email" = :email');
            replacements.email = email;
        }
        if (firstName) {
            updateFields.push('"firstName" = :firstName');
            replacements.firstName = firstName;
        }
        if (lastName !== undefined) {
            updateFields.push('"lastName" = :lastName');
            replacements.lastName = lastName;
        }
        if (isActive !== undefined) {
            updateFields.push('"isActive" = :isActive');
            replacements.isActive = isActive;
        }
        if (password) {
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push('"password" = :password');
            replacements.password = hashedPassword;
        }

        updateFields.push('"updatedAt" = NOW()');

        // Update user
        await sequelize.query(
            `UPDATE "core"."users" SET ${updateFields.join(', ')} WHERE id = :id`,
            { replacements }
        );

        // Update roles
        // First, delete existing role assignments
        await sequelize.query(
            `DELETE FROM "core"."user_roles" WHERE user_id = :id AND ten_id = '1000' AND stg_id = 'DEV'`,
            { replacements: { id } }
        );

        // Then, insert new role assignments
        if (roleIds.length > 0) {
            const roleValues = roleIds.map(roleId =>
                `('${id}', '${roleId}', '1000', 'DEV', NOW(), NOW())`
            ).join(',');

            await sequelize.query(
                `INSERT INTO "core"."user_roles" (user_id, role_id, ten_id, stg_id, "createdAt", "updatedAt")
                 VALUES ${roleValues}`
            );
        }

        // Fetch updated user
        const [updatedUser] = await sequelize.query(
            `SELECT id, email, "firstName", "lastName", "isActive" 
             FROM "core"."users" WHERE id = :id`,
            {
                replacements: { id },
                type: sequelize.QueryTypes.SELECT
            }
        );

        return NextResponse.json({ success: true, data: updatedUser });
    } catch (error) {
        console.error('[API] Error updating user:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * @swagger
 * /api/users/{id}/roles:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user roles
 *     description: Get all roles assigned to a specific user
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

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Fetch user's roles
        const [roles] = await sequelize.query(
            `SELECT r.id, r.name, r.description
             FROM "core"."roles" r
             JOIN "core"."user_roles" ur ON r.id = ur.role_id
             WHERE ur.user_id = :userId`,
            {
                replacements: { userId: id },
                type: sequelize.QueryTypes.SELECT
            }
        );

        return NextResponse.json({ success: true, data: roles || [] });
    } catch (error) {
        console.error('[API] Error fetching user roles:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
