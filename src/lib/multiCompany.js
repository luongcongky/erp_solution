import models, { initializeDatabase } from '@/models/sequelize/index.js';

const { Company } = models;

/**
 * Extract company domain from email address
 * @param {string} email - User email address
 * @returns {string} - Domain part of email
 */
export function getEmailDomain(email) {
    if (!email || typeof email !== 'string') {
        throw new Error('Invalid email address');
    }
    const parts = email.toLowerCase().trim().split('@');
    if (parts.length !== 2) {
        throw new Error('Invalid email format');
    }
    return parts[1];
}

/**
 * Get company by email domain
 * @param {string} email - User email address
 * @returns {Promise<Object>} - Company object with ten_id and stg_id
 */
export async function getCompanyByEmail(email) {
    try {
        const domain = getEmailDomain(email);

        // Initialize database before querying
        await initializeDatabase();

        // Find company by domain using Sequelize
        const company = await Company.findOne({
            where: {
                domain: domain,
                isActive: true
            }
        });

        if (!company) {
            // Return default company if no specific company found
            return {
                ten_id: '1000',
                stg_id: 'DEV',
                name: 'Default Company',
                domain: domain
            };
        }

        return {
            ten_id: company.ten_id,
            stg_id: company.stg_id,
            name: company.name,
            domain: company.domain
        };
    } catch (error) {
        console.error('[multiCompany] Error in getCompanyByEmail:', error);
        // Return default company on error to allow login to proceed
        return {
            ten_id: '1000',
            stg_id: 'DEV',
            name: 'Default Company',
            domain: getEmailDomain(email)
        };
    }
}

/**
 * Add company filter to query object
 * @param {Object} query - Mongoose query object
 * @param {string} ten_id - Tenant ID
 * @param {string} stg_id - Stage ID
 * @returns {Object} - Query with company filters added
 */
export function addCompanyFilter(query, ten_id, stg_id = 'DEV') {
    return {
        ...query,
        ten_id,
        stg_id
    };
}

/**
 * Validate user has access to specified company
 * @param {Object} user - User object
 * @param {string} ten_id - Tenant ID to validate
 * @param {string} stg_id - Stage ID to validate
 * @returns {boolean} - True if user has access
 */
export function validateCompanyAccess(user, ten_id, stg_id = 'DEV') {
    if (!user || !user.ten_id || !user.stg_id) {
        return false;
    }
    return user.ten_id === ten_id && user.stg_id === stg_id;
}

/**
 * Get current stage from environment or default to DEV
 * @returns {string} - Current stage ID
 */
export function getCurrentStage() {
    return process.env.STAGE_ID || 'DEV';
}

/**
 * Create company context object
 * @param {string} ten_id - Tenant ID
 * @param {string} stg_id - Stage ID
 * @returns {Object} - Company context
 */
export function createCompanyContext(ten_id, stg_id = 'DEV') {
    return {
        ten_id,
        stg_id
    };
}
