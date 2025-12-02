import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

const StockLot = sequelize.define('StockLot', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    lot_number: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    item_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    manufacture_date: {
        type: DataTypes.DATEONLY,
    },
    expiry_date: {
        type: DataTypes.DATEONLY,
    },
    supplier_lot: {
        type: DataTypes.STRING(100),
        comment: 'Lot number from supplier',
    },
    status: {
        type: DataTypes.ENUM('active', 'on_hold', 'rejected', 'expired'),
        defaultValue: 'active',
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
    tableName: 'stock_lots',
    schema: 'inventory',
    timestamps: true,
    indexes: [
        { fields: ['item_id', 'lot_number'], unique: true },
        { fields: ['expiry_date'] },
        { fields: ['ten_id', 'stg_id'] },
    ],
});

export default StockLot;
