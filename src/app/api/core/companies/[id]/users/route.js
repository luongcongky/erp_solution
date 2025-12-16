
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, companies, userRoles } from '@/db/schema/core';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { DEFAULT_USER_PASSWORD } from '@/lib/constants';

export async function GET(request, { params }) {
    try {
        const { id: companyId } = await params;

        // First get company code to match tenId
        const [company] = await db.select().from(companies).where(eq(companies.id, companyId));

        if (!company) {
            return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
        }

        // Get users with their roles using raw SQL for better performance
        const { sql } = await import('drizzle-orm');
        const usersWithRoles = await db.execute(sql`
            SELECT 
                u.id,
                u.email,
                u.first_name,
                u.last_name,
                u.is_active,
                u.ten_id,
                u.stg_id,
                u.created_at,
                u.updated_at,
                STRING_AGG(r.name, ', ') as roles
            FROM "core"."users" u
            LEFT JOIN "core"."user_roles" ur ON u.id = ur.user_id
            LEFT JOIN "core"."roles" r ON ur.role_id = r.id
            WHERE u.ten_id = ${company.code}
            GROUP BY u.id, u.email, u.first_name, u.last_name, u.is_active, u.ten_id, u.stg_id, u.created_at, u.updated_at
            ORDER BY u.created_at DESC
        `);

        // Format the response
        const sanitizedUsers = usersWithRoles.rows.map(user => ({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            isActive: user.is_active,
            tenId: user.ten_id,
            stgId: user.stg_id,
            roles: user.roles || 'No roles',
            createdAt: user.created_at,
            updatedAt: user.updated_at
        }));

        return NextResponse.json({ success: true, data: sanitizedUsers });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    try {
        const { id: companyId } = await params;
        const body = await request.json();
        const { email, firstName, lastName, password, roleIds, isActive } = body;

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
        }

        // Get company for tenId
        const [company] = await db.select().from(companies).where(eq(companies.id, companyId));
        if (!company) {
            return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
        }

        // Hash password (use provided or default)
        const hashedPassword = await bcrypt.hash(password || DEFAULT_USER_PASSWORD, 10);

        // Transaction handling (basic sequence for now, could be db.transaction if needed)

        // 1. Create User
        const [newUser] = await db.insert(users).values({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            tenId: company.code, // ERROR PROOF: Using company.code as requested
            stgId: 'DEV', // Default stage
            isActive: isActive !== undefined ? isActive : true
        }).returning();

        // 2. Assign Roles if provided
        if (roleIds && roleIds.length > 0) {
            const roleInserts = roleIds.map(roleId => ({
                userId: newUser.id,
                roleId: roleId,
                tenId: company.code,
                stgId: 'DEV'
            }));

            await db.insert(userRoles).values(roleInserts);
        }

        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json({ success: true, data: userWithoutPassword });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
