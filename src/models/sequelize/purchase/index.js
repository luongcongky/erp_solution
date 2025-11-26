// Purchase Models
import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

export const PurchaseRequest = sequelize.define('PurchaseRequest', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    requested_by: { type: DataTypes.UUID },
    request_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    required_date: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.STRING(50), defaultValue: 'draft' },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
    metadata: { type: DataTypes.JSONB, defaultValue: {} },
}, { tableName: 'purchase_requests', schema: 'purchase', timestamps: true });

export const PurchaseRequestLine = sequelize.define('PurchaseRequestLine', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    request_id: { type: DataTypes.UUID, allowNull: false },
    product_id: { type: DataTypes.UUID },
    description: { type: DataTypes.TEXT },
    qty: { type: DataTypes.DECIMAL(18, 4), defaultValue: 1 },
    estimated_price: { type: DataTypes.DECIMAL(18, 4) },
}, { tableName: 'purchase_request_lines', schema: 'purchase', timestamps: false });

export const RFQ = sequelize.define('RFQ', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    supplier_id: { type: DataTypes.UUID },
    rfq_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    deadline: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.STRING(50), defaultValue: 'draft' },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
    metadata: { type: DataTypes.JSONB, defaultValue: {} },
}, { tableName: 'rfqs', schema: 'purchase', timestamps: true });

export const RFQLine = sequelize.define('RFQLine', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    rfq_id: { type: DataTypes.UUID, allowNull: false },
    product_id: { type: DataTypes.UUID },
    description: { type: DataTypes.TEXT },
    qty: { type: DataTypes.DECIMAL(18, 4), defaultValue: 1 },
    unit_price: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
}, { tableName: 'rfq_lines', schema: 'purchase', timestamps: false });

export const PurchaseOrder = sequelize.define('PurchaseOrder', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    supplier_id: { type: DataTypes.UUID },
    order_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.STRING(50), defaultValue: 'draft' },
    currency: { type: DataTypes.STRING(10), defaultValue: 'VND' },
    total_amount: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'purchase_orders', schema: 'purchase', timestamps: true });

export const PurchaseOrderLine = sequelize.define('PurchaseOrderLine', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    purchase_id: { type: DataTypes.UUID, allowNull: false },
    product_id: { type: DataTypes.UUID },
    description: { type: DataTypes.TEXT },
    qty: { type: DataTypes.DECIMAL(18, 4), defaultValue: 1 },
    unit_price: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    tax_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
}, { tableName: 'purchase_order_lines', schema: 'purchase', timestamps: false });

export const SupplierEvaluation = sequelize.define('SupplierEvaluation', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    supplier_id: { type: DataTypes.UUID, allowNull: false },
    evaluation_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    quality_score: { type: DataTypes.DECIMAL(3, 1) },
    delivery_score: { type: DataTypes.DECIMAL(3, 1) },
    price_score: { type: DataTypes.DECIMAL(3, 1) },
    overall_score: { type: DataTypes.DECIMAL(3, 1) },
    comments: { type: DataTypes.TEXT },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'supplier_evaluations', schema: 'purchase', timestamps: true, createdAt: 'created_at', updatedAt: false });
