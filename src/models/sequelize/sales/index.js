// Sales/CRM Models
import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

export const Lead = sequelize.define('Lead', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    email: { type: DataTypes.STRING(255) },
    phone: { type: DataTypes.STRING(50) },
    company: { type: DataTypes.STRING(200) },
    source: { type: DataTypes.STRING(100) },
    status: { type: DataTypes.STRING(50), defaultValue: 'new' },
    assigned_to: { type: DataTypes.UUID },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'leads', schema: 'sales', timestamps: true });

export const Opportunity = sequelize.define('Opportunity', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    lead_id: { type: DataTypes.UUID },
    customer_id: { type: DataTypes.UUID },
    stage: { type: DataTypes.STRING(50), defaultValue: 'qualification' },
    probability: { type: DataTypes.DECIMAL(5, 2) },
    expected_revenue: { type: DataTypes.DECIMAL(18, 4) },
    expected_close_date: { type: DataTypes.DATEONLY },
    assigned_to: { type: DataTypes.UUID },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'opportunities', schema: 'sales', timestamps: true });

export const Quotation = sequelize.define('Quotation', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    customer_id: { type: DataTypes.UUID },
    opportunity_id: { type: DataTypes.UUID },
    quote_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    valid_until: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.STRING(50), defaultValue: 'draft' },
    currency: { type: DataTypes.STRING(10), defaultValue: 'VND' },
    total_amount: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
    metadata: { type: DataTypes.JSONB, defaultValue: {} },
}, { tableName: 'quotations', schema: 'sales', timestamps: true });

export const QuotationLine = sequelize.define('QuotationLine', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    quotation_id: { type: DataTypes.UUID, allowNull: false },
    product_id: { type: DataTypes.UUID },
    description: { type: DataTypes.TEXT },
    qty: { type: DataTypes.DECIMAL(18, 4), defaultValue: 1 },
    unit_price: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    discount: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    tax_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
}, { tableName: 'quotation_lines', schema: 'sales', timestamps: false });

export const SalesOrder = sequelize.define('SalesOrder', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    customer_id: { type: DataTypes.UUID },
    order_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.STRING(50), defaultValue: 'draft' },
    currency: { type: DataTypes.STRING(10), defaultValue: 'VND' },
    total_amount: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'sales_orders', schema: 'sales', timestamps: true });

export const SalesOrderLine = sequelize.define('SalesOrderLine', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    order_id: { type: DataTypes.UUID, allowNull: false },
    product_id: { type: DataTypes.UUID },
    description: { type: DataTypes.TEXT },
    qty: { type: DataTypes.DECIMAL(18, 4), defaultValue: 1 },
    unit_price: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    discount: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    tax_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
}, { tableName: 'sales_order_lines', schema: 'sales', timestamps: false });

export const CustomerActivity = sequelize.define('CustomerActivity', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    customer_id: { type: DataTypes.UUID, allowNull: false },
    activity_type: { type: DataTypes.STRING(50) },
    subject: { type: DataTypes.STRING(200) },
    description: { type: DataTypes.TEXT },
    activity_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    user_id: { type: DataTypes.UUID },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'customer_activities', schema: 'sales', timestamps: true, createdAt: 'created_at', updatedAt: false });
