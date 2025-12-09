/**
 * Menu Service
 * Business logic layer for menu management
 */

import { BaseService } from './BaseService.js';
import { getMenuRepository } from '../repositories/MenuRepository.js';
import { ValidationError, BusinessLogicError } from '@/lib/errors.js';
import { validateRequired } from '@/lib/validators.js';

export class MenuService extends BaseService {
    constructor() {
        const menuRepository = getMenuRepository();
        super(menuRepository);
        this.menuRepository = menuRepository;
    }

    /**
     * Get menu tree
     */
    async getMenuTree(tenantContext) {
        try {
            const menuTree = await this.menuRepository.getMenuTree(tenantContext);
            return menuTree;
        } catch (error) {
            this.log('error', 'Failed to get menu tree', error);
            throw error;
        }
    }

    /**
     * Get flat menu list
     */
    async getFlatMenuList(tenantContext, options = {}) {
        try {
            const { limit = 100, offset = 0 } = options;

            const [data, total] = await Promise.all([
                this.menuRepository.getFlatMenuList(tenantContext),
                this.menuRepository.count({}, tenantContext)
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
            this.log('error', 'Failed to get flat menu list', error);
            throw error;
        }
    }

    /**
     * Get menu by ID
     */
    async getMenuById(id, tenantContext) {
        try {
            return await this.menuRepository.findById(id, tenantContext);
        } catch (error) {
            this.log('error', `Failed to get menu ${id}`, error);
            throw error;
        }
    }

    /**
     * Create new menu item
     */
    async createMenuItem(menuData, tenantContext) {
        try {
            const { label, href, icon, parentId, level, roles, isActive = true } = menuData;

            // Validation
            validateRequired(['label', 'level'], menuData);

            // Get max order for the parent
            const maxOrder = await this.menuRepository.getMaxOrder(parentId, tenantContext);

            // Create menu item
            const newMenu = await this.menuRepository.create(
                {
                    label,
                    href: href || null,
                    icon: icon || null,
                    parentId: parentId || null,
                    level,
                    order: maxOrder + 1,
                    roles: roles || null,
                    isActive
                },
                tenantContext
            );

            this.log('info', `Menu item created: ${newMenu.label}`);
            return newMenu;
        } catch (error) {
            this.log('error', 'Failed to create menu item', error);
            throw error;
        }
    }

    /**
     * Update menu item
     */
    async updateMenuItem(id, menuData, tenantContext) {
        try {
            // Check if menu exists
            await this.menuRepository.findById(id, tenantContext);

            const { label, href, icon, parentId, level, roles, isActive, order } = menuData;

            // Build update data
            const updateData = {};
            if (label !== undefined) updateData.label = label;
            if (href !== undefined) updateData.href = href;
            if (icon !== undefined) updateData.icon = icon;
            if (parentId !== undefined) updateData.parentId = parentId;
            if (level !== undefined) updateData.level = level;
            if (roles !== undefined) updateData.roles = roles;
            if (isActive !== undefined) updateData.isActive = isActive;
            if (order !== undefined) updateData.order = order;

            // Update menu
            const updatedMenu = await this.menuRepository.update(id, updateData, tenantContext);

            this.log('info', `Menu item updated: ${id}`);
            return updatedMenu;
        } catch (error) {
            this.log('error', `Failed to update menu item ${id}`, error);
            throw error;
        }
    }

    /**
     * Delete menu item
     */
    async deleteMenuItem(id, tenantContext) {
        try {
            // Check if menu exists
            const menu = await this.menuRepository.findById(id, tenantContext);

            // Check if menu has children
            const children = await this.menuRepository.getByParentId(id, tenantContext);
            if (children.length > 0) {
                throw new BusinessLogicError(
                    `Cannot delete menu item with ${children.length} child items. Please delete children first.`
                );
            }

            // Delete menu
            await this.menuRepository.delete(id, tenantContext);

            this.log('info', `Menu item deleted: ${id}`);
            return true;
        } catch (error) {
            this.log('error', `Failed to delete menu item ${id}`, error);
            throw error;
        }
    }

    /**
     * Reorder menu items
     */
    async reorderMenuItems(reorderData, tenantContext) {
        try {
            // Validate reorder data
            if (!Array.isArray(reorderData)) {
                throw new ValidationError('Reorder data must be an array');
            }

            // Reorder menus
            await this.menuRepository.reorderMenus(reorderData, tenantContext);

            this.log('info', 'Menu items reordered');
            return true;
        } catch (error) {
            this.log('error', 'Failed to reorder menu items', error);
            throw error;
        }
    }
}

// Export singleton instance
let menuServiceInstance = null;

export function getMenuService() {
    if (!menuServiceInstance) {
        menuServiceInstance = new MenuService();
    }
    return menuServiceInstance;
}

export default MenuService;
