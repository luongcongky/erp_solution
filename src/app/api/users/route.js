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

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags:
 *       - Users
 *     summary: Create a new user
 *     description: Create a new user with email, name, password, and role assignments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstName
 *               - password
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
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error or email already exists
 *       500:
 *         description: Internal server error
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
        const [existingUsers] = await sequelize.query(
            `SELECT id FROM "core"."users" WHERE email = :email`,
            {
                replacements: { email },
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (existingUsers) {
            return NextResponse.json(
                { success: false, error: 'Email already exists' },
                { status: 400 }
            );
        }

        // Hash password (simple hash for demo - use bcrypt in production)
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const [result] = await sequelize.query(
            `INSERT INTO "core"."users" 
             (email, "firstName", "lastName", password, "isActive", ten_id, stg_id, "createdAt", "updatedAt")
             VALUES (:email, :firstName, :lastName, :password, :isActive, '1000', 'DEV', NOW(), NOW())
             RETURNING id, email, "firstName", "lastName", "isActive"`,
            {
                replacements: {
                    email,
                    firstName,
                    lastName: lastName || '',
                    password: hashedPassword,
                    isActive
                },
                type: sequelize.QueryTypes.INSERT
            }
        );

        const newUser = result[0];

        // Assign roles
        if (roleIds.length > 0) {
            const roleValues = roleIds.map(roleId =>
                `('${newUser.id}', '${roleId}', '1000', 'DEV', NOW(), NOW())`
            ).join(',');

            await sequelize.query(
                `INSERT INTO "core"."user_roles" (user_id, role_id, ten_id, stg_id, "createdAt", "updatedAt")
                 VALUES ${roleValues}`
            );
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
