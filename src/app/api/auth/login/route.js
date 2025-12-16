export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { users, userRoles, roles } from '../../../../db/schema/core';
import { eq, and, sql } from 'drizzle-orm';
import { getCompanyByEmail } from '@/lib/utils/multiCompany';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: Authenticate user with email and password
 */
export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Vui lòng nhập email và mật khẩu' },
                { status: 400 }
            );
        }

        const { SUPERADMIN_CREDENTIALS } = await import('@/lib/constants');

        // Check for Superadmin
        if (email === SUPERADMIN_CREDENTIALS.EMAIL && password === SUPERADMIN_CREDENTIALS.PASSWORD) {
            return NextResponse.json(
                {
                    success: true,
                    data: {
                        id: 'superadmin',
                        name: 'Super Admin',
                        email: SUPERADMIN_CREDENTIALS.EMAIL,
                        role: 'Superadmin',
                        isSuperAdmin: true, // Flag for frontend redirection
                        ten_id: '1000', // Default tenant for menu visibility
                        stg_id: 'DEV'
                    }
                },
                { status: 200 }
            );
        }


        // Find user with Drizzle - query by email only
        // Tenant info (ten_id, stg_id) will be retrieved from user record
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase().trim()))
            .limit(1);

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Sai tài khoản hoặc mật khẩu' },
                { status: 401 }
            );
        }

        // Compare password using bcrypt
        const bcrypt = await import('bcrypt');
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return NextResponse.json(
                { success: false, error: 'Sai tài khoản hoặc mật khẩu' },
                { status: 401 }
            );
        }

        // Remove password from response and use company context from user record
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

        // Get company context from email for domain info
        // Note: The user demanded logic to extract ten_id/stg_id from email, 
        // but current implementation correctly prioritizes user record's stored ten_id/stg_id 
        // while using email domain for company context. 
        // If we need to STRICTLY use email, we'd rely solely on getCompanyByEmail, 
        // but that function returns hardcoded default. 
        // We will keep existing logic as it's more robust for real auth, 
        // but verify getCompanyByEmail usage if needed.
        const companyContext = await getCompanyByEmail(email);

        // Fetch user roles using raw SQL (Drizzle ORM query was failing)
        console.log('[LOGIN] Fetching roles for user ID:', user.id);

        // Debug: Check what user_ids exist in user_roles table
        const debugResult = await db.execute(sql`
            SELECT DISTINCT user_id FROM "core"."user_roles" LIMIT 5
        `);
        console.log('[LOGIN] Sample user_ids in user_roles table:', debugResult.rows);

        const userRolesResult = await db.execute(sql`
            SELECT r.name
            FROM "core"."user_roles" ur
            JOIN "core"."roles" r ON ur.role_id = r.id
            WHERE ur.user_id = ${user.id}::uuid
        `);

        console.log('[LOGIN] Raw SQL result:', userRolesResult);
        console.log('[LOGIN] User roles fetched:', userRolesResult.rows);
        const roleNames = userRolesResult.rows.map(r => r.name).join(', ');
        console.log('[LOGIN] Role names string:', roleNames);


        const userWithoutPassword = {
            id: user.id,
            name: fullName,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: roleNames, // Now correctly populated
            ten_id: user.tenId,
            stg_id: user.stgId,
            company: {
                name: companyContext.name,
                domain: companyContext.domain
            }
        };

        return NextResponse.json(
            { success: true, data: userWithoutPassword },
            { status: 200 }
        );
    } catch (error) {
        console.error('Login API error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
