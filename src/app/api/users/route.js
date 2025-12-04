import { NextResponse } from 'next/server';
import { db } from '../../../db';
import { users, userRoles, roles } from '../../../db/schema';
import { eq, desc, sql } from 'drizzle-orm';

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     description: Retrieve all users from the database with their roles
 */
export async function GET(request) {
    try {
        const ten_id = request.headers.get('x-tenant-id') || '1000';
        const stg_id = request.headers.get('x-stage-id') || 'DEV';

        // Fetch users with aggregated roles using raw SQL
        const usersResult = await db.execute(sql`
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
                     WHERE ur.user_id = u.id AND ur.ten_id = ${ten_id} AND ur.stg_id = ${stg_id}),
                    'No Role'
                ) as role,
                CASE 
                    WHEN u.is_active = true THEN 'active'
                    ELSE 'inactive'
                END as status,
                u.created_at as "lastLogin"
            FROM "core"."users" u
            WHERE u.ten_id = ${ten_id} AND u.stg_id = ${stg_id}
            ORDER BY u.created_at DESC
        `);

        console.log('[API] Users result:', JSON.stringify(usersResult.rows, null, 2));

        return NextResponse.json({ success: true, data: usersResult.rows });
    } catch (error) {
        console.error('[API] Error fetching users:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags:
 *       - Users
 *     summary: Create a new user
 *     description: Create a new user with email, name, password, and role assignments
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { email, firstName, lastName, password, roleIds = [], isActive = true } = body;

        // Validation
        if (!email || !firstName || !password) {
            return NextResponse.json(
                { success: false, error: 'Email, first name, and password are required' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const [existingUser] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'Email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const [newUser] = await db
            .insert(users)
            .values({
                email,
                firstName,
                lastName: lastName || '',
                password: hashedPassword,
                isActive,
                tenId: '1000',
                stgId: 'DEV'
            })
            .returning({
                id: users.id,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                isActive: users.isActive
            });

        // Assign roles
        if (roleIds.length > 0) {
            const roleAssignments = roleIds.map(roleId => ({
                userId: newUser.id,
                roleId: roleId,
                tenId: '1000',
                stgId: 'DEV'
            }));

            await db.insert(userRoles).values(roleAssignments);
        }

        return NextResponse.json(
            { success: true, data: newUser },
            { status: 201 }
        );
    } catch (error) {
        console.error('[API] Error creating user:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
