import { NextResponse } from 'next/server';
import { initializeDatabase } from '../../../models/sequelize/index.js';
import models from '../../../models/sequelize/index.js';

export async function GET() {
    try {
        // Initialize database
        await initializeDatabase();

        const { Menu } = models;

        // Test query
        const count = await Menu.count();

        return NextResponse.json({
            success: true,
            message: 'PostgreSQL connected successfully',
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
