/**
 * Seed comprehensive menu tree for all ERP modules
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { sequelize } from '../src/models/sequelize/index.js';
import models from '../src/models/sequelize/index.js';

const { Menu } = models;

async function seedMenus() {
    try {
        console.log('[Seed] Creating comprehensive menu tree...\n');

        const ten_id = '1000';
        const stg_id = 'DEV';

        // Clear existing menus
        await Menu.destroy({ where: { ten_id, stg_id } });
        console.log('  ✓ Cleared existing menus');

        const menus = [];

        // Level 1: Main Modules
        const dashboard = await Menu.create({
            label: 'Dashboard',
            href: '/dashboard',
            icon: '📊',
            parentId: null,
            level: 1,
            order: 1,
            isActive: true,
            roles: ['admin', 'user'],
            ten_id,
            stg_id,
        });
        menus.push(dashboard);

        const core = await Menu.create({
            label: 'Core',
            href: null,
            icon: '⚙️',
            parentId: null,
            level: 1,
            order: 2,
            isActive: true,
            roles: ['admin'],
            ten_id,
            stg_id,
        });
        menus.push(core);

        const sales = await Menu.create({
            label: 'Sales & CRM',
            href: null,
            icon: '💼',
            parentId: null,
            level: 1,
            order: 3,
            isActive: true,
            roles: ['admin', 'sales', 'user'],
            ten_id,
            stg_id,
        });
        menus.push(sales);

        const purchase = await Menu.create({
            label: 'Purchase',
            href: null,
            icon: '🛒',
            parentId: null,
            level: 1,
            order: 4,
            isActive: true,
            roles: ['admin', 'purchase', 'user'],
            ten_id,
            stg_id,
        });
        menus.push(purchase);

        const inventory = await Menu.create({
            label: 'Inventory',
            href: null,
            icon: '📦',
            parentId: null,
            level: 1,
            order: 5,
            isActive: true,
            roles: ['admin', 'inventory', 'user'],
            ten_id,
            stg_id,
        });
        menus.push(inventory);

        const manufacturing = await Menu.create({
            label: 'Manufacturing',
            href: null,
            icon: '🏭',
            parentId: null,
            level: 1,
            order: 6,
            isActive: true,
            roles: ['admin', 'manufacturing'],
            ten_id,
            stg_id,
        });
        menus.push(manufacturing);

        const finance = await Menu.create({
            label: 'Finance',
            href: null,
            icon: '💰',
            parentId: null,
            level: 1,
            order: 7,
            isActive: true,
            roles: ['admin', 'finance'],
            ten_id,
            stg_id,
        });
        menus.push(finance);

        const hr = await Menu.create({
            label: 'HR',
            href: null,
            icon: '👔',
            parentId: null,
            level: 1,
            order: 8,
            isActive: true,
            roles: ['admin', 'hr'],
            ten_id,
            stg_id,
        });
        menus.push(hr);

        const service = await Menu.create({
            label: 'Service',
            href: null,
            icon: '🎫',
            parentId: null,
            level: 1,
            order: 9,
            isActive: true,
            roles: ['admin', 'service', 'user'],
            ten_id,
            stg_id,
        });
        menus.push(service);

        const projects = await Menu.create({
            label: 'Projects',
            href: '/projects',
            icon: '📋',
            parentId: null,
            level: 1,
            order: 10,
            isActive: true,
            roles: ['admin', 'project', 'user'],
            ten_id,
            stg_id,
        });
        menus.push(projects);

        const ecommerce = await Menu.create({
            label: 'E-commerce',
            href: null,
            icon: '🛍️',
            parentId: null,
            level: 1,
            order: 11,
            isActive: true,
            roles: ['admin', 'sales'],
            ten_id,
            stg_id,
        });
        menus.push(ecommerce);

        console.log(`  ✓ Created ${menus.length} level 1 menus`);

        // Level 2: Core sub-menus
        const coreMenus = await Menu.bulkCreate([
            { label: 'Users', href: '/core/users', icon: '👥', parentId: core.id, level: 2, order: 1, isActive: true, roles: ['admin'], ten_id, stg_id },
            { label: 'Roles', href: '/core/roles', icon: '🔐', parentId: core.id, level: 2, order: 2, isActive: true, roles: ['admin'], ten_id, stg_id },
            { label: 'Audit Logs', href: '/core/audit', icon: '📝', parentId: core.id, level: 2, order: 3, isActive: true, roles: ['admin'], ten_id, stg_id },
            { label: 'Menus', href: '/core/menus', icon: '📋', parentId: core.id, level: 2, order: 4, isActive: true, roles: ['admin'], ten_id, stg_id },
            { label: 'Languages', href: '/core/languages', icon: '🌐', parentId: core.id, level: 2, order: 5, isActive: true, roles: ['admin'], ten_id, stg_id },
        ]);
        console.log(`  ✓ Created ${coreMenus.length} Core sub-menus`);

        // Level 2: Sales sub-menus
        const salesMenus = await Menu.bulkCreate([
            { label: 'Leads', href: '/sales/leads', icon: '🎯', parentId: sales.id, level: 2, order: 1, isActive: true, roles: ['admin', 'sales', 'user'], ten_id, stg_id },
            { label: 'Opportunities', href: '/sales/opportunities', icon: '💡', parentId: sales.id, level: 2, order: 2, isActive: true, roles: ['admin', 'sales', 'user'], ten_id, stg_id },
            { label: 'Quotations', href: '/sales/quotations', icon: '📄', parentId: sales.id, level: 2, order: 3, isActive: true, roles: ['admin', 'sales', 'user'], ten_id, stg_id },
            { label: 'Sales Orders', href: '/sales/orders', icon: '📋', parentId: sales.id, level: 2, order: 4, isActive: true, roles: ['admin', 'sales', 'user'], ten_id, stg_id },
            { label: 'Customers', href: '/sales/customers', icon: '🤝', parentId: sales.id, level: 2, order: 5, isActive: true, roles: ['admin', 'sales', 'user'], ten_id, stg_id },
        ]);
        console.log(`  ✓ Created ${salesMenus.length} Sales sub-menus`);

        // Level 2: Purchase sub-menus
        const purchaseMenus = await Menu.bulkCreate([
            { label: 'Purchase Requests', href: '/purchase/requests', icon: '📝', parentId: purchase.id, level: 2, order: 1, isActive: true, roles: ['admin', 'purchase', 'user'], ten_id, stg_id },
            { label: 'RFQ', href: '/purchase/rfq', icon: '💬', parentId: purchase.id, level: 2, order: 2, isActive: true, roles: ['admin', 'purchase'], ten_id, stg_id },
            { label: 'Purchase Orders', href: '/purchase/orders', icon: '📋', parentId: purchase.id, level: 2, order: 3, isActive: true, roles: ['admin', 'purchase', 'user'], ten_id, stg_id },
            { label: 'Suppliers', href: '/purchase/suppliers', icon: '🏢', parentId: purchase.id, level: 2, order: 4, isActive: true, roles: ['admin', 'purchase'], ten_id, stg_id },
        ]);
        console.log(`  ✓ Created ${purchaseMenus.length} Purchase sub-menus`);

        // Level 2: Inventory sub-menus
        const inventoryMenus = await Menu.bulkCreate([
            { label: 'Products', href: '/inventory/products', icon: '📦', parentId: inventory.id, level: 2, order: 1, isActive: true, roles: ['admin', 'inventory', 'user'], ten_id, stg_id },
            { label: 'Warehouses', href: '/inventory/warehouses', icon: '🏪', parentId: inventory.id, level: 2, order: 2, isActive: true, roles: ['admin', 'inventory'], ten_id, stg_id },
            { label: 'Stock Movements', href: '/inventory/stock', icon: '📊', parentId: inventory.id, level: 2, order: 3, isActive: true, roles: ['admin', 'inventory', 'user'], ten_id, stg_id },
            { label: 'Adjustments', href: '/inventory/adjustments', icon: '⚖️', parentId: inventory.id, level: 2, order: 4, isActive: true, roles: ['admin', 'inventory'], ten_id, stg_id },
        ]);
        console.log(`  ✓ Created ${inventoryMenus.length} Inventory sub-menus`);

        // Level 2: Manufacturing sub-menus
        const mfgMenus = await Menu.bulkCreate([
            { label: 'BOM', href: '/manufacturing/bom', icon: '📋', parentId: manufacturing.id, level: 2, order: 1, isActive: true, roles: ['admin', 'manufacturing'], ten_id, stg_id },
            { label: 'Routing', href: '/manufacturing/routing', icon: '🔄', parentId: manufacturing.id, level: 2, order: 2, isActive: true, roles: ['admin', 'manufacturing'], ten_id, stg_id },
            { label: 'Work Orders', href: '/manufacturing/work-orders', icon: '🏭', parentId: manufacturing.id, level: 2, order: 3, isActive: true, roles: ['admin', 'manufacturing'], ten_id, stg_id },
            { label: 'Quality Control', href: '/manufacturing/quality', icon: '✅', parentId: manufacturing.id, level: 2, order: 4, isActive: true, roles: ['admin', 'manufacturing'], ten_id, stg_id },
        ]);
        console.log(`  ✓ Created ${mfgMenus.length} Manufacturing sub-menus`);

        // Level 2: Finance sub-menus
        const financeMenus = await Menu.bulkCreate([
            { label: 'General Ledger', href: '/finance/general-ledger', icon: '📚', parentId: finance.id, level: 2, order: 1, isActive: true, roles: ['admin', 'finance'], ten_id, stg_id },
            { label: 'Accounts Receivable', href: '/finance/ar', icon: '💵', parentId: finance.id, level: 2, order: 2, isActive: true, roles: ['admin', 'finance'], ten_id, stg_id },
            { label: 'Accounts Payable', href: '/finance/ap', icon: '💸', parentId: finance.id, level: 2, order: 3, isActive: true, roles: ['admin', 'finance'], ten_id, stg_id },
            { label: 'Bank & Cash', href: '/finance/bank', icon: '🏦', parentId: finance.id, level: 2, order: 4, isActive: true, roles: ['admin', 'finance'], ten_id, stg_id },
            { label: 'Tax', href: '/finance/tax', icon: '📊', parentId: finance.id, level: 2, order: 5, isActive: true, roles: ['admin', 'finance'], ten_id, stg_id },
        ]);
        console.log(`  ✓ Created ${financeMenus.length} Finance sub-menus`);

        // Level 2: HR sub-menus
        const hrMenus = await Menu.bulkCreate([
            { label: 'Employees', href: '/hr/employees', icon: '👥', parentId: hr.id, level: 2, order: 1, isActive: true, roles: ['admin', 'hr'], ten_id, stg_id },
            { label: 'Attendance', href: '/hr/attendance', icon: '📅', parentId: hr.id, level: 2, order: 2, isActive: true, roles: ['admin', 'hr'], ten_id, stg_id },
            { label: 'Leave Management', href: '/hr/leave', icon: '🏖️', parentId: hr.id, level: 2, order: 3, isActive: true, roles: ['admin', 'hr'], ten_id, stg_id },
            { label: 'Payroll', href: '/hr/payroll', icon: '💰', parentId: hr.id, level: 2, order: 4, isActive: true, roles: ['admin', 'hr'], ten_id, stg_id },
        ]);
        console.log(`  ✓ Created ${hrMenus.length} HR sub-menus`);

        // Level 2: Service sub-menus
        const serviceMenus = await Menu.bulkCreate([
            { label: 'Tickets', href: '/service/tickets', icon: '🎫', parentId: service.id, level: 2, order: 1, isActive: true, roles: ['admin', 'service', 'user'], ten_id, stg_id },
            { label: 'SLA', href: '/service/sla', icon: '⏱️', parentId: service.id, level: 2, order: 2, isActive: true, roles: ['admin', 'service'], ten_id, stg_id },
            { label: 'Warranty', href: '/service/warranty', icon: '🛡️', parentId: service.id, level: 2, order: 3, isActive: true, roles: ['admin', 'service'], ten_id, stg_id },
        ]);
        console.log(`  ✓ Created ${serviceMenus.length} Service sub-menus`);

        // Level 2: E-commerce sub-menus
        const ecomMenus = await Menu.bulkCreate([
            { label: 'POS', href: '/ecommerce/pos', icon: '🖥️', parentId: ecommerce.id, level: 2, order: 1, isActive: true, roles: ['admin', 'sales'], ten_id, stg_id },
            { label: 'Online Orders', href: '/ecommerce/orders', icon: '🛒', parentId: ecommerce.id, level: 2, order: 2, isActive: true, roles: ['admin', 'sales'], ten_id, stg_id },
            { label: 'Product Catalog', href: '/ecommerce/catalog', icon: '📚', parentId: ecommerce.id, level: 2, order: 3, isActive: true, roles: ['admin', 'sales'], ten_id, stg_id },
        ]);
        console.log(`  ✓ Created ${ecomMenus.length} E-commerce sub-menus`);

        const totalSubMenus = coreMenus.length + salesMenus.length + purchaseMenus.length +
            inventoryMenus.length + mfgMenus.length + financeMenus.length +
            hrMenus.length + serviceMenus.length + ecomMenus.length;

        console.log(`\n✅ Menu seed complete!`);
        console.log(`  Total: ${menus.length} main menus + ${totalSubMenus} sub-menus = ${menus.length + totalSubMenus} items\n`);

    } catch (error) {
        console.error('❌ Error seeding menus:', error.message);
        throw error;
    } finally {
        await sequelize.close();
    }
}

seedMenus()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Failed:', error);
        process.exit(1);
    });
