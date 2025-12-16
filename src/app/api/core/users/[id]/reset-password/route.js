
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema/core';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { DEFAULT_USER_PASSWORD } from '@/lib/constants';

export async function POST(request, { params }) {
    try {
        const { id: userId } = await params;

        const hashedPassword = await bcrypt.hash(DEFAULT_USER_PASSWORD, 10);

        await db.update(users)
            .set({
                password: hashedPassword,
                updatedAt: new Date()
            })
            .where(eq(users.id, userId));

        return NextResponse.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
