import { NextResponse } from 'next/server';
import { db } from '@/db';
import { uiTranslations } from '@/db/schema/core';

export async function GET(request) {
    try {
        console.log('[DEBUG] Testing ui_translations query...');

        // Simple query without filters
        const result = await db
            .select()
            .from(uiTranslations)
            .limit(5);

        console.log('[DEBUG] Query successful, found', result.length, 'records');

        return NextResponse.json({
            success: true,
            count: result.length,
            data: result
        });
    } catch (error) {
        console.error('[DEBUG] Error:', error);
        console.error('[DEBUG] Error message:', error.message);
        console.error('[DEBUG] Error stack:', error.stack);

        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
