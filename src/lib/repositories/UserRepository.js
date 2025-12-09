/**
 * User Repository
 * Data access layer for users table
 */

import { BaseRepository } from './BaseRepository.js';
import { users, userRoles, roles } from '@/db/schema/core';
import { eq, and, sql } from 'drizzle-orm';
import { ConflictError } from '@/lib/errors.js';

export class UserRepository extends BaseRepository {
    constructor() {
        super(users, 'User');
    }

    /**
     * Find user by email
     */
    async findByEmail(email, tenantContext) {
        try {
            const conditions = [
                eq(users.email, email),
                ...this.buildTenantFilter(tenantContext)
            ];

            const [user] = await this.db
                .select()
                .from(users)
                .where(and(...conditions))
                .limit(1);

            return user || null;
        } catch (error) {
            throw new DatabaseError('Failed to find user by email', error);
        }
    }

    /**
     * Get users with their roles aggregated
     */
    async findAllWithRoles(filters, tenantContext, options = {}) {
        try {
            const { limit = 100, offset = 0 } = options;
            const { ten_id, stg_id } = tenantContext;

            // Use raw SQL for complex aggregation
            const result = await this.db.execute(sql`
                SELECT 
                    u.id,
                    u.email,
                    u.first_name as "firstName",
                    u.last_name as "lastName",
                    u.is_active as "isActive",
                    u.created_at as "createdAt",
                    u.updated_at as "updatedAt",
                    CONCAT(u.first_name, ' ', u.last_name) as name,
                    COALESCE(
                        (SELECT STRING_AGG(r.name, ', ')
                         FROM "core"."user_roles" ur
                         JOIN "core"."roles" r ON ur.role_id = r.id
                         WHERE ur.user_id = u.id 
                           AND ur.ten_id = ${ten_id} 
                           AND ur.stg_id = ${stg_id}),
                        'No Role'
                    ) as role,
                    CASE 
                        WHEN u.is_active = true THEN 'active'
                        ELSE 'inactive'
                    END as status
                FROM "core"."users" u
                WHERE u.ten_id = ${ten_id} AND u.stg_id = ${stg_id}
                ORDER BY u.created_at DESC
                LIMIT ${limit} OFFSET ${offset}
            `);

            return result.rows;
        } catch (error) {
            throw new DatabaseError('Failed to fetch users with roles', error);
        }
    }

    /**
     * Check if email already exists
     */
    async emailExists(email, tenantContext, excludeUserId = null) {
        const conditions = [
            eq(users.email, email),
            ...this.buildTenantFilter(tenantContext)
        ];

        if (excludeUserId) {
            conditions.push(sql`${users.id} != ${excludeUserId}`);
        }

        const [existing] = await this.db
            .select({ id: users.id })
            .from(users)
            .where(and(...conditions))
            .limit(1);

        return !!existing;
    }

    /**
     * Get user roles
     */
    async getUserRoles(userId, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;

            const result = await this.db
                .select({
                    roleId: roles.id,
                    roleName: roles.name,
                    roleDescription: roles.description
                })
                .from(userRoles)
                .innerJoin(roles, eq(userRoles.roleId, roles.id))
                .where(
                    and(
                        eq(userRoles.userId, userId),
                        eq(userRoles.tenId, ten_id),
                        eq(userRoles.stgId, stg_id)
                    )
                );

            return result;
        } catch (error) {
            throw new DatabaseError('Failed to fetch user roles', error);
        }
    }

    /**
     * Assign roles to user
     */
    async assignRoles(userId, roleIds, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;

            // First, remove existing roles
            await this.db
                .delete(userRoles)
                .where(
                    and(
                        eq(userRoles.userId, userId),
                        eq(userRoles.tenId, ten_id),
                        eq(userRoles.stgId, stg_id)
                    )
                );

            // Then, insert new roles
            if (roleIds && roleIds.length > 0) {
                const roleAssignments = roleIds.map(roleId => ({
                    userId,
                    roleId,
                    tenId: ten_id,
                    stgId: stg_id,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }));

                await this.db.insert(userRoles).values(roleAssignments);
            }

            return true;
        } catch (error) {
            throw new DatabaseError('Failed to assign roles', error);
        }
    }

    /**
     * Create user with roles
     */
    async createWithRoles(userData, roleIds, tenantContext) {
        try {
            // Create user
            const newUser = await this.create(userData, tenantContext);

            // Assign roles if provided
            if (roleIds && roleIds.length > 0) {
                await this.assignRoles(newUser.id, roleIds, tenantContext);
            }

            return newUser;
        } catch (error) {
            throw new DatabaseError('Failed to create user with roles', error);
        }
    }
}

// Export singleton instance
let userRepositoryInstance = null;

export function getUserRepository() {
    if (!userRepositoryInstance) {
        userRepositoryInstance = new UserRepository();
    }
    return userRepositoryInstance;
}

export default UserRepository;
