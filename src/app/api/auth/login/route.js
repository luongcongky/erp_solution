export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { users, userRoles, roles } from '../../../../db/schema/core';
import { eq, and } from 'drizzle-orm';
import { getCompanyByEmail } from '@/lib/multiCompany';

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
        const companyContext = await getCompanyByEmail(email);

        // Fetch user roles
        const userRolesList = await db
            .select({ name: roles.name })
            .from(userRoles)
            .innerJoin(roles, eq(userRoles.roleId, roles.id))
            .where(eq(userRoles.userId, user.id));

        const roleNames = userRolesList.map(r => r.name).join(', ');

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
