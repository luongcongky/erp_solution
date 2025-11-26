/**
 * Generic CRUD API Helper
 * Provides reusable functions for common CRUD operations with multi-tenant support
 */

import { NextResponse } from 'next/server';

/**
 * Generic GET handler for listing records
 */
export async function handleList(Model, request, options = {}) {
    try {
        const { searchParams } = new URL(request.url);
        const ten_id = searchParams.get('ten_id') || '1000';
        const stg_id = searchParams.get('stg_id') || 'DEV';
        const limit = parseInt(searchParams.get('limit') || '100');
        const offset = parseInt(searchParams.get('offset') || '0');

        const where = { ten_id, stg_id, ...options.where };

        // Add custom filters from query params
        if (options.filters) {
            options.filters.forEach(filter => {
                const value = searchParams.get(filter);
                if (value) where[filter] = value;
            });
        }

        const { count, rows } = await Model.findAndCountAll({
            where,
            include: options.include || [],
            limit,
            offset,
            order: options.order || [['createdAt', 'DESC']]
        });

        return NextResponse.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                limit,
                offset,
                hasMore: offset + limit < count
            }
        });
    } catch (error) {
        console.error(`[API] Error listing ${Model.name}:`, error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * Generic POST handler for creating records
 */
export async function handleCreate(Model, request, options = {}) {
    try {
        const body = await request.json();
        const ten_id = body.ten_id || '1000';
        const stg_id = body.stg_id || 'DEV';

        const data = { ...body, ten_id, stg_id };

        // Apply transformations if provided
        if (options.transform) {
            Object.assign(data, options.transform(data));
        }

        const record = await Model.create(data);

        // Handle related records if provided
        if (options.afterCreate) {
            await options.afterCreate(record, body);
        }

        return NextResponse.json({ success: true, data: record }, { status: 201 });
    } catch (error) {
        console.error(`[API] Error creating ${Model.name}:`, error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * Generic GET handler for single record
 */
export async function handleGet(Model, id, options = {}) {
    try {
        const record = await Model.findByPk(id, {
            include: options.include || []
        });

        if (!record) {
            return NextResponse.json(
                { success: false, error: 'Record not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: record });
    } catch (error) {
        console.error(`[API] Error fetching ${Model.name}:`, error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * Generic PUT/PATCH handler for updating records
 */
export async function handleUpdate(Model, id, request, options = {}) {
    try {
        const body = await request.json();

        const record = await Model.findByPk(id);
        if (!record) {
            return NextResponse.json(
                { success: false, error: 'Record not found' },
                { status: 404 }
            );
        }

        // Apply transformations if provided
        let updateData = body;
        if (options.transform) {
            updateData = { ...body, ...options.transform(body) };
        }

        await record.update(updateData);

        // Handle related records if provided
        if (options.afterUpdate) {
            await options.afterUpdate(record, body);
        }

        return NextResponse.json({ success: true, data: record });
    } catch (error) {
        console.error(`[API] Error updating ${Model.name}:`, error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * Generic DELETE handler
 */
export async function handleDelete(Model, id, options = {}) {
    try {
        const record = await Model.findByPk(id);
        if (!record) {
            return NextResponse.json(
                { success: false, error: 'Record not found' },
                { status: 404 }
            );
        }

        // Run before delete hook if provided
        if (options.beforeDelete) {
            await options.beforeDelete(record);
        }

        await record.destroy();

        return NextResponse.json({ success: true, message: 'Record deleted successfully' });
    } catch (error) {
        console.error(`[API] Error deleting ${Model.name}:`, error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * Generate sequence number for documents
 */
export async function generateSequenceNumber(Model, prefix, ten_id, stg_id) {
    const count = await Model.count({ where: { ten_id, stg_id } });
    const number = (count + 1).toString().padStart(5, '0');
    return `${prefix}-${number}`;
}

/**
 * Multi-tenant filter middleware
 */
export function withTenantFilter(handler) {
    return async (request, context) => {
        const { searchParams } = new URL(request.url);
        const ten_id = searchParams.get('ten_id') || request.headers.get('x-tenant-id') || '1000';
        const stg_id = searchParams.get('stg_id') || request.headers.get('x-stage-id') || 'DEV';

        // Attach tenant info to request
        request.tenantContext = { ten_id, stg_id };

        return handler(request, context);
    };
}
