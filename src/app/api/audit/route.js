import { NextResponse } from 'next/server';
import models, { setupAssociations } from '@/models/sequelize/index.js';
import { Op } from 'sequelize';

const { AuditLog, User } = models;

// Ensure associations are set up
setupAssociations();

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
     *         description: Page number
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Items per page
     *       - in: query
     *         name: action
     *         schema:
     *           type: string
     *         description: Filter by action (create, update, delete, login, etc.)
     *       - in: query
     *         name: resource
     *         schema:
     *           type: string
     *         description: Filter by resource type
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *         description: Search in log details
     *       - in: query
     *         name: dateRange
     *         schema:
     *           type: string
     *           enum: [today, yesterday, last7days, last30days, all]
     *         description: Filter by date range
     *     responses:
     *       200:
     *         description: Audit logs retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/AuditLog'
     *                 pagination:
     *                   type: object
     *                   properties:
     *                     total:
     *                       type: integer
     *                     page:
     *                       type: integer
     *                     limit:
     *                       type: integer
     *                     totalPages:
     *                       type: integer
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

        // Get tenant and stage from headers (set by client from user session)
        const ten_id = request.headers.get('x-tenant-id') || '1000';
        const stg_id = request.headers.get('x-stage-id') || 'DEV';

        // Build where clause
        const where = {
            ten_id,
            stg_id
        };

        // Action filter
        if (action && action !== 'all') {
            where.action = action;
        }

        // Resource filter (object_type)
        if (resource && resource !== 'all') {
            where.object_type = resource;
        }

        // Date range filter
        if (dateRange && dateRange !== 'all') {
            const now = new Date();
            let startDate;

            switch (dateRange) {
                case 'today':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'yesterday':
                    startDate = new Date(now.setDate(now.getDate() - 1));
                    startDate.setHours(0, 0, 0, 0);
                    const endDate = new Date(startDate);
                    endDate.setHours(23, 59, 59, 999);
                    where.created_at = {
                        [Op.between]: [startDate, endDate]
                    };
                    break;
                case 'last7days':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    where.created_at = {
                        [Op.gte]: startDate
                    };
                    break;
                case 'last30days':
                    startDate = new Date(now.setDate(now.getDate() - 30));
                    where.created_at = {
                        [Op.gte]: startDate
                    };
                    break;
            }

            if (dateRange === 'today') {
                where.created_at = {
                    [Op.gte]: new Date(now.setHours(0, 0, 0, 0))
                };
            }
        }

        // Text search (search in changes JSONB field)
        if (search) {
            where[Op.or] = [
                {
                    changes: {
                        [Op.contains]: { user: search }
                    }
                },
                {
                    changes: {
                        [Op.contains]: { details: search }
                    }
                },
                {
                    changes: {
                        [Op.contains]: { ip: search }
                    }
                }
            ];
        }

        // Fetch audit logs with pagination
        const { count, rows } = await AuditLog.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email', 'firstName', 'lastName']
                }
            ],
            limit,
            offset,
            order: [['created_at', 'DESC']],
            raw: true,
            nest: true
        });

        // Transform data to match UI format
        const transformedRows = rows.map(row => {
            // Get user name from User model if available, otherwise fallback to changes.user
            let userName = row.changes?.user || 'System';
            if (row.user && (row.user.firstName || row.user.lastName)) {
                // Use full name from User table (firstName + lastName)
                userName = [row.user.firstName, row.user.lastName].filter(Boolean).join(' ');
            } else if (row.user && row.user.email) {
                userName = row.user.email;
            }

            return {
                id: row.id.toString(),
                timestamp: new Date(row.created_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }),
                user: userName,
                action: row.action,
                resource: row.object_type || row.module || 'System',
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
