import Menu from '../../models/sequelize/Menu.js';
import { Op } from 'sequelize';

export class MenuRepository {
    async findByTenantAndStage(tenantId, stageId) {
        try {
            return await Menu.findAll({
                where: {
                    ten_id: tenantId,
                    stg_id: stageId,
                    isActive: true
                },
                order: [
                    ['level', 'ASC'],
                    ['order', 'ASC']
                ]
            });
        } catch (error) {
            console.error('Error finding menus:', error);
            throw error;
        }
    }

    async buildMenuTree(tenantId, stageId, role) {
        try {
            const menus = await Menu.findAll({
                where: {
                    ten_id: tenantId,
                    stg_id: stageId,
                    isActive: true,
                    roles: {
                        [Op.contains]: [role]
                    }
                },
                order: [
                    ['level', 'ASC'],
                    ['order', 'ASC']
                ]
            });

            return this._buildTree(menus);
        } catch (error) {
            console.error('Error building menu tree:', error);
            throw error;
        }
    }

    _buildTree(menus) {
        const map = {};
        const tree = [];
        const menuList = menus.map(m => m.toJSON());

        // First pass: Initialize map
        menuList.forEach(menu => {
            map[menu.id] = { ...menu, children: [] };
        });

        // Second pass: Build tree
        menuList.forEach(menu => {
            if (menu.parentId && map[menu.parentId]) {
                map[menu.parentId].children.push(map[menu.id]);
            } else {
                tree.push(map[menu.id]);
            }
        });

        return tree;
    }
}

export default MenuRepository;
