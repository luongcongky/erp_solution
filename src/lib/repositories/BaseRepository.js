/**
 * Base Repository Class
 * Provides common data access operations for all repositories
 * Uses Drizzle ORM for database operations
 */

import { db } from '@/db';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { DatabaseError, NotFoundError } from '@/lib/errors.js';

export class BaseRepository {
    /**
     * @param {Object} table - Drizzle table schema
     * @param {string} tableName - Human-readable table name for error messages
     */
    constructor(table, tableName = 'Record') {
        this.table = table;
        this.tableName = tableName;
        this.db = db;
    }

    /**
     * Build tenant filter conditions
     * @param {Object} tenantContext - { ten_id, stg_id }
     */
    buildTenantFilter(tenantContext) {
        const { ten_id, stg_id } = tenantContext;
        const conditions = [];

        if (this.table.tenId) {
            conditions.push(eq(this.table.tenId, ten_id));
        }

        if (this.table.stgId) {
            conditions.push(eq(this.table.stgId, stg_id));
        }

        return conditions;
    }

    /**
     * Find all records with filters
     * @param {Object} filters - Additional filters
     * @param {Object} tenantContext - Tenant context
     * @param {Object} options - Query options (limit, offset, orderBy)
     */
    async findAll(filters = {}, tenantContext, options = {}) {
        try {
            const { limit = 100, offset = 0, orderBy = null } = options;

            // Build WHERE conditions
            const conditions = [...this.buildTenantFilter(tenantContext)];

            // Add custom filters
            for (const [key, value] of Object.entries(filters)) {
                if (this.table[key] && value !== undefined && value !== null) {
                    conditions.push(eq(this.table[key], value));
                }
            }

            // Build query
            let query = this.db
                .select()
                .from(this.table);

            if (conditions.length > 0) {
                query = query.where(and(...conditions));
            }

            // Add ordering
            if (orderBy) {
                const orderClauses = Array.isArray(orderBy) ? orderBy : [orderBy];
                const orderFns = orderClauses.map(order => {
                    if (typeof order === 'string') {
                        return desc(this.table[order]);
                    }
                    const [field, direction] = Object.entries(order)[0];
                    return direction === 'asc'
                        ? asc(this.table[field])
                        : desc(this.table[field]);
                });
                query = query.orderBy(...orderFns);
            } else if (this.table.createdAt) {
                query = query.orderBy(desc(this.table.createdAt));
            }

            // Add pagination
            query = query.limit(limit).offset(offset);

            const results = await query;
            return results;
        } catch (error) {
            throw new DatabaseError(
                `Failed to fetch ${this.tableName} records`,
                error
            );
        }
    }

    /**
     * Count records with filters
     */
    async count(filters = {}, tenantContext) {
        try {
            const conditions = [...this.buildTenantFilter(tenantContext)];

            for (const [key, value] of Object.entries(filters)) {
                if (this.table[key] && value !== undefined && value !== null) {
                    conditions.push(eq(this.table[key], value));
                }
            }

            let query = this.db
                .select({ count: sql`count(*)` })
                .from(this.table);

            if (conditions.length > 0) {
                query = query.where(and(...conditions));
            }

            const [result] = await query;
            return Number(result?.count || 0);
        } catch (error) {
            throw new DatabaseError(
                `Failed to count ${this.tableName} records`,
                error
            );
        }
    }

    /**
     * Find record by ID
     */
    async findById(id, tenantContext) {
        try {
            const conditions = [
                eq(this.table.id, id),
                ...this.buildTenantFilter(tenantContext)
            ];

            const [record] = await this.db
                .select()
                .from(this.table)
                .where(and(...conditions))
                .limit(1);

            if (!record) {
                throw new NotFoundError(this.tableName, id);
            }

            return record;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new DatabaseError(
                `Failed to fetch ${this.tableName} by ID`,
                error
            );
        }
    }

    /**
     * Find one record by filters
     */
    async findOne(filters, tenantContext) {
        try {
            const conditions = [...this.buildTenantFilter(tenantContext)];

            for (const [key, value] of Object.entries(filters)) {
                if (this.table[key] && value !== undefined && value !== null) {
                    conditions.push(eq(this.table[key], value));
                }
            }

            const [record] = await this.db
                .select()
                .from(this.table)
                .where(and(...conditions))
                .limit(1);

            return record || null;
        } catch (error) {
            throw new DatabaseError(
                `Failed to fetch ${this.tableName}`,
                error
            );
        }
    }

    /**
     * Create new record
     */
    async create(data, tenantContext) {
        try {
            const recordData = {
                ...data,
                ...(this.table.tenId && { tenId: tenantContext.ten_id }),
                ...(this.table.stgId && { stgId: tenantContext.stg_id }),
                ...(this.table.createdAt && { createdAt: new Date() }),
                ...(this.table.updatedAt && { updatedAt: new Date() })
            };

            const [newRecord] = await this.db
                .insert(this.table)
                .values(recordData)
                .returning();

            return newRecord;
        } catch (error) {
            throw new DatabaseError(
                `Failed to create ${this.tableName}`,
                error
            );
        }
    }

    /**
     * Update record by ID
     */
    async update(id, data, tenantContext) {
        try {
            // First check if record exists
            await this.findById(id, tenantContext);

            const updateData = {
                ...data,
                ...(this.table.updatedAt && { updatedAt: new Date() })
            };

            const conditions = [
                eq(this.table.id, id),
                ...this.buildTenantFilter(tenantContext)
            ];

            const [updatedRecord] = await this.db
                .update(this.table)
                .set(updateData)
                .where(and(...conditions))
                .returning();

            return updatedRecord;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new DatabaseError(
                `Failed to update ${this.tableName}`,
                error
            );
        }
    }

    /**
     * Delete record by ID
     */
    async delete(id, tenantContext) {
        try {
            // First check if record exists
            await this.findById(id, tenantContext);

            const conditions = [
                eq(this.table.id, id),
                ...this.buildTenantFilter(tenantContext)
            ];

            await this.db
                .delete(this.table)
                .where(and(...conditions));

            return true;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw new DatabaseError(
                `Failed to delete ${this.tableName}`,
                error
            );
        }
    }

    /**
     * Execute raw SQL query
     */
    async executeRaw(query, params = []) {
        try {
            return await this.db.execute(query);
        } catch (error) {
            throw new DatabaseError('Failed to execute query', error);
        }
    }
}
