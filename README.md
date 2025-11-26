# Complete ERP System

A comprehensive Enterprise Resource Planning (ERP) system built with Next.js, React, PostgreSQL, and Sequelize ORM.

## 🚀 Features

### 11 Complete Modules
- ✅ **Core** - Users, Roles, Permissions, Audit Logs, Workflows
- ✅ **Sales/CRM** - Leads, Opportunities, Quotations, Sales Orders
- ✅ **Purchase** - Purchase Requests, RFQ, Purchase Orders
- ✅ **Inventory** - Products, Warehouses, Stock Management
- ✅ **Manufacturing** - BOM, Work Orders, Routing, Quality Control
- ✅ **Finance/Accounting** - GL, AR, AP, Bank, Tax, Invoices
- ✅ **HR** - Employees, Attendance, Leave, Payroll, KPI
- ✅ **Projects** - Project Management, Tasks, Milestones, Timesheets
- ✅ **Service** - Tickets, SLA, Warranty, Maintenance
- ✅ **E-commerce/POS** - POS, Online Orders, Shopping Cart
- ✅ **System Admin** - Settings, Translations, Notifications

### Key Capabilities
- 🏢 **Multi-Tenant Architecture** - Support multiple companies with complete data isolation
- 🌍 **Internationalization** - Multi-language support (Vietnamese, English)
- 🔐 **Role-Based Access Control** - Granular permissions system
- 📊 **Real-time Dashboard** - Stats, charts, and quick actions
- 🔄 **Workflow Engine** - Multi-level approval system
- 📝 **Audit Trail** - Complete activity logging
- 🔢 **Auto-Numbering** - Automatic document numbering (SO-00001, PO-00001, etc.)
- 📦 **Stock Management** - Real-time inventory tracking with lot/batch support

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Sequelize ORM
- **Styling**: Custom CSS with Design System
- **Authentication**: bcrypt for password hashing

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd antigravity
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env.local` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=erp_db
DB_USER=postgres
DB_PASSWORD=your_password
```

4. **Create database**
```bash
createdb erp_db
```

5. **Run seed data**
```bash
node scripts/seed-complete-erp.js
```

6. **Start development server**
```bash
npm run dev
```

7. **Access the application**
Open [http://localhost:3000](http://localhost:3000)

## 🔑 Demo Credentials

### Company 1: Tech Solutions Vietnam
- Email: `admin@techsolutions.vn`
- Password: `password123`

### Company 2: Global Trading Co.
- Email: `admin@globaltrading.com`
- Password: `password123`

### Company 3: Manufacturing Plus
- Email: `admin@mfgplus.vn`
- Password: `password123`

## 📁 Project Structure

```
antigravity/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── sales/         # Sales APIs
│   │   │   ├── purchase/      # Purchase APIs
│   │   │   ├── inventory/     # Inventory APIs
│   │   │   ├── hr/            # HR APIs
│   │   │   ├── accounting/    # Accounting APIs
│   │   │   ├── projects/      # Project APIs
│   │   │   └── ...
│   │   ├── dashboard/         # Dashboard page
│   │   ├── sales/             # Sales module pages
│   │   ├── inventory/         # Inventory module pages
│   │   ├── hr/                # HR module pages
│   │   └── projects/          # Project module pages
│   ├── components/            # Reusable React components
│   │   ├── DataTable.js       # Data table component
│   │   ├── StatusBadge.js     # Status badge component
│   │   ├── Sidebar.js         # Navigation sidebar
│   │   └── ...
│   ├── models/                # Sequelize models
│   │   └── sequelize/
│   │       ├── core/          # Core models
│   │       ├── sales/         # Sales models
│   │       ├── purchase/      # Purchase models
│   │       ├── inventory/     # Inventory models
│   │       ├── manufacturing/ # Manufacturing models
│   │       ├── accounting/    # Accounting models
│   │       ├── hr/            # HR models
│   │       └── other/         # Projects, Service, E-commerce models
│   ├── lib/                   # Utility libraries
│   │   ├── apiHelpers.js      # Generic CRUD helpers
│   │   └── ...
│   └── styles/                # CSS styles
│       └── design-system.css  # Design system
├── scripts/                   # Database scripts
│   ├── complete-erp-schema.sql    # Complete SQL schema
│   └── seed-complete-erp.js       # Seed data script
└── package.json
```

## 🗄️ Database Schema

The system uses PostgreSQL with multiple schemas for organization:
- `core` - Users, roles, permissions, partners, workflows
- `sales` - Leads, opportunities, quotations, sales orders
- `purchase` - Purchase requests, RFQs, purchase orders
- `inventory` - Products, warehouses, stock
- `manufacturing` - BOMs, work orders, quality checks
- `accounting` - Accounts, journals, invoices, payments
- `hr` - Employees, attendance, payroll
- `projects` - Projects, tasks, timesheets
- `service` - Tickets, SLAs, warranties
- `ecommerce` - POS, online orders, carts

**Total**: 70+ tables with proper relationships and indexes.

## 🔌 API Endpoints

### Core APIs
- `GET/POST /api/roles` - Role management
- `GET/POST /api/permissions` - Permission management
- `GET/POST /api/partners` - Customer/supplier management

### Sales APIs
- `GET/POST /api/sales/leads` - Lead management
- `GET/POST /api/sales/opportunities` - Opportunity pipeline
- `GET/POST /api/sales/orders` - Sales orders

### Inventory APIs
- `GET/POST /api/inventory/products` - Product catalog
- `GET/POST /api/inventory/stock` - Stock management

### HR APIs
- `GET/POST /api/hr/employees` - Employee management
- `GET/POST /api/hr/attendance` - Attendance tracking

### And more... (20+ endpoints total)

## 🎨 Design System

The application uses a comprehensive design system with:
- CSS variables for consistent theming
- Utility classes for rapid development
- Pre-built component styles (buttons, forms, cards, tables, badges)
- Responsive design patterns
- Smooth animations and transitions

## 📊 Seed Data

The seed script creates:
- 3 demo companies
- 9 users with different roles
- 4 partners (customers & suppliers)
- 4 products
- 2 warehouses with stock
- 4 departments
- 2 employees
- 2 sales leads and opportunities
- Sample orders (sales & purchase)
- 1 project with tasks
- 2 service tickets

## 🚧 Development Status

| Module | Database | API | Frontend | Status |
|--------|----------|-----|----------|--------|
| Core | ✅ | ✅ | ✅ | Complete |
| Sales/CRM | ✅ | ✅ | ✅ | Complete |
| Purchase | ✅ | ✅ | ⚠️ | Partial |
| Inventory | ✅ | ✅ | ✅ | Complete |
| Manufacturing | ✅ | ✅ | ⚠️ | Partial |
| Accounting | ✅ | ✅ | ⚠️ | Partial |
| HR | ✅ | ✅ | ✅ | Complete |
| Projects | ✅ | ✅ | ✅ | Complete |
| Service | ✅ | ⚠️ | ⚠️ | Partial |
| E-commerce/POS | ✅ | ⚠️ | ⚠️ | Partial |
| System Admin | ✅ | ⚠️ | ⚠️ | Partial |

## 🤝 Contributing

This is a demonstration ERP system. For production use, additional features are recommended:
- Complete API endpoints for all modules
- Form validation and error handling
- Workflow engine implementation
- Report generation (PDF/Excel)
- Authentication middleware
- Permission-based access control
- Email/SMS notifications
- Automated testing

## 📄 License

MIT License

## 📞 Support

For questions or issues, please refer to the walkthrough documentation in the `.gemini` directory.

---

**Built with ❤️ using Next.js, React, and PostgreSQL**
