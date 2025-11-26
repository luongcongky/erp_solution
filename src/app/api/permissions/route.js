import { NextResponse } from 'next/server';
import models from '@/models/sequelize/index.js';

const { Permission } = models;

// GET /api/permissions - Get all permissions
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const module = searchParams.get('module');

        const where = module ? { module } : {};

        const permissions = await Permission.findAll({
            where,
            order: [['module', 'ASC'], ['action', 'ASC']]
        });

        return NextResponse.json({ success: true, data: permissions });
    } catch (error) {
        console.error('[API] Error fetching permissions:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST /api/permissions - Create new permission
export async function POST(request) {
    try {
        const body = await request.json();
        const { key, module, action, description } = body;

        const permission = await Permission.create({
            key,
            module,
            action,
            description
        });

        return NextResponse.json({ success: true, data: permission }, { status: 201 });
    } catch (error) {
        console.error('[API] Error creating permission:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
