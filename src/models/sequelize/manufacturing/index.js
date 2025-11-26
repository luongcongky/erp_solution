// Manufacturing Models
import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

export const BOM = sequelize.define('BOM', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    product_id: { type: DataTypes.UUID },
    quantity: { type: DataTypes.DECIMAL(18, 4), defaultValue: 1 },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'boms', schema: 'manufacturing', timestamps: true });

export const BOMLine = sequelize.define('BOMLine', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    bom_id: { type: DataTypes.UUID, allowNull: false },
    product_id: { type: DataTypes.UUID },
    quantity: { type: DataTypes.DECIMAL(18, 4), defaultValue: 1 },
    uom: { type: DataTypes.STRING(20), defaultValue: 'pcs' },
}, { tableName: 'bom_lines', schema: 'manufacturing', timestamps: false });

export const Routing = sequelize.define('Routing', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    product_id: { type: DataTypes.UUID },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'routings', schema: 'manufacturing', timestamps: true, createdAt: 'created_at', updatedAt: false });

export const RoutingStep = sequelize.define('RoutingStep', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    routing_id: { type: DataTypes.UUID, allowNull: false },
    sequence: { type: DataTypes.INTEGER },
    operation: { type: DataTypes.STRING(200) },
    work_center: { type: DataTypes.STRING(100) },
    duration_minutes: { type: DataTypes.INTEGER },
}, { tableName: 'routing_steps', schema: 'manufacturing', timestamps: false });

export const WorkOrder = sequelize.define('WorkOrder', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    product_id: { type: DataTypes.UUID },
    bom_id: { type: DataTypes.UUID },
    quantity: { type: DataTypes.DECIMAL(18, 4), defaultValue: 1 },
    planned_start: { type: DataTypes.DATE },
    planned_end: { type: DataTypes.DATE },
    actual_start: { type: DataTypes.DATE },
    actual_end: { type: DataTypes.DATE },
    status: { type: DataTypes.STRING(50), defaultValue: 'draft' },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'work_orders', schema: 'manufacturing', timestamps: true });

export const WorkOrderLine = sequelize.define('WorkOrderLine', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    work_order_id: { type: DataTypes.UUID, allowNull: false },
    product_id: { type: DataTypes.UUID },
    required_qty: { type: DataTypes.DECIMAL(18, 4) },
    consumed_qty: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
}, { tableName: 'work_order_lines', schema: 'manufacturing', timestamps: false });

export const QualityCheck = sequelize.define('QualityCheck', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    work_order_id: { type: DataTypes.UUID },
    check_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    inspector: { type: DataTypes.UUID },
    result: { type: DataTypes.STRING(50) },
    notes: { type: DataTypes.TEXT },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'quality_checks', schema: 'manufacturing', timestamps: true, createdAt: 'created_at', updatedAt: false });
