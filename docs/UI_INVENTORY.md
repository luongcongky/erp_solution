# Danh Sách Toàn Bộ UI Components - Antigravity ERP

> Tài liệu này liệt kê tất cả các UI components, pages và modules có trong hệ thống ERP Antigravity.
> 
> **Ngày tạo:** 2025-11-23  
> **Tổng số pages:** 56+  
> **Tổng số components:** 11

---

## 📦 Core Components

Các components dùng chung trong toàn bộ hệ thống, nằm trong thư mục `src/components/`:

### 1. **AuthProvider.js**
- **Mô tả:** Component quản lý authentication và authorization
- **Đường dẫn:** `src/components/AuthProvider.js`
- **Kích thước:** 4,089 bytes

### 2. **DashboardCard.js**
- **Mô tả:** Component card hiển thị thông tin trên dashboard
- **Đường dẫn:** `src/components/DashboardCard.js`
- **Kích thước:** 2,448 bytes

### 3. **DataTable.js**
- **Mô tả:** Component bảng dữ liệu với tính năng sắp xếp, lọc, phân trang
- **Đường dẫn:** `src/components/DataTable.js`
- **Kích thước:** 10,631 bytes

### 4. **Header.js**
- **Mô tả:** Component header chính của ứng dụng
- **Đường dẫn:** `src/components/Header.js`
- **Kích thước:** 7,162 bytes

### 5. **LanguageSwitcher.js**
- **Mô tả:** Component chuyển đổi ngôn ngữ (đa ngôn ngữ)
- **Đường dẫn:** `src/components/LanguageSwitcher.js`
- **Kích thước:** 7,669 bytes

### 6. **PageTemplate.js**
- **Mô tả:** Template layout cho các trang
- **Đường dẫn:** `src/components/PageTemplate.js`
- **Kích thước:** 4,531 bytes

### 7. **Sidebar.js**
- **Mô tả:** Component sidebar navigation menu
- **Đường dẫn:** `src/components/Sidebar.js`
- **Kích thước:** 11,319 bytes
- **Styles:** `Sidebar.module.css` (1,727 bytes)

### 8. **StatusBadge.js**
- **Mô tả:** Component hiển thị trạng thái dạng badge
- **Đường dẫn:** `src/components/StatusBadge.js`
- **Kích thước:** 1,322 bytes

### 9. **icons.js**
- **Mô tả:** Tập hợp các icon SVG dùng trong hệ thống
- **Đường dẫn:** `src/components/icons.js`
- **Kích thước:** 6,879 bytes

---

## 🏠 Main Pages

