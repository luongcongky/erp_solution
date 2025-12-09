/**
 * Role Repository
 * Data access layer for roles table
 */

import { BaseRepository } from './BaseRepository.js';
import { roles, userRoles } from '@/db/schema/core';
import { eq, and, sql } from 'drizzle-orm';
import { DatabaseError } from '@/lib/errors.js';

export class RoleRepository extends BaseRepository {
    constructor() {
        super(roles, 'Role');
    }

    /**
     * Find role by name
     */
    async findByName(name, tenantContext) {
        try {
            const conditions = [
                eq(roles.name, name),
                ...this.buildTenantFilter(tenantContext)
            ];

            const [role] = await this.db
                .select()
                .from(roles)
                .where(and(...conditions))
                .limit(1);

            return role || null;
        } catch (error) {
            throw new DatabaseError('Failed to find role by name', error);
        }
    }

    /**
     * Get all roles with user count
     */
    async findAllWithUserCount(tenantContext, options = {}) {
        try {
            const { limit = 100, offset = 0 } = options;

            // First get all roles
            const rolesList = await this.findAll({}, tenantContext, { limit, offset });

            // Then get user count for each role
            const rolesWithCount = await Promise.all(
                rolesList.map(async (role) => {
                    const [countResult] = await this.db
                        .select({ count: sql`count(*)` })
                        .from(userRoles)
                        .where(
                            and(
                                eq(userRoles.roleId, role.id),
                                eq(userRoles.tenId, tenantContext.ten_id),
                                eq(userRoles.stgId, tenantContext.stg_id)
                            )
                        );

                    return {
                        ...role,
                        usersCount: Number(countResult?.count || 0)
                    };
                })
            );

            return rolesWithCount;
        } catch (error) {
            throw new DatabaseError('Failed to fetch roles with user count', error);
        }
    }

    /**
     * Check if role name already exists
     */
    async nameExists(name, tenantContext, excludeRoleId = null) {
        const conditions = [
            eq(roles.name, name),
            ...this.buildTenantFilter(tenantContext)
        ];

        if (excludeRoleId) {
            conditions.push(sql`${roles.id} != ${excludeRoleId}`);
        }

        const [existing] = await this.db
            .select({ id: roles.id })
            .from(roles)
            .where(and(...conditions))
            .limit(1);

        return !!existing;
    }

    /**
     * Get users count for a role
     */
    async getUsersCount(roleId, tenantContext) {
        try {
            const [result] = await this.db
                .select({ count: sql`count(*)` })
                .from(userRoles)
                .where(
                    and(
                        eq(userRoles.roleId, roleId),
                        eq(userRoles.tenId, tenantContext.ten_id),
                        eq(userRoles.stgId, tenantContext.stg_id)
                    )
                );

            return Number(result?.count || 0);
        } catch (error) {
            throw new DatabaseError('Failed to get users count for role', error);
        }
    }
}

// Export singleton instance
let roleRepositoryInstance = null;

export function getRoleRepository() {
    if (!roleRepositoryInstance) {
        roleRepositoryInstance = new RoleRepository();
    }
    return roleRepositoryInstance;
}

export default RoleRepository;
