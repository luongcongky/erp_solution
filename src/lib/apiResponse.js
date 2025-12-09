/**
 * API Response Helpers
 * Standardized response format for all API endpoints
 */

import { NextResponse } from 'next/server';
import { ApplicationError } from '@/lib/errors.js';

/**
 * Success response
 * @param {*} data - Response data
 * @param {Object} meta - Optional metadata (pagination, etc.)
 * @param {number} status - HTTP status code (default: 200)
 */
export function success(data, meta = null, status = 200) {
    const response = {
        success: true,
        data
    };

    if (meta) {
        response.meta = meta;
    }

    return NextResponse.json(response, { status });
}

/**
 * Created response (for POST requests)
 * @param {*} data - Created resource data
 */
export function created(data) {
    return success(data, null, 201);
}

/**
 * No content response (for DELETE requests)
 */
export function noContent() {
    return new NextResponse(null, { status: 204 });
}

/**
 * Paginated response
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination info
 */
export function paginated(data, pagination) {
    const { total, limit, offset, page, totalPages } = pagination;

    return success(data, {
        pagination: {
            total,
            limit,
            offset,
            page: page || Math.floor(offset / limit) + 1,
            totalPages: totalPages || Math.ceil(total / limit),
            hasMore: offset + limit < total,
            hasPrevious: offset > 0
        }
    });
}

/**
 * Error response
 * @param {Error} error - Error object
 */
export function error(error) {
    // Handle custom application errors
    if (error instanceof ApplicationError) {
        return NextResponse.json(error.toJSON(), {
            status: error.statusCode
        });
    }

    // Handle generic errors
    console.error('[API Error]', error);

    return NextResponse.json({
        success: false,
        error: {
            name: 'InternalServerError',
            message: process.env.NODE_ENV === 'production'
                ? 'An unexpected error occurred'
                : error.message,
            ...(process.env.NODE_ENV !== 'production' && {
                stack: error.stack
            })
        }
    }, { status: 500 });
}

/**
 * Validation error response
 * @param {Object} errors - Validation errors object
 */
export function validationError(errors) {
    return NextResponse.json({
        success: false,
        error: {
            name: 'ValidationError',
            message: 'Validation failed',
            details: errors
        }
    }, { status: 400 });
}

/**
 * Not found response
 * @param {string} resource - Resource name
 */
export function notFound(resource = 'Resource') {
    return NextResponse.json({
        success: false,
        error: {
            name: 'NotFoundError',
            message: `${resource} not found`
        }
    }, { status: 404 });
}

/**
 * Unauthorized response
 */
export function unauthorized(message = 'Unauthorized access') {
    return NextResponse.json({
        success: false,
        error: {
            name: 'UnauthorizedError',
            message
        }
    }, { status: 401 });
}

/**
 * Forbidden response
 */
export function forbidden(message = 'Access forbidden') {
    return NextResponse.json({
        success: false,
        error: {
            name: 'ForbiddenError',
            message
        }
    }, { status: 403 });
}
