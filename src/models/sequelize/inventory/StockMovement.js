import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

const StockMovement = sequelize.define('StockMovement', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    movement_type: {
        type: DataTypes.ENUM('receipt', 'delivery', 'internal', 'adjustment', 'production'),
        allowNull: false,
    },
    reference: {
        type: DataTypes.STRING(100),
        comment: 'PO Number, SO Number, MO Number, etc.',
    },
    item_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    lot_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    from_warehouse_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    from_location_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    to_warehouse_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    to_location_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    quantity: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
    },
    uom: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('draft', 'confirmed', 'done', 'cancelled'),
        defaultValue: 'draft',
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    meta: {
        type: DataTypes.JSONB,
        defaultValue: {},
    },
    ten_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    stg_id: {
        type: DataTypes.STRING(20),
        defaultValue: 'DEV',
    },
}, {
    tableName: 'stock_movements',
    schema: 'inventory',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['item_id'] },
        { fields: ['reference'] },
        { fields: ['date'] },
        { fields: ['ten_id', 'stg_id'] },
    ],
});

export default StockMovement;
