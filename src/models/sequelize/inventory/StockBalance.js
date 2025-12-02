import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

const StockBalance = sequelize.define('StockBalance', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    item_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    warehouse_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    location_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    lot_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    quantity: {
        type: DataTypes.DECIMAL(18, 4),
        defaultValue: 0,
        allowNull: false,
    },
    reserved_quantity: {
        type: DataTypes.DECIMAL(18, 4),
        defaultValue: 0,
        comment: 'Quantity reserved for outgoing orders',
    },
    uom: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    last_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
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
    tableName: 'stock_balances',
    schema: 'inventory',
    timestamps: false, // We manage last_updated manually or via triggers
    indexes: [
        { fields: ['item_id', 'location_id', 'lot_id'], unique: true },
        { fields: ['warehouse_id'] },
        { fields: ['ten_id', 'stg_id'] },
    ],
});

export default StockBalance;
