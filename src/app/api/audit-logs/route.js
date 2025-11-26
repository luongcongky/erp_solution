import { NextResponse } from 'next/server';
import AuditLog from '@/models/sequelize/core/AuditLog';

export async function POST(request) {
    try {
        const body = await request.json();
        const { action, module, object_type, object_id, details, changes, user_id, userName, ten_id, stg_id } = body;

        // Basic validation
        if (!action) {
            return NextResponse.json(
                { error: 'Action is required' },
                { status: 400 }
            );
        }

        // Extract IP address from request
        const forwarded = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        let ip = forwarded ? forwarded.split(',')[0].trim() : realIp || '127.0.0.1';

        // Convert IPv6 localhost to IPv4 for consistency
        if (ip === '::1' || ip === '::ffff:127.0.0.1') {
            ip = '127.0.0.1';
        }

        // Construct the changes object in the required format
        const formattedChanges = {
            ip: ip,
            user: userName || 'Unknown User',
            details: details || `${action} action on ${module}`,
            timestamp: new Date().toISOString(),
            ...(changes || {}) // Merge any additional changes data
        };

        // Create audit log
        const newLog = await AuditLog.create({
            user_id: user_id || null,
            action,
            module: module || 'UNKNOWN',
            object_type: object_type || null,
            object_id: object_id || null,
            changes: formattedChanges,
            ten_id: ten_id || 'ANTIGRAVITY',
            stg_id: stg_id || 'DEV'
        });

        return NextResponse.json({ success: true, data: newLog }, { status: 201 });
    } catch (error) {
        console.error('Error creating audit log:', error);
        return NextResponse.json(
            {
                error: 'Failed to create audit log',
                details: error.message,
                stack: error.stack
            },
            { status: 500 }
        );
    }
}
