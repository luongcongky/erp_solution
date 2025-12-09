/**
 * Validation Utilities
 * Common validation functions for data validation
 */

import { ValidationError } from '@/lib/errors.js';

/**
 * Validate email format
 */
export function validateEmail(email) {
    if (!email) {
        throw new ValidationError('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ValidationError('Invalid email format');
    }

    return true;
}

/**
 * Validate required fields
 * @param {Array<string>} fields - Array of field names
 * @param {Object} data - Data object to validate
 */
export function validateRequired(fields, data) {
    const missing = [];

    for (const field of fields) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
            missing.push(field);
        }
    }

    if (missing.length > 0) {
        throw new ValidationError(
            `Missing required fields: ${missing.join(', ')}`,
            { missingFields: missing }
        );
    }

    return true;
}

/**
 * Validate string length
 */
export function validateLength(field, value, min = 0, max = Infinity) {
    if (!value) return true;

    const length = value.length;

    if (length < min) {
        throw new ValidationError(
            `${field} must be at least ${min} characters long`
        );
    }

    if (length > max) {
        throw new ValidationError(
            `${field} must not exceed ${max} characters`
        );
    }

    return true;
}

/**
 * Validate password strength
 */
export function validatePassword(password) {
    if (!password) {
        throw new ValidationError('Password is required');
    }

    if (password.length < 6) {
        throw new ValidationError('Password must be at least 6 characters long');
    }

    // Add more password rules as needed
    // const hasUpperCase = /[A-Z]/.test(password);
    // const hasLowerCase = /[a-z]/.test(password);
    // const hasNumbers = /\d/.test(password);
    // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return true;
}

/**
 * Validate number range
 */
export function validateRange(field, value, min = -Infinity, max = Infinity) {
    const num = Number(value);

    if (isNaN(num)) {
        throw new ValidationError(`${field} must be a valid number`);
    }

    if (num < min) {
        throw new ValidationError(`${field} must be at least ${min}`);
    }

    if (num > max) {
        throw new ValidationError(`${field} must not exceed ${max}`);
    }

    return true;
}

/**
 * Validate array
 */
export function validateArray(field, value, minLength = 0, maxLength = Infinity) {
    if (!Array.isArray(value)) {
        throw new ValidationError(`${field} must be an array`);
    }

    if (value.length < minLength) {
        throw new ValidationError(
            `${field} must contain at least ${minLength} items`
        );
    }

    if (value.length > maxLength) {
        throw new ValidationError(
            `${field} must not contain more than ${maxLength} items`
        );
    }

    return true;
}

/**
 * Validate enum value
 */
export function validateEnum(field, value, allowedValues) {
    if (!allowedValues.includes(value)) {
        throw new ValidationError(
            `${field} must be one of: ${allowedValues.join(', ')}`,
            { allowedValues }
        );
    }

    return true;
}

/**
 * Validate object schema
 * Simple schema validation
 */
export function validateSchema(data, schema) {
    const errors = {};

    for (const [field, rules] of Object.entries(schema)) {
        const value = data[field];

        try {
            // Required check
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors[field] = `${field} is required`;
                continue;
            }

            // Skip other validations if not required and empty
            if (!rules.required && !value) {
                continue;
            }

            // Type check
            if (rules.type) {
                const actualType = Array.isArray(value) ? 'array' : typeof value;
                if (actualType !== rules.type) {
                    errors[field] = `${field} must be of type ${rules.type}`;
                    continue;
                }
            }

            // Email validation
            if (rules.email) {
                validateEmail(value);
            }

            // Length validation
            if (rules.minLength !== undefined || rules.maxLength !== undefined) {
                validateLength(field, value, rules.minLength, rules.maxLength);
            }

            // Range validation
            if (rules.min !== undefined || rules.max !== undefined) {
                validateRange(field, value, rules.min, rules.max);
            }

            // Enum validation
            if (rules.enum) {
                validateEnum(field, value, rules.enum);
            }

            // Custom validator
            if (rules.validator && typeof rules.validator === 'function') {
                rules.validator(value, data);
            }
        } catch (error) {
            errors[field] = error.message;
        }
    }

    if (Object.keys(errors).length > 0) {
        throw new ValidationError('Validation failed', errors);
    }

    return true;
}