### Dashboard & Home
- **[Home/Dashboard](file:///c:/app/antigravity/src/app/page.js)** - `src/app/page.js`
- **[Dashboard](file:///c:/app/antigravity/src/app/dashboard/page.js)** - `src/app/dashboard/page.js`

### Authentication
- **[Auth/Login](file:///c:/app/antigravity/src/app/auth/page.js)** - `src/app/auth/page.js`

---

## 💼 Sales Module

Các trang quản lý bán hàng:

1. **[Sales Overview](file:///c:/app/antigravity/src/app/sales/page.js)** - `src/app/sales/page.js`
2. **[Leads](file:///c:/app/antigravity/src/app/leads/page.js)** - `src/app/leads/page.js`
3. **[Sales Leads](file:///c:/app/antigravity/src/app/sales/leads/page.js)** - `src/app/sales/leads/page.js`
4. **[Opportunities](file:///c:/app/antigravity/src/app/opportunities/page.js)** - `src/app/opportunities/page.js`
5. **[Sales Opportunities](file:///c:/app/antigravity/src/app/sales/opportunities/page.js)** - `src/app/sales/opportunities/page.js`
6. **[Customers](file:///c:/app/antigravity/src/app/customers/page.js)** - `src/app/customers/page.js`
7. **[Sales Customers](file:///c:/app/antigravity/src/app/sales/customers/page.js)** - `src/app/sales/customers/page.js`
8. **[Quotations](file:///c:/app/antigravity/src/app/sales/quotations/page.js)** - `src/app/sales/quotations/page.js`

---

## 🏭 Manufacturing Module

Các trang quản lý sản xuất:

1. **[Work Orders](file:///c:/app/antigravity/src/app/manufacturing/work-orders/page.js)** - `src/app/manufacturing/work-orders/page.js`
2. **[Bill of Materials (BOM)](file:///c:/app/antigravity/src/app/manufacturing/bom/page.js)** - `src/app/manufacturing/bom/page.js`
3. **[Routing](file:///c:/app/antigravity/src/app/manufacturing/routing/page.js)** - `src/app/manufacturing/routing/page.js`
4. **[Quality Control](file:///c:/app/antigravity/src/app/manufacturing/quality/page.js)** - `src/app/manufacturing/quality/page.js`

---

## 📦 Inventory Module

Các trang quản lý kho hàng:

1. **[Inventory Overview](file:///c:/app/antigravity/src/app/inventory/page.js)** - `src/app/inventory/page.js`
2. **[Stock Management](file:///c:/app/antigravity/src/app/inventory/stock/page.js)** - `src/app/inventory/stock/page.js`
3. **[Warehouses](file:///c:/app/antigravity/src/app/inventory/warehouses/page.js)** - `src/app/inventory/warehouses/page.js`
4. **[Stock Adjustments](file:///c:/app/antigravity/src/app/inventory/adjustments/page.js)** - `src/app/inventory/adjustments/page.js`
5. **[Stock Movements](file:///c:/app/antigravity/src/app/stock-movements/page.js)** - `src/app/stock-movements/page.js`

---

## 🛒 Purchase Module

Các trang quản lý mua hàng:

1. **[Purchase Orders](file:///c:/app/antigravity/src/app/purchase/orders/page.js)** - `src/app/purchase/orders/page.js`
2. **[Purchase Requests](file:///c:/app/antigravity/src/app/purchase/requests/page.js)** - `src/app/purchase/requests/page.js`
3. **[Purchase Requests (Alt)](file:///c:/app/antigravity/src/app/purchase-requests/page.js)** - `src/app/purchase-requests/page.js`
4. **[Request for Quotation (RFQ)](file:///c:/app/antigravity/src/app/purchase/rfq/page.js)** - `src/app/purchase/rfq/page.js`
5. **[Suppliers](file:///c:/app/antigravity/src/app/suppliers/page.js)** - `src/app/suppliers/page.js`
6. **[Purchase Suppliers](file:///c:/app/antigravity/src/app/purchase/suppliers/page.js)** - `src/app/purchase/suppliers/page.js`

---

## 👥 HR Module

Các trang quản lý nhân sự:

1. **[HR Overview](file:///c:/app/antigravity/src/app/hr/page.js)** - `src/app/hr/page.js`
2. **[Employees](file:///c:/app/antigravity/src/app/employees/page.js)** - `src/app/employees/page.js`
3. **[Attendance](file:///c:/app/antigravity/src/app/hr/attendance/page.js)** - `src/app/hr/attendance/page.js`
4. **[Leave Management](file:///c:/app/antigravity/src/app/hr/leave/page.js)** - `src/app/hr/leave/page.js`
5. **[Payroll](file:///c:/app/antigravity/src/app/hr/payroll/page.js)** - `src/app/hr/payroll/page.js`

---

## 💰 Finance Module

Các trang quản lý tài chính:

1. **[Finance Overview](file:///c:/app/antigravity/src/app/finance/page.js)** - `src/app/finance/page.js`
2. **[General Ledger](file:///c:/app/antigravity/src/app/finance/general-ledger/page.js)** - `src/app/finance/general-ledger/page.js`
3. **[Accounts Payable (AP)](file:///c:/app/antigravity/src/app/finance/ap/page.js)** - `src/app/finance/ap/page.js`
4. **[Accounts Receivable (AR)](file:///c:/app/antigravity/src/app/finance/ar/page.js)** - `src/app/finance/ar/page.js`
5. **[Bank Management](file:///c:/app/antigravity/src/app/finance/bank/page.js)** - `src/app/finance/bank/page.js`
6. **[Tax Management](file:///c:/app/antigravity/src/app/finance/tax/page.js)** - `src/app/finance/tax/page.js`
7. **[Invoices](file:///c:/app/antigravity/src/app/invoices/page.js)** - `src/app/invoices/page.js`
8. **[Expenses](file:///c:/app/antigravity/src/app/expenses/page.js)** - `src/app/expenses/page.js`

---

## 🛍️ E-commerce Module

Các trang quản lý thương mại điện tử:

1. **[Product Catalog](file:///c:/app/antigravity/src/app/ecommerce/catalog/page.js)** - `src/app/ecommerce/catalog/page.js`
2. **[E-commerce Orders](file:///c:/app/antigravity/src/app/ecommerce/orders/page.js)** - `src/app/ecommerce/orders/page.js`
3. **[Point of Sale (POS)](file:///c:/app/antigravity/src/app/ecommerce/pos/page.js)** - `src/app/ecommerce/pos/page.js`
4. **[Shopping Cart](file:///c:/app/antigravity/src/app/cart/page.js)** - `src/app/cart/page.js`

---

## 📦 Products Module

Các trang quản lý sản phẩm:

1. **[Products List](file:///c:/app/antigravity/src/app/products/page.js)** - `src/app/products/page.js`
2. **[Product Detail](file:///c:/app/antigravity/src/app/products/[id]/page.js)** - `src/app/products/[id]/page.js` (Dynamic route)

---

## 📋 Projects Module

Các trang quản lý dự án:

1. **[Projects](file:///c:/app/antigravity/src/app/projects/page.js)** - `src/app/projects/page.js`
2. **[Tasks](file:///c:/app/antigravity/src/app/tasks/page.js)** - `src/app/tasks/page.js`

---

## 🛠️ Service Module

Các trang quản lý dịch vụ:

1. **[Support Tickets](file:///c:/app/antigravity/src/app/support-tickets/page.js)** - `src/app/support-tickets/page.js`
2. **[Service Tickets](file:///c:/app/antigravity/src/app/service/tickets/page.js)** - `src/app/service/tickets/page.js`
3. **[SLA Management](file:///c:/app/antigravity/src/app/service/sla/page.js)** - `src/app/service/sla/page.js`
4. **[Warranty Management](file:///c:/app/antigravity/src/app/service/warranty/page.js)** - `src/app/service/warranty/page.js`

---

## ⚙️ Settings & Administration

Các trang cấu hình và quản trị:

1. **[Users Management](file:///c:/app/antigravity/src/app/users/page.js)** - `src/app/users/page.js`
2. **[Roles Management](file:///c:/app/antigravity/src/app/roles/page.js)** - `src/app/roles/page.js`
3. **[Menu Settings](file:///c:/app/antigravity/src/app/settings/menus/page.js)** - `src/app/settings/menus/page.js`
4. **[System Settings](file:///c:/app/antigravity/src/app/settings/system/page.js)** - `src/app/settings/system/page.js`
5. **[Audit Log](file:///c:/app/antigravity/src/app/audit/page.js)** - `src/app/audit/page.js`

---

## 🔌 API Routes

Hệ thống có 21 API routes trong thư mục `src/app/api/`:

### Authentication
- `api/auth/login/route.js` - API đăng nhập

### Sales APIs
- `api/sales/leads/route.js` - API quản lý leads
- `api/sales/opportunities/route.js` - API quản lý opportunities
- `api/sales/orders/route.js` - API quản lý đơn hàng

### HR APIs
- `api/hr/employees/route.js` - API quản lý nhân viên
- `api/hr/attendance/route.js` - API chấm công

### Inventory APIs
- `api/inventory/stock/route.js` - API quản lý tồn kho

### Manufacturing APIs
- `api/manufacturing/work-orders/route.js` - API lệnh sản xuất

### Purchase APIs
- `api/purchase/orders/route.js` - API đơn mua hàng

### Accounting APIs
- `api/accounting/invoices/route.js` - API hóa đơn

### Projects APIs
- `api/projects/route.js` - API dự án
- `api/projects/[id]/tasks/route.js` - API tasks của dự án

### System APIs
- `api/menus/route.js` - API menu hệ thống
- `api/menus/admin/route.js` - API menu admin
- `api/roles/route.js` - API vai trò
- `api/permissions/route.js` - API quyền hạn
- `api/partners/route.js` - API đối tác
- `api/languages/route.js` - API ngôn ngữ
- `api/translations/[locale]/route.js` - API dịch thuật

### Testing APIs
- `api/test/route.js` - API test
- `api/test-db/route.js` - API test database

---

## 📊 Tổng Kết

### Phân Loại Theo Module

| Module | Số Trang | Mô Tả |
|--------|----------|-------|
| **Sales** | 8 | Quản lý bán hàng, khách hàng, cơ hội |
| **Manufacturing** | 4 | Quản lý sản xuất, BOM, chất lượng |
| **Inventory** | 5 | Quản lý kho, tồn kho, xuất nhập |
| **Purchase** | 6 | Quản lý mua hàng, nhà cung cấp |
| **HR** | 5 | Quản lý nhân sự, chấm công, lương |
| **Finance** | 8 | Quản lý tài chính, kế toán |
| **E-commerce** | 4 | Thương mại điện tử, POS |
| **Products** | 2 | Quản lý sản phẩm |
| **Projects** | 2 | Quản lý dự án, công việc |
| **Service** | 4 | Quản lý dịch vụ, bảo hành |
| **Settings** | 5 | Cấu hình hệ thống |
| **Core** | 3 | Dashboard, Auth |

**Tổng cộng:** 56+ pages

### Core Components

| Component | Chức Năng Chính |
|-----------|-----------------|
| **AuthProvider** | Xác thực & phân quyền |
| **DataTable** | Hiển thị & quản lý dữ liệu dạng bảng |
| **Sidebar** | Navigation menu |
| **Header** | Header chính |
| **LanguageSwitcher** | Đa ngôn ngữ |
| **PageTemplate** | Layout template |
| **DashboardCard** | Card hiển thị metrics |
| **StatusBadge** | Hiển thị trạng thái |

---

## 🎨 Styling

- **Global Styles:** `src/app/globals.css` (6,316 bytes)
- **Page Styles:** `src/app/page.module.css` (2,426 bytes)
- **Sidebar Styles:** `src/components/Sidebar.module.css` (1,727 bytes)

---

## 📝 Ghi Chú

- Hệ thống sử dụng **Next.js App Router** (file-based routing)
- Các dynamic routes được đánh dấu bằng `[id]` hoặc `[locale]`
- Mỗi module có cấu trúc tương tự với overview page và các sub-pages
- API routes được tổ chức theo module tương ứng
- Hệ thống hỗ trợ đa ngôn ngữ (i18n) thông qua LanguageSwitcher và translations API

---

**Cập nhật lần cuối:** 2025-11-23  
**Người tạo:** Antigravity AI Assistant
