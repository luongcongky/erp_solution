
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { companies } from '@/db/schema/core';
import { desc } from 'drizzle-orm';

export async function GET(request) {
    try {
        const allCompanies = await db.select().from(companies).orderBy(desc(companies.createdAt));
        return NextResponse.json({ success: true, data: allCompanies });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { code, name, address, phone, email } = body;

        if (!code || !name) {
            return NextResponse.json({ success: false, error: 'Code and Name are required' }, { status: 400 });
        }

        const [newCompany] = await db.insert(companies).values({
            code,
            name,
            address,
            phone,
            email
        }).returning();

        return NextResponse.json({ success: true, data: newCompany });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
