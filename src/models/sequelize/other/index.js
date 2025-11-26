// Projects, Service, and E-commerce Models
import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

// PROJECTS MODULE
export const Project = sequelize.define('Project', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    code: { type: DataTypes.STRING(50), allowNull: false },
    description: { type: DataTypes.TEXT },
    customer_id: { type: DataTypes.UUID },
    manager_id: { type: DataTypes.UUID },
    start_date: { type: DataTypes.DATEONLY },
    end_date: { type: DataTypes.DATEONLY },
    budget: { type: DataTypes.DECIMAL(18, 4) },
    status: { type: DataTypes.STRING(50), defaultValue: 'planning' },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'projects', schema: 'projects', timestamps: true });

export const Milestone = sequelize.define('Milestone', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    project_id: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING(200), allowNull: false },
    due_date: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.STRING(50), defaultValue: 'pending' },
}, { tableName: 'milestones', schema: 'projects', timestamps: true, createdAt: 'created_at', updatedAt: false });

export const Task = sequelize.define('Task', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    project_id: { type: DataTypes.UUID, allowNull: false },
    milestone_id: { type: DataTypes.UUID },
    name: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT },
    assignee: { type: DataTypes.UUID },
    status: { type: DataTypes.STRING(50), defaultValue: 'todo' },
    priority: { type: DataTypes.STRING(50) },
    estimate_hours: { type: DataTypes.DECIMAL(8, 2) },
    spent_hours: { type: DataTypes.DECIMAL(8, 2), defaultValue: 0 },
    start_date: { type: DataTypes.DATEONLY },
    due_date: { type: DataTypes.DATEONLY },
}, { tableName: 'tasks', schema: 'projects', timestamps: true });

export const Timesheet = sequelize.define('Timesheet', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    employee_id: { type: DataTypes.UUID, allowNull: false },
    project_id: { type: DataTypes.UUID },
    task_id: { type: DataTypes.UUID },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    hours: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
    description: { type: DataTypes.TEXT },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'timesheets', schema: 'projects', timestamps: true, createdAt: 'created_at', updatedAt: false });

export const ProjectCost = sequelize.define('ProjectCost', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    project_id: { type: DataTypes.UUID, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    category: { type: DataTypes.STRING(100) },
    amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false },
    description: { type: DataTypes.TEXT },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'project_costs', schema: 'projects', timestamps: true, createdAt: 'created_at', updatedAt: false });

// SERVICE MODULE
export const Ticket = sequelize.define('Ticket', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    ticket_number: { type: DataTypes.STRING(100), allowNull: false },
    customer_id: { type: DataTypes.UUID },
    subject: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT },
    priority: { type: DataTypes.STRING(50), defaultValue: 'medium' },
    status: { type: DataTypes.STRING(50), defaultValue: 'new' },
    assignee: { type: DataTypes.UUID },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'tickets', schema: 'service', timestamps: true });

export const SLA = sequelize.define('SLA', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    priority: { type: DataTypes.STRING(50) },
    response_time_hours: { type: DataTypes.INTEGER },
    resolution_time_hours: { type: DataTypes.INTEGER },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'slas', schema: 'service', timestamps: true, createdAt: 'created_at', updatedAt: false });

export const Warranty = sequelize.define('Warranty', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    product_id: { type: DataTypes.UUID },
    customer_id: { type: DataTypes.UUID },
    serial_number: { type: DataTypes.STRING(100) },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY, allowNull: false },
    terms: { type: DataTypes.TEXT },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'warranties', schema: 'service', timestamps: true, createdAt: 'created_at', updatedAt: false });

export const MaintenanceLog = sequelize.define('MaintenanceLog', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    ticket_id: { type: DataTypes.UUID },
    warranty_id: { type: DataTypes.UUID },
    service_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    technician: { type: DataTypes.UUID },
    work_performed: { type: DataTypes.TEXT },
    parts_used: { type: DataTypes.JSONB },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'maintenance_logs', schema: 'service', timestamps: true, createdAt: 'created_at', updatedAt: false });

// E-COMMERCE/POS MODULE
export const POSSession = sequelize.define('POSSession', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    user_id: { type: DataTypes.UUID },
    start_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    end_time: { type: DataTypes.DATE },
    opening_balance: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    closing_balance: { type: DataTypes.DECIMAL(18, 4) },
    status: { type: DataTypes.STRING(50), defaultValue: 'open' },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'pos_sessions', schema: 'ecommerce', timestamps: true, createdAt: 'created_at', updatedAt: false });

export const POSOrder = sequelize.define('POSOrder', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    order_number: { type: DataTypes.STRING(100), allowNull: false },
    session_id: { type: DataTypes.UUID },
    customer_id: { type: DataTypes.UUID },
    order_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    total_amount: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    payment_method: { type: DataTypes.STRING(50) },
    status: { type: DataTypes.STRING(50), defaultValue: 'completed' },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'pos_orders', schema: 'ecommerce', timestamps: true, createdAt: 'created_at', updatedAt: false });

export const POSOrderLine = sequelize.define('POSOrderLine', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    order_id: { type: DataTypes.UUID, allowNull: false },
    product_id: { type: DataTypes.UUID },
    qty: { type: DataTypes.DECIMAL(18, 4), defaultValue: 1 },
    unit_price: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    discount: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
}, { tableName: 'pos_order_lines', schema: 'ecommerce', timestamps: false });

export const OnlineOrder = sequelize.define('OnlineOrder', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    order_number: { type: DataTypes.STRING(100), allowNull: false },
    customer_id: { type: DataTypes.UUID },
    order_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    shipping_address: { type: DataTypes.JSONB },
    total_amount: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    payment_status: { type: DataTypes.STRING(50), defaultValue: 'pending' },
    fulfillment_status: { type: DataTypes.STRING(50), defaultValue: 'pending' },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'online_orders', schema: 'ecommerce', timestamps: true });

export const OnlineOrderLine = sequelize.define('OnlineOrderLine', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    order_id: { type: DataTypes.UUID, allowNull: false },
    product_id: { type: DataTypes.UUID },
    qty: { type: DataTypes.DECIMAL(18, 4), defaultValue: 1 },
    unit_price: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
}, { tableName: 'online_order_lines', schema: 'ecommerce', timestamps: false });

export const Cart = sequelize.define('Cart', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    session_id: { type: DataTypes.STRING(255) },
    customer_id: { type: DataTypes.UUID },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'carts', schema: 'ecommerce', timestamps: true });

export const CartItem = sequelize.define('CartItem', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    cart_id: { type: DataTypes.UUID, allowNull: false },
    product_id: { type: DataTypes.UUID },
    qty: { type: DataTypes.DECIMAL(18, 4), defaultValue: 1 },
}, { tableName: 'cart_items', schema: 'ecommerce', timestamps: false });
