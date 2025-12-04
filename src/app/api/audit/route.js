import { NextResponse } from 'next/server';
import { db } from '@/db';
import { auditLogs, users } from '@/db/schema/core';
import { eq, and, gte, between, or, sql, desc } from 'drizzle-orm';

export async function GET(request) {
    /**
     * @swagger
     * /api/audit:
     *   get:
     *     tags:
     *       - System
     *     summary: Get audit logs
     *     description: Retrieve system audit logs with filtering and pagination
     *     parameters:
     *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: resource
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateRange
 *         schema:
 *           type: string
 *           enum: [today, yesterday, last7days, last30days, all]
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       500:
 *         description: Server error
 */
    try {
        const { searchParams } = new URL(request.url);

        // Pagination parameters
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        // Filter parameters
        const action = searchParams.get('action');
        const resource = searchParams.get('resource');
        const dateRange = searchParams.get('dateRange');
        const search = searchParams.get('search');

        // Get tenant and stage from headers
        const ten_id = request.headers.get('x-tenant-id') || '1000';
        const stg_id = request.headers.get('x-stage-id') || 'DEV';

        // Build where conditions
        const conditions = [
            eq(auditLogs.tenId, ten_id),
            eq(auditLogs.stgId, stg_id)
        ];

        // Action filter
        if (action && action !== 'all') {
            conditions.push(eq(auditLogs.action, action));
        }

        // Resource filter (using module field from actual DB)
        if (resource && resource !== 'all') {
            conditions.push(eq(auditLogs.module, resource));
        }

        // Date range filter
        if (dateRange && dateRange !== 'all') {
            const now = new Date();
            let startDate;

            switch (dateRange) {
                case 'today':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    conditions.push(gte(auditLogs.createdAt, startDate));
                    break;
                case 'yesterday':
                    startDate = new Date(now.setDate(now.getDate() - 1));
                    startDate.setHours(0, 0, 0, 0);
                    const endDate = new Date(startDate);
                    endDate.setHours(23, 59, 59, 999);
                    conditions.push(between(auditLogs.createdAt, startDate, endDate));
                    break;
                case 'last7days':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    conditions.push(gte(auditLogs.createdAt, startDate));
                    break;
                case 'last30days':
                    startDate = new Date(now.setDate(now.getDate() - 30));
                    conditions.push(gte(auditLogs.createdAt, startDate));
                    break;
            }
        }

        // Text search in JSONB changes field
        if (search) {
            conditions.push(
                or(
                    sql`${auditLogs.changes}->>'user' ILIKE ${`%${search}%`}`,
                    sql`${auditLogs.changes}->>'details' ILIKE ${`%${search}%`}`,
                    sql`${auditLogs.changes}->>'ip' ILIKE ${`%${search}%`}`
                )
            );
        }

        // Fetch audit logs with user join
        const rows = await db
            .select({
                id: auditLogs.id,
                action: auditLogs.action,
                module: auditLogs.module,
                objectType: auditLogs.objectType,
                objectId: auditLogs.objectId,
                changes: auditLogs.changes,
                createdAt: auditLogs.createdAt,
                userId: users.id,
                userEmail: users.email,
                userFirstName: users.firstName,
                userLastName: users.lastName,
            })
            .from(auditLogs)
            .leftJoin(users, eq(auditLogs.userId, users.id))
            .where(and(...conditions))
            .orderBy(desc(auditLogs.createdAt))
            .limit(limit)
            .offset(offset);

        // Get total count
        const countResult = await db
            .select({ count: sql < number > `count(*)` })
            .from(auditLogs)
            .where(and(...conditions));

        const count = Number(countResult[0]?.count || 0);

        // Transform data to match UI format
        const transformedRows = rows.map(row => {
            // Get user name from User model if available, otherwise fallback to changes.user
            let userName = row.changes?.user || 'System';
            if (row.userFirstName || row.userLastName) {
                userName = [row.userFirstName, row.userLastName].filter(Boolean).join(' ');
            } else if (row.userEmail) {
                userName = row.userEmail;
            }

            return {
                id: row.id.toString(),
                timestamp: new Date(row.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }),
                user: userName,
                action: row.action,
                resource: row.objectType || row.module || 'System',
                ip: row.changes?.ip || 'N/A',
                details: row.changes?.details || 'No details available'
            };
        });

        return NextResponse.json({
            success: true,
            data: transformedRows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch audit logs',
                message: error.message
            },
            { status: 500 }
        );
    }
}
