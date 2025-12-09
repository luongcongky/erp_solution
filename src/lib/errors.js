/**
 * Custom Error Classes for ERP System
 * Provides specific error types for better error handling and HTTP status mapping
 */

/**
 * Base Application Error
 */
export class ApplicationError extends Error {
    constructor(message, statusCode = 500, details = null) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            success: false,
            error: {
                name: this.name,
                message: this.message,
                statusCode: this.statusCode,
                details: this.details
            }
        };
    }
}

/**
 * Validation Error - 400 Bad Request
 * Used when input validation fails
 */
export class ValidationError extends ApplicationError {
    constructor(message, details = null) {
        super(message, 400, details);
    }
}

/**
 * Not Found Error - 404 Not Found
 * Used when a requested resource doesn't exist
 */
export class NotFoundError extends ApplicationError {
    constructor(resource = 'Resource', id = null) {
        const message = id
            ? `${resource} with id '${id}' not found`
            : `${resource} not found`;
        super(message, 404);
        this.resource = resource;
        this.resourceId = id;
    }
}

/**
 * Unauthorized Error - 401 Unauthorized
 * Used when authentication is required or fails
 */
export class UnauthorizedError extends ApplicationError {
    constructor(message = 'Unauthorized access') {
        super(message, 401);
    }
}

/**
 * Forbidden Error - 403 Forbidden
 * Used when user doesn't have permission
 */
export class ForbiddenError extends ApplicationError {
    constructor(message = 'Access forbidden') {
        super(message, 403);
    }
}

/**
 * Business Logic Error - 422 Unprocessable Entity
 * Used when business rules are violated
 */
export class BusinessLogicError extends ApplicationError {
    constructor(message, details = null) {
        super(message, 422, details);
    }
}

/**
 * Conflict Error - 409 Conflict
 * Used when there's a conflict (e.g., duplicate email)
 */
export class ConflictError extends ApplicationError {
    constructor(message, details = null) {
        super(message, 409, details);
    }
}

/**
 * Database Error - 500 Internal Server Error
 * Used when database operations fail
 */
export class DatabaseError extends ApplicationError {
    constructor(message, originalError = null) {
        super(message, 500, originalError?.message);
        this.originalError = originalError;
    }
}
