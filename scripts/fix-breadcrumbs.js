/**
 * Fix breadcrumbs in all pages
 * Correct structure: Module > Page (NOT Dashboard > Module > Page)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapping of paths to correct breadcrumbs
const breadcrumbMap = {
    // Core
    'users': { module: 'Core', page: 'Users' },
    'roles': { module: 'Core', page: 'Roles' },
    'audit': { module: 'Core', page: 'Audit Logs' },

    // Sales
    'sales/leads': { module: 'Sales & CRM', page: 'Leads' },
    'sales/opportunities': { module: 'Sales & CRM', page: 'Opportunities' },
    'sales/quotations': { module: 'Sales & CRM', page: 'Quotations' },
    'sales/orders': { module: 'Sales & CRM', page: 'Sales Orders' },
    'sales/customers': { module: 'Sales & CRM', page: 'Customers' },

    // Purchase
    'purchase/requests': { module: 'Purchase', page: 'Purchase Requests' },
    'purchase/rfq': { module: 'Purchase', page: 'RFQ' },
    'purchase/orders': { module: 'Purchase', page: 'Purchase Orders' },
    'purchase/suppliers': { module: 'Purchase', page: 'Suppliers' },

    // Inventory
    'inventory/products': { module: 'Inventory', page: 'Products' },
    'inventory/warehouses': { module: 'Inventory', page: 'Warehouses' },
    'inventory/stock': { module: 'Inventory', page: 'Stock Movements' },
    'inventory/adjustments': { module: 'Inventory', page: 'Adjustments' },

    // Manufacturing
    'manufacturing/bom': { module: 'Manufacturing', page: 'BOM' },
    'manufacturing/routing': { module: 'Manufacturing', page: 'Routing' },
    'manufacturing/work-orders': { module: 'Manufacturing', page: 'Work Orders' },
    'manufacturing/quality': { module: 'Manufacturing', page: 'Quality Control' },

    // Finance
    'finance/general-ledger': { module: 'Finance', page: 'General Ledger' },
    'finance/ar': { module: 'Finance', page: 'Accounts Receivable' },
    'finance/ap': { module: 'Finance', page: 'Accounts Payable' },
    'finance/bank': { module: 'Finance', page: 'Bank & Cash' },
    'finance/tax': { module: 'Finance', page: 'Tax' },

    // HR
    'hr/employees': { module: 'HR', page: 'Employees' },
    'hr/attendance': { module: 'HR', page: 'Attendance' },
    'hr/leave': { module: 'HR', page: 'Leave Management' },
    'hr/payroll': { module: 'HR', page: 'Payroll' },

    // Service
    'service/tickets': { module: 'Service', page: 'Tickets' },
    'service/sla': { module: 'Service', page: 'SLA' },
    'service/warranty': { module: 'Service', page: 'Warranty' },

    // E-commerce
    'ecommerce/pos': { module: 'E-commerce', page: 'POS' },
    'ecommerce/orders': { module: 'E-commerce', page: 'Online Orders' },
    'ecommerce/catalog': { module: 'E-commerce', page: 'Product Catalog' },
};

function fixBreadcrumbs() {
    const appDir = path.join(__dirname, '../src/app');
    let fixed = 0;
    let errors = 0;

    Object.entries(breadcrumbMap).forEach(([pagePath, { module, page }]) => {
        const pageFile = path.join(appDir, pagePath, 'page.js');

        if (!fs.existsSync(pageFile)) {
            console.log(`⊘ Skipped: ${pagePath}/page.js (not found)`);
            return;
        }

        try {
            let content = fs.readFileSync(pageFile, 'utf8');

            // Find and replace breadcrumbs - ONLY Module > Page
            const oldBreadcrumbPattern = /breadcrumbs=\{(\[[\s\S]*?\])\}/;
            const newBreadcrumbs = `breadcrumbs={[
                { label: '${module}' },
                { label: '${page}' },
            ]}`;

            if (oldBreadcrumbPattern.test(content)) {
                content = content.replace(oldBreadcrumbPattern, newBreadcrumbs);
                fs.writeFileSync(pageFile, content, 'utf8');
                console.log(`✓ Fixed: ${pagePath}/page.js → ${module} > ${page}`);
                fixed++;
            } else {
                console.log(`⊘ No breadcrumbs found: ${pagePath}/page.js`);
            }
        } catch (error) {
            console.error(`✗ Error fixing ${pagePath}/page.js:`, error.message);
            errors++;
        }
    });

    console.log(`\n✅ Breadcrumb fix complete!`);
    console.log(`  Fixed: ${fixed} pages`);
    console.log(`  Errors: ${errors} pages`);
}

fixBreadcrumbs();
