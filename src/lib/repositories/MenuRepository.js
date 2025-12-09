/**
 * Menu Repository
 * Data access layer for menus table
 */

import { BaseRepository } from './BaseRepository.js';
import { menus } from '@/db/schema/core';
import { eq, and, sql, isNull } from 'drizzle-orm';
import { DatabaseError } from '@/lib/errors.js';

export class MenuRepository extends BaseRepository {
    constructor() {
        super(menus, 'Menu');
    }

    /**
     * Get menu tree (hierarchical structure)
     */
    async getMenuTree(tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;

            // Get all menus ordered by level and order
            const allMenus = await this.db
                .select()
                .from(menus)
                .where(
                    and(
                        eq(menus.tenId, ten_id),
                        eq(menus.stgId, stg_id),
                        eq(menus.isActive, true)
                    )
                )
                .orderBy(menus.level, menus.order);

            // Build tree structure
            const menuMap = new Map();
            const rootMenus = [];

            // First pass: create map
            allMenus.forEach(menu => {
                menuMap.set(menu.id, { ...menu, children: [] });
            });

            // Second pass: build tree
            allMenus.forEach(menu => {
                const menuNode = menuMap.get(menu.id);
                if (menu.parentId) {
                    const parent = menuMap.get(menu.parentId);
                    if (parent) {
                        parent.children.push(menuNode);
                    }
                } else {
                    rootMenus.push(menuNode);
                }
            });

            return rootMenus;
        } catch (error) {
            throw new DatabaseError('Failed to fetch menu tree', error);
        }
    }

    /**
     * Get flat menu list
     */
    async getFlatMenuList(tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;

            const menuList = await this.db
                .select()
                .from(menus)
                .where(
                    and(
                        eq(menus.tenId, ten_id),
                        eq(menus.stgId, stg_id)
                    )
                )
                .orderBy(menus.level, menus.order);

            return menuList;
        } catch (error) {
            throw new DatabaseError('Failed to fetch menu list', error);
        }
    }

    /**
     * Get menus by parent ID
     */
    async getByParentId(parentId, tenantContext) {
        try {
            const conditions = [
                ...this.buildTenantFilter(tenantContext)
            ];

            if (parentId) {
                conditions.push(eq(menus.parentId, parentId));
            } else {
                conditions.push(isNull(menus.parentId));
            }

            const menuList = await this.db
                .select()
                .from(menus)
                .where(and(...conditions))
                .orderBy(menus.order);

            return menuList;
        } catch (error) {
            throw new DatabaseError('Failed to fetch menus by parent', error);
        }
    }

    /**
     * Update menu order
     */
    async updateOrder(menuId, newOrder, tenantContext) {
        try {
            const conditions = [
                eq(menus.id, menuId),
                ...this.buildTenantFilter(tenantContext)
            ];

            const [updated] = await this.db
                .update(menus)
                .set({
                    order: newOrder,
                    updatedAt: new Date()
                })
                .where(and(...conditions))
                .returning();

            return updated;
        } catch (error) {
            throw new DatabaseError('Failed to update menu order', error);
        }
    }

    /**
     * Reorder multiple menus
     */
    async reorderMenus(reorderData, tenantContext) {
        try {
            // reorderData is array of { id, order }
            const updates = reorderData.map(async ({ id, order }) => {
                return this.updateOrder(id, order, tenantContext);
            });

            await Promise.all(updates);
            return true;
        } catch (error) {
            throw new DatabaseError('Failed to reorder menus', error);
        }
    }

    /**
     * Get max order for a parent
     */
    async getMaxOrder(parentId, tenantContext) {
        try {
            const conditions = [
                ...this.buildTenantFilter(tenantContext)
            ];

            if (parentId) {
                conditions.push(eq(menus.parentId, parentId));
            } else {
                conditions.push(isNull(menus.parentId));
            }

            const [result] = await this.db
                .select({ maxOrder: sql`COALESCE(MAX(${menus.order}), 0)` })
                .from(menus)
                .where(and(...conditions));

            return Number(result?.maxOrder || 0);
        } catch (error) {
            throw new DatabaseError('Failed to get max order', error);
        }
    }
}

// Export singleton instance
let menuRepositoryInstance = null;

export function getMenuRepository() {
    if (!menuRepositoryInstance) {
        menuRepositoryInstance = new MenuRepository();
    }
    return menuRepositoryInstance;
}

export default MenuRepository;
