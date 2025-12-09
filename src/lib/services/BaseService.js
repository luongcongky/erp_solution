/**
 * Base Service Class
 * Provides common business logic operations for all services
 */

import { ValidationError, BusinessLogicError } from '@/lib/errors.js';

export class BaseService {
    /**
     * @param {BaseRepository} repository - Repository instance
     */
    constructor(repository) {
        this.repository = repository;
    }

    /**
     * Get all records with pagination
     */
    async getAll(tenantContext, options = {}) {
        const { limit = 100, offset = 0, filters = {}, orderBy = null } = options;

        const [data, total] = await Promise.all([
            this.repository.findAll(filters, tenantContext, { limit, offset, orderBy }),
            this.repository.count(filters, tenantContext)
        ]);

        return {
            data,
            pagination: {
                total,
                limit,
                offset,
                page: Math.floor(offset / limit) + 1,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get single record by ID
     */
    async getById(id, tenantContext) {
        return await this.repository.findById(id, tenantContext);
    }

    /**
     * Create new record
     * Override this method in child classes to add validation
     */
    async create(data, tenantContext) {
        // Child classes should override and add validation
        return await this.repository.create(data, tenantContext);
    }

    /**
     * Update record
     * Override this method in child classes to add validation
     */
    async update(id, data, tenantContext) {
        // Child classes should override and add validation
        return await this.repository.update(id, data, tenantContext);
    }

    /**
     * Delete record
     */
    async delete(id, tenantContext) {
        return await this.repository.delete(id, tenantContext);
    }

    /**
     * Validate data against schema
     */
    validate(data, schema) {
        // This can be extended with more sophisticated validation
        const errors = {};

        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];

            if (rules.required && (value === undefined || value === null || value === '')) {
                errors[field] = `${field} is required`;
            }

            if (rules.type && value !== undefined && value !== null) {
                const actualType = Array.isArray(value) ? 'array' : typeof value;
                if (actualType !== rules.type) {
                    errors[field] = `${field} must be of type ${rules.type}`;
                }
            }

            if (rules.minLength && value && value.length < rules.minLength) {
                errors[field] = `${field} must be at least ${rules.minLength} characters`;
            }

            if (rules.maxLength && value && value.length > rules.maxLength) {
                errors[field] = `${field} must not exceed ${rules.maxLength} characters`;
            }
        }

        if (Object.keys(errors).length > 0) {
            throw new ValidationError('Validation failed', errors);
        }

        return true;
    }

    /**
     * Log service activity
     */
    log(level, message, data = null) {
        const logMessage = `[${this.constructor.name}] ${message}`;

        switch (level) {
            case 'error':
                console.error(logMessage, data || '');
                break;
            case 'warn':
                console.warn(logMessage, data || '');
                break;
            case 'info':
            default:
                console.log(logMessage, data || '');
                break;
        }
    }

    /**
     * Execute operation within transaction
     * Note: Drizzle transactions need to be implemented at the service level
     */
    async withTransaction(callback) {
        // This is a placeholder - actual transaction implementation
        // would depend on your database setup
        try {
            return await callback();
        } catch (error) {
            this.log('error', 'Transaction failed', error);
            throw error;
        }
    }
}
