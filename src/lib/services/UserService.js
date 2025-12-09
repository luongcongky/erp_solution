/**
 * User Service
 * Business logic layer for user management
 */

import { BaseService } from './BaseService.js';
import { getUserRepository } from '../repositories/UserRepository.js';
import { ValidationError, ConflictError, BusinessLogicError } from '@/lib/errors.js';
import { validateEmail, validateRequired, validatePassword } from '@/lib/validators.js';
import bcrypt from 'bcrypt';

export class UserService extends BaseService {
    constructor() {
        const userRepository = getUserRepository();
        super(userRepository);
        this.userRepository = userRepository;
    }

    /**
     * Get all users with roles
     */
    async getAllUsers(tenantContext, options = {}) {
        try {
            const { limit = 100, offset = 0 } = options;

            const [data, total] = await Promise.all([
                this.userRepository.findAllWithRoles({}, tenantContext, { limit, offset }),
                this.userRepository.count({}, tenantContext)
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
            this.log('error', 'Failed to get all users', error);
            throw error;
        }
    }

    /**
     * Get user by ID
     */
    async getUserById(id, tenantContext) {
        try {
            const user = await this.userRepository.findById(id, tenantContext);
            const roles = await this.userRepository.getUserRoles(id, tenantContext);

            return {
                ...user,
                roles
            };
        } catch (error) {
            this.log('error', `Failed to get user ${id}`, error);
            throw error;
        }
    }

    /**
     * Create new user
     */
    async createUser(userData, tenantContext) {
        try {
            const { email, firstName, lastName, password, roleIds = [], isActive = true } = userData;

            // Validation
            validateRequired(['email', 'firstName', 'password'], userData);
            validateEmail(email);
            validatePassword(password);

            // Check if email already exists
            const emailExists = await this.userRepository.emailExists(email, tenantContext);
            if (emailExists) {
                throw new ConflictError('Email already exists');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user data
            const newUserData = {
                email,
                firstName,
                lastName: lastName || '',
                password: hashedPassword,
                isActive
            };

            // Create user with roles
            const newUser = await this.userRepository.createWithRoles(
                newUserData,
                roleIds,
                tenantContext
            );

            this.log('info', `User created: ${newUser.email}`);

            // Return user without password
            const { password: _, ...userWithoutPassword } = newUser;
            return userWithoutPassword;
        } catch (error) {
            this.log('error', 'Failed to create user', error);
            throw error;
        }
    }

    /**
     * Update user
     */
    async updateUser(id, userData, tenantContext) {
        try {
            const { email, firstName, lastName, password, roleIds, isActive } = userData;

            // Check if user exists
            await this.userRepository.findById(id, tenantContext);

            // Validate email if provided
            if (email) {
                validateEmail(email);

                // Check if email already exists (excluding current user)
                const emailExists = await this.userRepository.emailExists(email, tenantContext, id);
                if (emailExists) {
                    throw new ConflictError('Email already exists');
                }
            }

            // Build update data
            const updateData = {};
            if (email !== undefined) updateData.email = email;
            if (firstName !== undefined) updateData.firstName = firstName;
            if (lastName !== undefined) updateData.lastName = lastName;
            if (isActive !== undefined) updateData.isActive = isActive;

            // Hash password if provided
            if (password) {
                validatePassword(password);
                updateData.password = await bcrypt.hash(password, 10);
            }

            // Update user
            const updatedUser = await this.userRepository.update(id, updateData, tenantContext);

            // Update roles if provided
            if (roleIds !== undefined) {
                await this.userRepository.assignRoles(id, roleIds, tenantContext);
            }

            this.log('info', `User updated: ${id}`);

            // Return user without password
            const { password: _, ...userWithoutPassword } = updatedUser;
            return userWithoutPassword;
        } catch (error) {
            this.log('error', `Failed to update user ${id}`, error);
            throw error;
        }
    }

    /**
     * Delete user
     */
    async deleteUser(id, tenantContext) {
        try {
            // Check if user exists
            await this.userRepository.findById(id, tenantContext);

            // Delete user (this will cascade delete user_roles due to FK)
            await this.userRepository.delete(id, tenantContext);

            this.log('info', `User deleted: ${id}`);
            return true;
        } catch (error) {
            this.log('error', `Failed to delete user ${id}`, error);
            throw error;
        }
    }

    /**
     * Assign roles to user
     */
    async assignRoles(userId, roleIds, tenantContext) {
        try {
            // Check if user exists
            await this.userRepository.findById(userId, tenantContext);

            // Validate roleIds
            if (!Array.isArray(roleIds)) {
                throw new ValidationError('roleIds must be an array');
            }

            // Assign roles
            await this.userRepository.assignRoles(userId, roleIds, tenantContext);

            this.log('info', `Roles assigned to user: ${userId}`);
            return true;
        } catch (error) {
            this.log('error', `Failed to assign roles to user ${userId}`, error);
            throw error;
        }
    }
}

// Export singleton instance
let userServiceInstance = null;

export function getUserService() {
    if (!userServiceInstance) {
        userServiceInstance = new UserService();
    }
    return userServiceInstance;
}

export default UserService;
