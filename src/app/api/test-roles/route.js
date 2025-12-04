import { NextResponse } from 'next/server';
import { db } from '../../../db';
import { sql } from 'drizzle-orm';

export async function GET(request) {
    try {
        // Test query for user_roles
        const userRolesData = await db.execute(sql`SELECT * FROM "core"."user_roles" LIMIT 10`);

        // Test the role aggregation for a specific user
        const userId = '74096830-d8fa-44c7-b2b8-03781ceb3d04';
        const roleTest = await db.execute(sql`
            SELECT STRING_AGG(r.name, ', ') as roles
            FROM "core"."user_roles" ur
            JOIN "core"."roles" r ON ur.role_id = r.id
            WHERE ur.user_id = ${userId}
        `);

        return NextResponse.json({
            success: true,
            userRoles: userRolesData.rows,
            roleTest: roleTest.rows
        });
    } catch (error) {
        console.error('[API] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
