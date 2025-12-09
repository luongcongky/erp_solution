/**
 * Role Service
 * Business logic layer for role management
 */

import { BaseService } from './BaseService.js';
import { getRoleRepository } from '../repositories/RoleRepository.js';
import { ValidationError, ConflictError, BusinessLogicError } from '@/lib/errors.js';
import { validateRequired } from '@/lib/validators.js';

export class RoleService extends BaseService {
    constructor() {
        const roleRepository = getRoleRepository();
        super(roleRepository);
        this.roleRepository = roleRepository;
    }

    /**
     * Get all roles with user counts
     */
    async getAllRoles(tenantContext, options = {}) {
        try {
            const { limit = 100, offset = 0 } = options;

            const [data, total] = await Promise.all([
                this.roleRepository.findAllWithUserCount(tenantContext, { limit, offset }),
                this.roleRepository.count({}, tenantContext)
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
        } catch (error) {
            this.log('error', 'Failed to get all roles', error);
            throw error;
        }
    }

    /**
     * Get role by ID
     */
    async getRoleById(id, tenantContext) {
        try {
            const role = await this.roleRepository.findById(id, tenantContext);
            const usersCount = await this.roleRepository.getUsersCount(id, tenantContext);

            return {
                ...role,
                usersCount
            };
        } catch (error) {
            this.log('error', `Failed to get role ${id}`, error);
            throw error;
        }
    }

    /**
     * Create new role
     */
    async createRole(roleData, tenantContext) {
        try {
            const { name, description } = roleData;

            // Validation
            validateRequired(['name'], roleData);

            // Check if role name already exists
            const nameExists = await this.roleRepository.nameExists(name, tenantContext);
            if (nameExists) {
                throw new ConflictError('Role name already exists');
            }

            // Create role
            const newRole = await this.roleRepository.create(
                { name, description },
                tenantContext
            );

            this.log('info', `Role created: ${newRole.name}`);
            return newRole;
        } catch (error) {
            this.log('error', 'Failed to create role', error);
            throw error;
        }
    }

    /**
     * Update role
     */
    async updateRole(id, roleData, tenantContext) {
        try {
            const { name, description } = roleData;

            // Check if role exists
            await this.roleRepository.findById(id, tenantContext);

            // Validate name if provided
            if (name) {
                // Check if name already exists (excluding current role)
                const nameExists = await this.roleRepository.nameExists(name, tenantContext, id);
                if (nameExists) {
                    throw new ConflictError('Role name already exists');
                }
            }

            // Build update data
            const updateData = {};
            if (name !== undefined) updateData.name = name;
            if (description !== undefined) updateData.description = description;

            // Update role
            const updatedRole = await this.roleRepository.update(id, updateData, tenantContext);

            this.log('info', `Role updated: ${id}`);
            return updatedRole;
        } catch (error) {
            this.log('error', `Failed to update role ${id}`, error);
            throw error;
        }
    }

    /**
     * Delete role
     */
    async deleteRole(id, tenantContext) {
        try {
            // Check if role exists
            await this.roleRepository.findById(id, tenantContext);

            // Check if role has users
            const usersCount = await this.roleRepository.getUsersCount(id, tenantContext);
            if (usersCount > 0) {
                throw new BusinessLogicError(
                    `Cannot delete role with ${usersCount} assigned users. Please reassign users first.`
                );
            }

            // Delete role
            await this.roleRepository.delete(id, tenantContext);

            this.log('info', `Role deleted: ${id}`);
            return true;
        } catch (error) {
            this.log('error', `Failed to delete role ${id}`, error);
            throw error;
        }
    }
}

// Export singleton instance
let roleServiceInstance = null;

export function getRoleService() {
    if (!roleServiceInstance) {
        roleServiceInstance = new RoleService();
    }
    return roleServiceInstance;
}

export default RoleService;
