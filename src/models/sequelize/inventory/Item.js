import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

const Item = sequelize.define('Item', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    sku: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    item_type: {
        type: DataTypes.ENUM('raw_material', 'semi_finished', 'finished', 'service'),
        defaultValue: 'finished',
    },
    base_uom: {
        type: DataTypes.STRING(20),
        defaultValue: 'pcs',
        comment: 'Base Unit of Measure',
    },
    attributes: {
        type: DataTypes.JSONB,
        defaultValue: {},
        comment: 'Flexible attributes like color, size, material',
    },
    tracking: {
        type: DataTypes.ENUM('none', 'batch', 'serial'),
        defaultValue: 'none',
    },
    expiry_control: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    min_stock: {
        type: DataTypes.DECIMAL(18, 4),
        defaultValue: 0,
    },
    max_stock: {
        type: DataTypes.DECIMAL(18, 4),
        defaultValue: 0,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
    tableName: 'items',
    schema: 'inventory',
    timestamps: true,
    indexes: [
        { fields: ['sku', 'ten_id'], unique: true },
        { fields: ['item_type'] },
        { fields: ['ten_id', 'stg_id'] },
    ],
});

export default Item;
