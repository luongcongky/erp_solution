import { NextResponse } from 'next/server';
import { db } from '@/db';
import { menus } from '@/db/schema/core';
import { sql } from 'drizzle-orm';

export async function GET() {
    try {
        // Test database connection by counting menus
        const result = await db
            .select({ count: sql < number > `count(*)` })
            .from(menus);

        const count = Number(result[0]?.count || 0);

        return NextResponse.json({
            success: true,
            message: 'PostgreSQL connected successfully (Drizzle ORM)',
            menuCount: count,
        });
    } catch (error) {
        console.error('[Test] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack,
        }, { status: 500 });
    }
}
