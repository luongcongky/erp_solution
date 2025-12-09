/**
 * Tenant Context Utilities
 * Helper functions for extracting and validating tenant context
 */

/**
 * Extract tenant context from Next.js request
 * @param {Request} request - Next.js request object
 * @returns {Object} - { ten_id, stg_id }
 */
export function extractTenantContext(request) {
    const ten_id = request.headers.get('x-tenant-id') || '1000';
    const stg_id = request.headers.get('x-stage-id') || 'DEV';

    return { ten_id, stg_id };
}

/**
 * Extract pagination parameters from request
 * @param {Request} request - Next.js request object
 * @returns {Object} - { limit, offset, page }
 */
export function extractPagination(request) {
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    // If page is provided, calculate offset
    const actualOffset = searchParams.has('page')
        ? (page - 1) * limit
        : offset;

    return {
        limit: Math.min(limit, 1000), // Max 1000 records per request
        offset: Math.max(actualOffset, 0),
        page: Math.max(page, 1)
    };
}

/**
 * Extract filters from query parameters
 * @param {Request} request - Next.js request object
 * @param {Array<string>} allowedFilters - List of allowed filter fields
 * @returns {Object} - Filter object
 */
export function extractFilters(request, allowedFilters = []) {
    const { searchParams } = new URL(request.url);
    const filters = {};

    for (const field of allowedFilters) {
        const value = searchParams.get(field);
        if (value !== null && value !== '') {
            filters[field] = value;
        }
    }

    return filters;
}

/**
 * Extract sorting parameters from request
 * @param {Request} request - Next.js request object
 * @param {string} defaultSort - Default sort field
 * @returns {Array} - Array of sort objects
 */
export function extractSorting(request, defaultSort = 'createdAt') {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || defaultSort;
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    return [{ [sortBy]: sortOrder }];
}
