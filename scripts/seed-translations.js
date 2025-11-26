import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { sequelize } from '../src/models/sequelize/index.js';
key: 'common.allRoles',
    module: 'core',
        description: 'All roles filter option',
            translations: {
    vi: 'Tất cả vai trò',
        en: 'All Roles',
            ko: '모든 역할'
}
            },
{
    key: 'common.allStatus',
        module: 'core',
            description: 'All status filter option',
                translations: {
        vi: 'Tất cả trạng thái',
            en: 'All Status',
                ko: '모든 상태'
    }
},
{
    key: 'common.delete',
        module: 'core',
            description: 'Delete button',
                translations: {
        vi: 'Xóa',
            en: 'Delete',
                ko: '삭제'
    }
},
{
    key: 'common.search',
        module: 'core',
            description: 'Search input placeholder',
                translations: {
        vi: 'Tìm kiếm người dùng...',
            en: 'Search users...',
                ko: '사용자 검색...'
    }
},
// Pagination
{
    key: 'common.pagination.showing',
        module: 'core',
            description: 'Pagination showing text',
                translations: {
        vi: 'Hiển thị',
            en: 'Showing',
                ko: '표시'
    }
},
{
    key: 'common.pagination.to',
        module: 'core',
            description: 'Pagination to connector',
                translations: {
        vi: 'đến',
            en: 'to',
                ko: '~'
    }
},
{
    key: 'common.pagination.of',
        module: 'core',
            description: 'Pagination of connector',
                translations: {
        vi: 'của',
            en: 'of',
                ko: '의'
    }
},
{
    key: 'common.pagination.results',
        module: 'core',
            description: 'Pagination results text',
                translations: {
        vi: 'kết quả',
            en: 'results',
                ko: '결과'
    }
},
{
    key: 'common.pagination.previous',
        module: 'core',
            description: 'Previous page button',
                translations: {
        vi: 'Trước',
            en: 'Previous',
                ko: '이전'
    }
},
{
    key: 'common.pagination.next',
        module: 'core',
            description: 'Next page button',
                translations: {
        vi: 'Tiếp',
            en: 'Next',
                ko: '다음'
    }
},
// Module names
{
    key: 'modules.core',
        module: 'core',
            description: 'Core module name',
                translations: {
        vi: 'Lõi',
            en: 'Core',
                ko: '핵심'
    }
},
// Users page specific
{
    key: 'pages.users.title',
        module: 'core',
            description: 'Users page title',
                translations: {
        vi: 'Quản lý người dùng',
            en: 'User Management',
                ko: '사용자 관리'
    }
},
{
    key: 'pages.users.description',
        module: 'core',
            description: 'Users page description',
                translations: {
        vi: 'Quản lý tài khoản người dùng, vai trò và quyền hạn',
            en: 'Manage user accounts, roles, and permissions',
                ko: '사용자 계정, 역할 및 권한 관리'
    }
},
{
    key: 'pages.users.addUser',
        module: 'core',
            description: 'Add user button',
                translations: {
        vi: 'Thêm người dùng',
            en: 'Add User',
                ko: '사용자 추가'
    }
},
{
    key: 'pages.users.edit',
        module: 'core',
            description: 'Edit button',
                translations: {
        vi: 'Sửa',
            en: 'Edit',
                ko: '편집'
    }
},
{
    key: 'pages.users.clearFilters',
        module: 'core',
            description: 'Clear filters button',
                translations: {
        vi: 'Xóa bộ lọc',
            en: 'Clear Filters',
                ko: '필터 지우기'
    }
},
{
    key: 'pages.users.active',
        module: 'core',
            description: 'Active status',
                translations: {
        vi: 'Hoạt động',
            en: 'Active',
                ko: '활성'
    }
},
{
    key: 'pages.users.inactive',
        module: 'core',
            description: 'Inactive status',
                translations: {
        vi: 'Không hoạt động',
            en: 'Inactive',
                ko: '비활성'
    }
},
// Table headers
{
    key: 'pages.users.table.name',
        module: 'core',
            description: 'Name column header',
                translations: {
        vi: 'TÊN',
            en: 'NAME',
                ko: '이름'
    }
},
{
    key: 'pages.users.table.email',
        module: 'core',
            description: 'Email column header',
                translations: {
        vi: 'EMAIL',
            en: 'EMAIL',
                ko: '이메일'
    }
},
{
    key: 'pages.users.table.role',
        module: 'core',
            description: 'Role column header',
                translations: {
        vi: 'VAI TRÒ',
            en: 'ROLE',
                ko: '역할'
    }
},
{
    key: 'pages.users.table.status',
        module: 'core',
            description: 'Status column header',
                translations: {
        vi: 'TRẠNG THÁI',
            en: 'STATUS',
                ko: '상태'
    }
},
{
    key: 'pages.users.table.lastLogin',
        module: 'core',
            description: 'Last login column header',
                translations: {
        vi: 'ĐĂNG NHẬP CUỐI',
            en: 'LAST LOGIN',
                ko: '마지막 로그인'
    }
},
{
    key: 'pages.users.table.actions',
        module: 'core',
            description: 'Actions column header',
                translations: {
        vi: 'HÀNH ĐỘNG',
            en: 'ACTIONS',
                ko: '작업'
    }
},
// Roles
{
    key: 'roles.admin',
        module: 'core',
            description: 'Admin role label',
                translations: {
        vi: 'Quản trị viên',
            en: 'Admin',
                ko: '관리자'
    }
},
{
    key: 'roles.user',
        module: 'core',
            description: 'User role label',
                translations: {
        vi: 'Người dùng',
            en: 'User',
                ko: '사용자'
    }
},
// Common - Edit button
{
    key: 'common.edit',
        module: 'core',
            description: 'Edit button',
                translations: {
        vi: 'Sửa',
            en: 'Edit',
                ko: '편집'
    }
},
// Roles page
{
    key: 'pages.roles.title',
        module: 'core',
            description: 'Roles page title',
                translations: {
        vi: 'Vai trò & Quyền hạn',
            en: 'Roles & Permissions',
                ko: '역할 및 권한'
    }
},
{
    key: 'pages.roles.description',
        module: 'core',
            description: 'Roles page description',
                translations: {
        vi: 'Quản lý vai trò người dùng và quyền hạn của họ',
            en: 'Manage user roles and their permissions',
                ko: '사용자 역할 및 권한 관리'
    }
},
{
    key: 'pages.roles.addRole',
        module: 'core',
            description: 'Add role button',
                translations: {
        vi: 'Thêm vai trò',
            en: 'Add Role',
                ko: '역할 추가'
    }
},
{
    key: 'pages.roles.clearFilters',
        module: 'core',
            description: 'Clear filters button',
                translations: {
        vi: 'Xóa bộ lọc',
            en: 'Clear Filters',
                ko: '필터 지우기'
    }
},
{
    key: 'pages.roles.table.name',
        module: 'core',
            description: 'Role name column header',
                translations: {
        vi: 'TÊN VAI TRÒ',
            en: 'ROLE NAME',
                ko: '역할 이름'
    }
},
{
    key: 'pages.roles.table.description',
        module: 'core',
            description: 'Description column header',
                translations: {
        vi: 'MÔ TẢ',
            en: 'DESCRIPTION',
                ko: '설명'
    }
},
{
    key: 'pages.roles.table.usersCount',
        module: 'core',
            description: 'Users count column header',
                translations: {
        vi: 'NGƯỜI DÙNG',
            en: 'USERS',
                ko: '사용자'
    }
},
{
    key: 'pages.roles.table.actions',
        module: 'core',
            description: 'Actions column header',
                translations: {
        vi: 'HÀNH ĐỘNG',
            en: 'ACTIONS',
                ko: '작업'
    }
},
{
    key: 'common.allUserCounts',
        module: 'core',
            description: 'All user counts filter option',
                translations: {
        vi: 'Tất cả số lượng người dùng',
            en: 'All User Counts',
                ko: '모든 사용자 수'
    }
},
{
    key: 'common.emptyUsers',
        module: 'core',
            description: 'Empty users filter option',
                translations: {
        vi: 'Trống (0 người dùng)',
            en: 'Empty (0 users)',
                ko: '비어 있음 (0명)'
    }
},
{
    key: 'common.smallUsers',
        module: 'core',
            description: 'Small users filter option',
                translations: {
        vi: 'Nhỏ (1-5 người dùng)',
            en: 'Small (1-5 users)',
                ko: '소규모 (1-5명)'
    }
},
{
    key: 'common.mediumUsers',
        module: 'core',
            description: 'Medium users filter option',
                translations: {
        vi: 'Trung bình (6-20 người dùng)',
            en: 'Medium (6-20 users)',
                ko: '중간 (6-20명)'
    }
},
{
    key: 'common.largeUsers',
        module: 'core',
            description: 'Large users filter option',
                translations: {
        vi: 'Lớn (>20 người dùng)',
            en: 'Large (>20 users)',
                ko: '대규모 (>20명)'
    }
},
{
    key: 'common.allTypes',
        module: 'core',
            description: 'All types filter option',
                translations: {
        vi: 'Tất cả loại',
            en: 'All Types',
                ko: '모든 유형'
    }
},
{
    key: 'common.systemRoles',
        module: 'core',
            description: 'System roles filter option',
                translations: {
        vi: 'Vai trò hệ thống',
            en: 'System Roles',
                ko: '시스템 역할'
    }
},
{
    key: 'common.customRoles',
        module: 'core',
            description: 'Custom roles filter option',
                translations: {
        vi: 'Vai trò tùy chỉnh',
            en: 'Custom Roles',
                ko: '사용자 정의 역할'
    }
},
// Audit Logs page
{
    key: 'pages.audit.title',
        module: 'core',
            description: 'Audit logs page title',
                translations: {
        vi: 'Nhật ký kiểm toán',
            en: 'Audit Logs',
                ko: '감사 로그'
    }
},
{
    key: 'pages.audit.description',
        module: 'core',
            description: 'Audit logs page description',
                translations: {
        vi: 'Theo dõi tất cả hoạt động và thay đổi của hệ thống',
            en: 'Track all system activities and changes',
                ko: '모든 시스템 활동 및 변경 사항 추적'
    }
},
{
    key: 'pages.audit.exportCsv',
        module: 'core',
            description: 'Export CSV button',
                translations: {
        vi: 'Xuất CSV',
            en: 'Export CSV',
                ko: 'CSV 내보내기'
    }
},
{
    key: 'pages.audit.clearFilters',
        module: 'core',
            description: 'Clear filters button',
                translations: {
        vi: 'Xóa bộ lọc',
            en: 'Clear Filters',
                ko: '필터 지우기'
    }
},
{
    key: 'pages.audit.table.timestamp',
        module: 'core',
            description: 'Timestamp column header',
                translations: {
        vi: 'THỜI GIAN',
            en: 'TIMESTAMP',
                ko: '타임스탬프'
    }
},
{
    key: 'pages.audit.table.user',
        module: 'core',
            description: 'User column header',
                translations: {
        vi: 'NGƯỜI DÙNG',
            en: 'USER',
                ko: '사용자'
    }
},
{
    key: 'pages.audit.table.action',
        module: 'core',
            description: 'Action column header',
                translations: {
        vi: 'HÀNH ĐỘNG',
            en: 'ACTION',
                ko: '작업'
    }
},
{
    key: 'pages.audit.table.resource',
        module: 'core',
            description: 'Resource column header',
                translations: {
        vi: 'TÀI NGUYÊN',
            en: 'RESOURCE',
                ko: '리소스'
    }
},
{
    key: 'pages.audit.table.ip',
        module: 'core',
            description: 'IP address column header',
                translations: {
        vi: 'ĐỊA CHỈ IP',
            en: 'IP ADDRESS',
                ko: 'IP 주소'
    }
},
{
    key: 'pages.audit.table.details',
        module: 'core',
            description: 'Details column header',
                translations: {
        vi: 'CHI TIẾT',
            en: 'DETAILS',
                ko: '세부정보'
    }
},
{
    key: 'common.allActions',
        module: 'core',
            description: 'All actions filter option',
                translations: {
        vi: 'Tất cả hành động',
            en: 'All Actions',
                ko: '모든 작업'
    }
},
{
    key: 'common.actionCreate',
        module: 'core',
            description: 'CREATE action',
                translations: {
        vi: 'TẠO',
            en: 'CREATE',
                ko: '생성'
    }
},
{
    key: 'common.actionUpdate',
        module: 'core',
            description: 'UPDATE action',
                translations: {
        vi: 'CẬP NHẬT',
            en: 'UPDATE',
                ko: '업데이트'
    }
},
{
    key: 'common.actionDelete',
        module: 'core',
            description: 'DELETE action',
                translations: {
        vi: 'XÓA',
            en: 'DELETE',
                ko: '삭제'
    }
},
{
    key: 'common.actionLogin',
        module: 'core',
            description: 'LOGIN action',
                translations: {
        vi: 'ĐĂNG NHẬP',
            en: 'LOGIN',
                ko: '로그인'
    }
},
{
    key: 'common.allResources',
        module: 'core',
            description: 'All resources filter option',
                translations: {
        vi: 'Tất cả tài nguyên',
            en: 'All Resources',
                ko: '모든 리소스'
    }
},
{
    key: 'common.resourceUser',
        module: 'core',
            description: 'User resource',
                translations: {
        vi: 'Người dùng',
            en: 'User',
                ko: '사용자'
    }
},
{
    key: 'common.resourceRole',
        module: 'core',
            description: 'Role resource',
                translations: {
        vi: 'Vai trò',
            en: 'Role',
                ko: '역할'
    }
},
{
    key: 'common.resourceCustomer',
        module: 'core',
            description: 'Customer resource',
                translations: {
        vi: 'Khách hàng',
            en: 'Customer',
                ko: '고객'
    }
},
{
    key: 'common.resourceProduct',
        module: 'core',
            description: 'Product resource',
                translations: {
        vi: 'Sản phẩm',
            en: 'Product',
                ko: '제품'
    }
},
{
    key: 'common.resourceSystem',
        module: 'core',
            description: 'System resource',
                translations: {
        vi: 'Hệ thống',
            en: 'System',
                ko: '시스템'
    }
},
{
    key: 'common.allTime',
        module: 'core',
            description: 'All time filter option',
                translations: {
        vi: 'Tất cả thời gian',
            en: 'All Time',
                ko: '전체 기간'
    }
},
{
    key: 'common.today',
        module: 'core',
            description: 'Today filter option',
                translations: {
        vi: 'Hôm nay',
            en: 'Today',
                ko: '오늘'
    }
},
{
    key: 'common.yesterday',
        module: 'core',
            description: 'Yesterday filter option',
                translations: {
        vi: 'Hôm qua',
            en: 'Yesterday',
                ko: '어제'
    }
},
{
    key: 'common.last7Days',
        module: 'core',
            description: 'Last 7 days filter option',
                translations: {
        vi: '7 ngày qua',
            en: 'Last 7 Days',
                ko: '최근 7일'
    }
},
{
    key: 'common.last30Days',
        module: 'core',
            description: 'Last 30 days filter option',
                translations: {
        vi: '30 ngày qua',
            en: 'Last 30 Days',
                ko: '최근 30일'
    }
},
{
    key: 'common.retry',
        module: 'core',
            description: 'Retry button',
                translations: {
        vi: 'Thử lại',
            en: 'Retry',
                ko: '재시도'
    }
},
// Menus page
{
    key: 'pages.menus.title',
        module: 'core',
            description: 'Menus page title',
                translations: {
        vi: 'Quản lý Menu',
            en: 'Menu Management',
                ko: '메뉴 관리'
    }
},
{
    key: 'pages.menus.description',
        module: 'core',
            description: 'Menus page description',
                translations: {
        vi: 'Quản lý menu điều hướng và cấu trúc',
            en: 'Manage navigation menus and structure',
                ko: '탐색 메뉴 및 구조 관리'
    }
},
{
    key: 'pages.menus.addMenu',
        module: 'core',
            description: 'Add menu button',
                translations: {
        vi: 'Thêm Menu',
            en: 'Add Menu',
                ko: '메뉴 추가'
    }
},
{
    key: 'pages.menus.searchPlaceholder',
        module: 'core',
            description: 'Search menus placeholder',
                translations: {
        vi: 'Tìm kiếm menu...',
            en: 'Search menus...',
                ko: '메뉴 검색...'
    }
},
{
    key: 'pages.menus.allModules',
        module: 'core',
            description: 'All modules filter option',
                translations: {
        vi: 'Tất cả mô-đun',
            en: 'All Modules',
                ko: '모든 모듈'
    }
},
{
    key: 'pages.menus.allLevels',
        module: 'core',
            description: 'All levels filter option',
                translations: {
        vi: 'Tất cả cấp độ',
            en: 'All Levels',
                ko: '모든 레벨'
    }
},
{
    key: 'pages.menus.topLevel',
        module: 'core',
            description: 'Top level filter option',
                translations: {
        vi: 'Cấp cao nhất',
            en: 'Top Level',
                ko: '최상위 레벨'
    }
},
{
    key: 'pages.menus.subMenu',
        module: 'core',
            description: 'Sub menu filter option',
                translations: {
        vi: 'Menu con',
            en: 'Sub Menu',
                ko: '하위 메뉴'
    }
},
{
    key: 'pages.menus.clearFilters',
        module: 'core',
            description: 'Clear filters button',
                translations: {
        vi: 'Xóa bộ lọc',
            en: 'Clear Filters',
                ko: '필터 지우기'
    }
},
{
    key: 'pages.menus.table.menuItem',
        module: 'core',
            description: 'Menu item column header',
                translations: {
        vi: 'MỤC MENU',
            en: 'MENU ITEM',
                ko: '메뉴 항목'
    }
},
{
    key: 'pages.menus.table.path',
        module: 'core',
            description: 'Path column header',
                translations: {
        vi: 'ĐƯỜNG DẪN',
            en: 'PATH',
                ko: '경로'
    }
},
{
    key: 'pages.menus.table.order',
        module: 'core',
            description: 'Order column header',
                translations: {
        vi: 'THỨ TỰ',
            en: 'ORDER',
                ko: '순서'
    }
},
{
    key: 'pages.menus.table.status',
        module: 'core',
            description: 'Status column header',
                translations: {
        vi: 'TRẠNG THÁI',
            en: 'STATUS',
                ko: '상태'
    }
},
{
    key: 'pages.menus.table.actions',
        module: 'core',
            description: 'Actions column header',
                translations: {
        vi: 'HÀNH ĐỘNG',
            en: 'ACTIONS',
                ko: '작업'
    }
},
{
    key: 'pages.menus.active',
        module: 'core',
            description: 'Active status',
                translations: {
        vi: 'Hoạt động',
            en: 'Active',
                ko: '활성'
    }
},
{
    key: 'pages.menus.inactive',
        module: 'core',
            description: 'Inactive status',
                translations: {
        vi: 'Không hoạt động',
            en: 'Inactive',
                ko: '비활성'
    }
},
// Module names
{
    key: 'modules.settings',
        module: 'core',
            description: 'Settings module name',
                translations: {
        vi: 'Cài đặt',
            en: 'Settings',
                ko: '설정'
    }
},
{
    key: 'modules.sales',
        module: 'core',
            description: 'Sales module name',
                translations: {
        vi: 'Bán hàng',
            en: 'Sales',
                ko: '판매'
    }
},
{
    key: 'modules.finance',
        module: 'core',
            description: 'Finance module name',
                translations: {
        vi: 'Tài chính',
            en: 'Finance',
                ko: '재무'
    }
},
{
    key: 'modules.inventory',
        module: 'core',
            description: 'Inventory module name',
                translations: {
        vi: 'Kho hàng',
            en: 'Inventory',
                ko: '재고'
    }
},
{
    key: 'modules.hr',
        module: 'core',
            description: 'HR module name',
                translations: {
        vi: 'Nhân sự',
            en: 'HR',
                ko: '인사'
    }
},
{
    key: 'modules.projects',
        module: 'core',
            description: 'Projects module name',
                translations: {
        vi: 'Dự án',
            en: 'Projects',
                ko: '프로젝트'
    }
}
        ];


// Insert or update translations
let totalInserted = 0;
let totalUpdated = 0;
for (const item of translations) {
    for (const [langCode, value] of Object.entries(item.translations)) {
        const [translation, created] = await UITranslation.findOrCreate({
            where: {
                key: item.key,
                languageCode: langCode,
                ten_id,
                stg_id
            },
            defaults: {
                value: value,
                module: item.module,
                description: item.description
            }
        });

        if (created) {
            totalInserted++;
        } else {
            // Update existing translation
            await translation.update({
                value: value,
                module: item.module,
                description: item.description
            });
            totalUpdated++;
        }
    }
}

console.log(`\n✅ Translation seed complete!`);
console.log(`  Total: ${translations.length} keys × 3 languages`);
console.log(`  Inserted: ${totalInserted} new records`);
console.log(`  Updated: ${totalUpdated} existing records\n`);


    } catch (error) {
    console.error('❌ Error seeding translations:', error.message);
    throw error;
} finally {
    await sequelize.close();
}
}

seedTranslations()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Failed:', error);
        process.exit(1);
    });
