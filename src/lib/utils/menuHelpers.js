/**
 * Build hierarchical menu tree from flat array of menu items
 * @param {Array} menuItems - Flat array of menu items
 * @param {String|null} parentId - Parent ID to filter by (null for root items)
 * @returns {Array} Hierarchical menu tree
 */
export function buildMenuTree(menuItems, parentId = null) {
    return menuItems
        .filter(item => {
            // For root items, check if parentId is null or undefined
            if (parentId === null) {
                return !item.parentId;
            }
            // For child items, match parentId
            return item.parentId && item.parentId.toString() === parentId.toString();
        })
        .sort((a, b) => a.order - b.order)
        .map(item => ({
            ...item,
            children: buildMenuTree(menuItems, item.id),
        }));
}

/**
 * Flatten menu tree to array
 * @param {Array} menuTree - Hierarchical menu tree
 * @param {Array} result - Accumulator array
 * @returns {Array} Flat array of menu items
 */
export function flattenMenuTree(menuTree, result = []) {
    menuTree.forEach(item => {
        const { children, ...itemWithoutChildren } = item;
        result.push(itemWithoutChildren);
        if (children && children.length > 0) {
            flattenMenuTree(children, result);
        }
    });
    return result;
}

/**
 * Filter menu items based on user role
 * @param {Array} menuItems - Array of menu items
 * @param {String} userRole - User role (e.g., 'admin', 'user')
 * @returns {Array} Filtered menu items
 */
export function filterMenuByRole(menuItems, userRole) {
    // If no role provided, only show public menus (menus without role restrictions)
    if (!userRole) {
        return menuItems.filter(item => !item.roles || item.roles.length === 0);
    }

    // Handle multiple roles (comma-separated string like "Admin, User")
    const userRoles = userRole.split(',').map(r => r.trim().toLowerCase());

    return menuItems.filter(item => {
        // If roles array is empty or not defined, show to everyone
        if (!item.roles || item.roles.length === 0) {
            return true;
        }
        // Check if any user role matches any of the allowed roles (case-insensitive)
        const itemRoles = item.roles.map(r => r.toLowerCase());
        return userRoles.some(ur => itemRoles.includes(ur));
    });
}

/**
 * Find active menu item by pathname
 * @param {Array} menuTree - Hierarchical menu tree
 * @param {String} pathname - Current pathname
 * @returns {Object|null} Active menu item or null
 */
export function findActiveMenuItem(menuTree, pathname) {
    for (const item of menuTree) {
        // Check if current item matches
        if (item.href === pathname) {
            return item;
        }

        // Check children recursively
        if (item.children && item.children.length > 0) {
            const found = findActiveMenuItem(item.children, pathname);
            if (found) {
                return found;
            }
        }
    }
    return null;
}

/**
 * Find parent chain for a menu item
 * @param {Array} menuItems - Flat array of all menu items
 * @param {String} menuItemId - Menu item ID to find parents for
 * @returns {Array} Array of parent IDs from root to item
 */
export function findParentChain(menuItems, menuItemId) {
    const chain = [];
    let currentItem = menuItems.find(item => item.id.toString() === menuItemId.toString());

    while (currentItem && currentItem.parentId) {
        chain.unshift(currentItem.parentId.toString());
        currentItem = menuItems.find(item => item.id.toString() === currentItem.parentId.toString());
    }

    return chain;
}

/**
 * Check if a menu item or its children are active
 * @param {Object} menuItem - Menu item to check
 * @param {String} pathname - Current pathname
 * @returns {Boolean} True if item or any child is active
 */
export function isMenuItemOrChildActive(menuItem, pathname) {
    // Check if current item is active
    if (menuItem.href === pathname) {
        return true;
    }

    // Check if any child is active
    if (menuItem.children && menuItem.children.length > 0) {
        return menuItem.children.some(child => isMenuItemOrChildActive(child, pathname));
    }

    return false;
}

// Module color mapping for visual indicators
export const MODULE_COLORS = {
    'Core': '#667eea',
    'Sales': '#f093fb',
    'Finance': '#4facfe',
    'Inventory': '#667eea',
    'HR': '#fa709a',
    'Projects': '#feca57',
    'Settings': '#a29bfe',
};

export function getModuleColor(label) {
    return MODULE_COLORS[label] || '#999';
}
