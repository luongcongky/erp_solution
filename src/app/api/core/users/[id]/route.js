
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, userRoles } from '@/db/schema/core';
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export async function GET(request, { params }) {
    try {
        const { id: userId } = await params;

        // Fetch user basic info
        const [user] = await db.select().from(users).where(eq(users.id, userId));

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Fetch user roles
        const roles = await db.execute(sql`
            SELECT r.id, r.name 
            FROM "core"."user_roles" ur
            JOIN "core"."roles" r ON ur.role_id = r.id
            WHERE ur.user_id = ${userId}
        `);

        // Combine data
        const userData = {
            ...user,
            roleIds: roles.rows.map(r => r.id)
        };

        // Remove sensitive data
        delete userData.password;

        return NextResponse.json({ success: true, data: userData });
    } catch (error) {
        console.error('Error fetching user details:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id: userId } = await params;
        const body = await request.json();
        const { email, firstName, lastName, isActive, roleIds } = body;

        // 1. Update User basic info
        const [updatedUser] = await db.update(users)
            .set({
                email,
                firstName,
                lastName,
                isActive,
                updatedAt: new Date()
            })
            .where(eq(users.id, userId))
            .returning();

        if (!updatedUser) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // 2. Update Roles (Replace all)
        if (roleIds !== undefined) {
            // Get current user's context (tenId, stgId) from the user record
            // We can use the updatedUser record for this
            const { tenId, stgId } = updatedUser;

            // Delete existing roles
            await db.delete(userRoles).where(eq(userRoles.userId, userId));

            // Insert new roles
            if (roleIds.length > 0) {
                const roleInserts = roleIds.map(roleId => ({
                    userId: userId,
                    roleId: roleId,
                    tenId: tenId,
                    stgId: stgId || 'DEV'
                }));

                await db.insert(userRoles).values(roleInserts);
            }
        }

        const { password: _, ...userWithoutPassword } = updatedUser;

        return NextResponse.json({ success: true, data: userWithoutPassword });

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
