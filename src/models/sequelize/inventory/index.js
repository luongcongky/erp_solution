// Inventory Models
import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

export const Product = sequelize.define('Product', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    sku: { type: DataTypes.STRING(100) },
    name: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT },
    product_type: { type: DataTypes.STRING(50), defaultValue: 'stockable' },
    uom: { type: DataTypes.STRING(20), defaultValue: 'pcs' },
    cost: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    price: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    barcode: { type: DataTypes.STRING(100) },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'products', schema: 'inventory', timestamps: true });

export const Warehouse = sequelize.define('Warehouse', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    code: { type: DataTypes.STRING(50), allowNull: false },
    name: { type: DataTypes.STRING(200), allowNull: false },
    address: { type: DataTypes.JSONB },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'warehouses', schema: 'inventory', timestamps: true });

export const StockQuant = sequelize.define('StockQuant', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    product_id: { type: DataTypes.UUID, allowNull: false },
    warehouse_id: { type: DataTypes.UUID, allowNull: false },
    lot: { type: DataTypes.STRING(100) },
    quantity: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    reserved: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'stock_quant', schema: 'inventory', timestamps: true, createdAt: false, updatedAt: 'updated_at' });

export const StockMove = sequelize.define('StockMove', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    product_id: { type: DataTypes.UUID, allowNull: false },
    from_warehouse: { type: DataTypes.UUID },
    to_warehouse: { type: DataTypes.UUID },
    quantity: { type: DataTypes.DECIMAL(18, 4), allowNull: false },
    uom: { type: DataTypes.STRING(20), defaultValue: 'pcs' },
    move_type: { type: DataTypes.STRING(50) },
    reference: { type: DataTypes.STRING(100) },
    lot: { type: DataTypes.STRING(100) },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'stock_moves', schema: 'inventory', timestamps: true, createdAt: 'created_at', updatedAt: false });

export const StockAdjustment = sequelize.define('StockAdjustment', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    warehouse_id: { type: DataTypes.UUID },
    adjustment_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    reason: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING(50), defaultValue: 'draft' },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'stock_adjustments', schema: 'inventory', timestamps: true });

export const StockAdjustmentLine = sequelize.define('StockAdjustmentLine', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    adjustment_id: { type: DataTypes.UUID, allowNull: false },
    product_id: { type: DataTypes.UUID },
    lot: { type: DataTypes.STRING(100) },
    counted_qty: { type: DataTypes.DECIMAL(18, 4) },
    system_qty: { type: DataTypes.DECIMAL(18, 4) },
}, { tableName: 'stock_adjustment_lines', schema: 'inventory', timestamps: false });
