/**
 * Generate placeholder pages for all menu items
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pages = [
    // Core
    { path: 'roles', title: 'Quản lý vai trò', icon: '🔐', module: 'Core' },
    { path: 'audit', title: 'Audit Logs', icon: '📝', module: 'Core' },

    // Sales
    { path: 'sales/leads', title: 'Quản lý Leads', icon: '🎯', module: 'Sales & CRM' },
    { path: 'sales/opportunities', title: 'Quản lý Opportunities', icon: '💡', module: 'Sales & CRM' },
    { path: 'sales/quotations', title: 'Báo giá', icon: '📄', module: 'Sales & CRM' },
    { path: 'sales/orders', title: 'Đơn hàng', icon: '📋', module: 'Sales & CRM' },
    { path: 'sales/customers', title: 'Khách hàng', icon: '🤝', module: 'Sales & CRM' },

    // Purchase
    { path: 'purchase/requests', title: 'Yêu cầu mua hàng', icon: '📝', module: 'Purchase' },
    { path: 'purchase/rfq', title: 'RFQ', icon: '💬', module: 'Purchase' },
    { path: 'purchase/orders', title: 'Đơn mua hàng', icon: '📋', module: 'Purchase' },
    { path: 'purchase/suppliers', title: 'Nhà cung cấp', icon: '🏢', module: 'Purchase' },

    // Inventory
    { path: 'inventory/products', title: 'Sản phẩm', icon: '📦', module: 'Inventory' },
    { path: 'inventory/warehouses', title: 'Kho hàng', icon: '🏪', module: 'Inventory' },
    { path: 'inventory/stock', title: 'Tồn kho', icon: '📊', module: 'Inventory' },
    { path: 'inventory/adjustments', title: 'Điều chỉnh kho', icon: '⚖️', module: 'Inventory' },

    // Manufacturing
    { path: 'manufacturing/bom', title: 'BOM', icon: '📋', module: 'Manufacturing' },
    { path: 'manufacturing/routing', title: 'Routing', icon: '🔄', module: 'Manufacturing' },
    { path: 'manufacturing/work-orders', title: 'Lệnh sản xuất', icon: '🏭', module: 'Manufacturing' },
    { path: 'manufacturing/quality', title: 'Kiểm soát chất lượng', icon: '✅', module: 'Manufacturing' },

    // Finance
    { path: 'finance/general-ledger', title: 'Sổ cái', icon: '📚', module: 'Finance' },
    { path: 'finance/ar', title: 'Công nợ phải thu', icon: '💵', module: 'Finance' },
    { path: 'finance/ap', title: 'Công nợ phải trả', icon: '💸', module: 'Finance' },
    { path: 'finance/bank', title: 'Ngân hàng & Tiền mặt', icon: '🏦', module: 'Finance' },
    { path: 'finance/tax', title: 'Thuế', icon: '📊', module: 'Finance' },

    // HR
    { path: 'hr/employees', title: 'Nhân viên', icon: '👥', module: 'HR' },
    { path: 'hr/attendance', title: 'Chấm công', icon: '📅', module: 'HR' },
    { path: 'hr/leave', title: 'Nghỉ phép', icon: '🏖️', module: 'HR' },
    { path: 'hr/payroll', title: 'Lương', icon: '💰', module: 'HR' },

    // Service
    { path: 'service/tickets', title: 'Tickets', icon: '🎫', module: 'Service' },
    { path: 'service/sla', title: 'SLA', icon: '⏱️', module: 'Service' },
    { path: 'service/warranty', title: 'Bảo hành', icon: '🛡️', module: 'Service' },

    // Projects
    { path: 'projects', title: 'Dự án', icon: '📋', module: 'Projects' },

    // E-commerce
    { path: 'ecommerce/pos', title: 'POS', icon: '🖥️', module: 'E-commerce' },
    { path: 'ecommerce/orders', title: 'Đơn hàng online', icon: '🛒', module: 'E-commerce' },
    { path: 'ecommerce/catalog', title: 'Catalog sản phẩm', icon: '📚', module: 'E-commerce' },
];

const pageTemplate = (title, icon, module) => `'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function ${title.replace(/[^a-zA-Z0-9]/g, '')}Page() {
    return (
        <PageTemplate
            title="${title}"
            icon="${icon}"
            breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: '${module}' },
                { label: '${title}' },
            ]}
        >
            <ComingSoon moduleName="${title}" />
        </PageTemplate>
    );
}
`;

function createPages() {
    const appDir = path.join(__dirname, '../src/app');
    let created = 0;
    let skipped = 0;

    pages.forEach(page => {
        const pagePath = path.join(appDir, page.path);
        const pageFile = path.join(pagePath, 'page.js');

        // Create directory if it doesn't exist
        if (!fs.existsSync(pagePath)) {
            fs.mkdirSync(pagePath, { recursive: true });
        }

        // Create page file if it doesn't exist
        if (!fs.existsSync(pageFile)) {
            fs.writeFileSync(pageFile, pageTemplate(page.title, page.icon, page.module));
            console.log(`✓ Created: ${page.path}/page.js`);
            created++;
        } else {
            console.log(`⊘ Skipped: ${page.path}/page.js (already exists)`);
            skipped++;
        }
    });

    console.log(`\n✅ Page generation complete!`);
    console.log(`  Created: ${created} pages`);
    console.log(`  Skipped: ${skipped} pages`);
}

createPages();
