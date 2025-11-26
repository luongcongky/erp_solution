/**
 * Migration script for i18n tables and seed data
 * Creates: core.languages, core.ui_translations
 * Seeds: Initial languages (VI, EN, KO) and UI translations
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { sequelize } from '../src/models/sequelize/index.js';
import models from '../src/models/sequelize/index.js';

const { Language, UITranslation } = models;

async function migrateI18n() {
    try {
        console.log('[i18n Migration] Starting...\n');

        // Step 1: Sync models (create tables)
        console.log('Step 1: Creating tables...');
        await Language.sync({ force: false });
        await UITranslation.sync({ force: false });
        console.log('  ✓ Tables created\n');

        // Step 2: Seed languages
        console.log('Step 2: Seeding languages...');
        const ten_id = '1000';
        const stg_id = 'DEV';

        const languages = [
            {
                code: 'vi',
                name: 'Vietnamese',
                nativeName: 'Tiếng Việt',
                flagEmoji: '🇻🇳',
                isDefault: true,
                isActive: true,
                order: 1,
                ten_id,
                stg_id,
            },
            {
                code: 'en',
                name: 'English',
                nativeName: 'English',
                flagEmoji: '🇬🇧',
                isDefault: false,
                isActive: true,
                order: 2,
                ten_id,
                stg_id,
            },
            {
                code: 'ko',
                name: 'Korean',
                nativeName: '한국어',
                flagEmoji: '🇰🇷',
                isDefault: false,
                isActive: true,
                order: 3,
                ten_id,
                stg_id,
            },
        ];

        for (const lang of languages) {
            await Language.findOrCreate({
                where: { code: lang.code, ten_id, stg_id },
                defaults: lang,
            });
            console.log(`  ✓ ${lang.flagEmoji} ${lang.name} (${lang.code})`);
        }
        console.log('');

        // Step 3: Seed UI translations
        console.log('Step 3: Seeding UI translations...');

        const translations = [
            // Common
            { key: 'common.save', vi: 'Lưu', en: 'Save', ko: '저장', module: 'core' },
            { key: 'common.cancel', vi: 'Hủy', en: 'Cancel', ko: '취소', module: 'core' },
            { key: 'common.delete', vi: 'Xóa', en: 'Delete', ko: '삭제', module: 'core' },
            { key: 'common.edit', vi: 'Sửa', en: 'Edit', ko: '편집', module: 'core' },
            { key: 'common.add', vi: 'Thêm', en: 'Add', ko: '추가', module: 'core' },
            { key: 'common.search', vi: 'Tìm kiếm', en: 'Search', ko: '검색', module: 'core' },
            { key: 'common.loading', vi: 'Đang tải...', en: 'Loading...', ko: '로딩 중...', module: 'core' },
            { key: 'common.noData', vi: 'Không có dữ liệu', en: 'No data', ko: '데이터 없음', module: 'core' },
            { key: 'common.dashboard', vi: 'Dashboard', en: 'Dashboard', ko: '대시보드', module: 'core' },
            { key: 'common.logout', vi: 'Đăng xuất', en: 'Logout', ko: '로그아웃', module: 'core' },

            // Modules
            { key: 'modules.core', vi: 'Core', en: 'Core', ko: 'Core', module: 'core' },
            { key: 'modules.sales', vi: 'Sales & CRM', en: 'Sales & CRM', ko: '영업 & CRM', module: 'sales' },
            { key: 'modules.purchase', vi: 'Purchase', en: 'Purchase', ko: '구매', module: 'purchase' },
            { key: 'modules.inventory', vi: 'Inventory', en: 'Inventory', ko: '재고', module: 'inventory' },
            { key: 'modules.manufacturing', vi: 'Manufacturing', en: 'Manufacturing', ko: '제조', module: 'manufacturing' },
            { key: 'modules.finance', vi: 'Finance', en: 'Finance', ko: '재무', module: 'finance' },
            { key: 'modules.hr', vi: 'HR', en: 'HR', ko: '인사', module: 'hr' },
            { key: 'modules.service', vi: 'Service', en: 'Service', ko: '서비스', module: 'service' },
            { key: 'modules.projects', vi: 'Projects', en: 'Projects', ko: '프로젝트', module: 'projects' },
            { key: 'modules.ecommerce', vi: 'E-commerce', en: 'E-commerce', ko: '전자상거래', module: 'ecommerce' },

            // Users page
            { key: 'pages.users.title', vi: 'Quản lý người dùng', en: 'User Management', ko: '사용자 관리', module: 'core' },
            { key: 'pages.users.description', vi: 'Quản lý tài khoản người dùng trong hệ thống', en: 'Manage user accounts in the system', ko: '시스템의 사용자 계정 관리', module: 'core' },
            { key: 'pages.users.addUser', vi: 'Thêm người dùng', en: 'Add User', ko: '사용자 추가', module: 'core' },
            { key: 'pages.users.name', vi: 'Tên', en: 'Name', ko: '이름', module: 'core' },
            { key: 'pages.users.email', vi: 'Email', en: 'Email', ko: '이메일', module: 'core' },
            { key: 'pages.users.role', vi: 'Vai trò', en: 'Role', ko: '역할', module: 'core' },
            { key: 'pages.users.status', vi: 'Trạng thái', en: 'Status', ko: '상태', module: 'core' },
            { key: 'pages.users.active', vi: 'Hoạt động', en: 'Active', ko: '활성', module: 'core' },
            { key: 'pages.users.inactive', vi: 'Ngừng', en: 'Inactive', ko: '비활성', module: 'core' },

            // Products page
            { key: 'pages.products.title', vi: 'Sản phẩm', en: 'Products', ko: '제품', module: 'inventory' },
            { key: 'pages.products.description', vi: 'Quản lý danh mục sản phẩm', en: 'Manage product catalog', ko: '제품 카탈로그 관리', module: 'inventory' },
            { key: 'pages.products.addProduct', vi: 'Thêm sản phẩm', en: 'Add Product', ko: '제품 추가', module: 'inventory' },
            { key: 'pages.products.sku', vi: 'SKU', en: 'SKU', ko: 'SKU', module: 'inventory' },
            { key: 'pages.products.name', vi: 'Tên sản phẩm', en: 'Product Name', ko: '제품명', module: 'inventory' },
            { key: 'pages.products.type', vi: 'Loại', en: 'Type', ko: '유형', module: 'inventory' },
            { key: 'pages.products.cost', vi: 'Giá vốn', en: 'Cost', ko: '원가', module: 'inventory' },
            { key: 'pages.products.price', vi: 'Giá bán', en: 'Price', ko: '가격', module: 'inventory' },
            { key: 'pages.products.searchPlaceholder', vi: 'Tìm kiếm theo tên hoặc SKU...', en: 'Search by name or SKU...', ko: '이름 또는 SKU로 검색...', module: 'inventory' },

            // Coming Soon
            { key: 'comingSoon.title', vi: 'Đang phát triển', en: 'Coming Soon', ko: '개발 중', module: 'core' },
            { key: 'comingSoon.message', vi: 'Module {module} đang được phát triển và sẽ sớm ra mắt.', en: 'Module {module} is under development and will be available soon.', ko: '{module} 모듈은 개발 중이며 곧 출시될 예정입니다.', module: 'core' },
            { key: 'comingSoon.backToDashboard', vi: 'Quay lại Dashboard', en: 'Back to Dashboard', ko: '대시보드로 돌아가기', module: 'core' },
        ];

        let count = 0;
        for (const trans of translations) {
            for (const langCode of ['vi', 'en', 'ko']) {
                if (trans[langCode]) {
                    await UITranslation.findOrCreate({
                        where: {
                            key: trans.key,
                            languageCode: langCode,
                            ten_id,
                            stg_id,
                        },
                        defaults: {
                            key: trans.key,
                            languageCode: langCode,
                            value: trans[langCode],
                            module: trans.module,
                            ten_id,
                            stg_id,
                        },
                    });
                    count++;
                }
            }
        }
        console.log(`  ✓ Created ${count} UI translations\n`);

        console.log('✅ i18n migration complete!\n');
        console.log('Summary:');
        console.log(`  - Languages: 3 (VI, EN, KO)`);
        console.log(`  - UI Translations: ${count} entries`);
        console.log(`  - Default Language: Vietnamese (vi)\n`);

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        throw error;
    } finally {
        await sequelize.close();
    }
}

migrateI18n()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Failed:', error);
        process.exit(1);
    });
