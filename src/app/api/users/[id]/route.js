import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, userRoles, roles } from '@/db/schema/core';
import { eq, and, ne, sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';

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

        const ten_id = request.headers.get('x-tenant-id') || '1000';
        const stg_id = request.headers.get('x-stage-id') || 'DEV';

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await db
            .select({ id: users.id, email: users.email })
            .from(users)
            .where(
                and(
                    eq(users.id, id),
                    eq(users.tenId, ten_id),
                    eq(users.stgId, stg_id)
                )
            )
            .limit(1);

        if (!existingUser || existingUser.length === 0) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Check email uniqueness (excluding current user) within the same tenant
        if (email && email !== existingUser[0].email) {
            const emailCheck = await db
                .select({ id: users.id })
                .from(users)
                .where(
                    and(
                        eq(users.email, email),
                        ne(users.id, id),
                        eq(users.tenId, ten_id),
                        eq(users.stgId, stg_id)
                    )
                )
                .limit(1);

            if (emailCheck && emailCheck.length > 0) {
                return NextResponse.json(
                    { success: false, error: 'Email already exists' },
                    { status: 400 }
                );
            }
        }

        // Build update data
        const updateData = {};

        if (email) updateData.email = email;
        if (firstName) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        updateData.updatedAt = new Date();

        // Update user
        await db
            .update(users)
            .set(updateData)
            .where(
                and(
                    eq(users.id, id),
                    eq(users.tenId, ten_id),
                    eq(users.stgId, stg_id)
                )
            );

        // Update roles
        // First, delete existing role assignments
        await db
            .delete(userRoles)
            .where(
                and(
                    eq(userRoles.userId, id),
                    eq(userRoles.tenId, ten_id),
                    eq(userRoles.stgId, stg_id)
                )
            );

        // Then, insert new role assignments
        if (roleIds.length > 0) {
            const roleAssignments = roleIds.map(roleId => ({
                userId: id,
                roleId: roleId,
                tenId: ten_id,
                stgId: stg_id,
            }));

            await db.insert(userRoles).values(roleAssignments);
        }

        // Fetch updated user
        const updatedUser = await db
            .select({
                id: users.id,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                isActive: users.isActive,
            })
            .from(users)
            .where(
                and(
                    eq(users.id, id),
                    eq(users.tenId, ten_id),
                    eq(users.stgId, stg_id)
                )
            )
            .limit(1);

        return NextResponse.json({ success: true, data: updatedUser[0] });
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
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user profile
 *     description: Get user profile with aggregated roles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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

        console.log(`[API] Fetching user ${id} for tenant ${ten_id} stage ${stg_id}`);

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Fetch user with aggregated roles using raw SQL (complex aggregation)
        // FIXED: Removed tenant filtering from role subquery - 2025-12-09
        const userResult = await db.execute(sql`
            SELECT 
                u.id,
                u.email,
                u.first_name as "firstName",
                u.last_name as "lastName",
                u.is_active as "isActive",
                u.created_at as "createdAt",
                CONCAT(u.first_name, ' ', u.last_name) as name,
                COALESCE(
                    (SELECT STRING_AGG(r.name, ', ')
                     FROM "core"."user_roles" ur
                     JOIN "core"."roles" r ON ur.role_id = r.id
                     WHERE ur.user_id = u.id),
                    'No Role'
                ) as role,
                CASE 
                    WHEN u.is_active = true THEN 'active'
                    ELSE 'inactive'
                END as status,
                u.created_at as "lastLogin"
            FROM "core"."users" u
            WHERE u.id = ${id}::uuid AND u.ten_id = ${ten_id} AND u.stg_id = ${stg_id}
        `);

        if (!userResult.rows || userResult.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        console.log('[API] User found:', userResult.rows[0]);
        return NextResponse.json({ success: true, data: userResult.rows[0] });
    } catch (error) {
        console.error('[API] Error fetching user:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
