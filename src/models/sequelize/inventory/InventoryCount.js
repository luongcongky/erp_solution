import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

const InventoryCount = sequelize.define('InventoryCount', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    warehouse_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    count_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
    },
    reference: {
        type: DataTypes.STRING(100),
        comment: 'Reference number for the count session',
    },
    status: {
        type: DataTypes.ENUM('draft', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'draft',
    },
    notes: {
        type: DataTypes.TEXT,
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
    tableName: 'inventory_counts',
    schema: 'inventory',
    timestamps: true,
    indexes: [
        { fields: ['warehouse_id'] },
        { fields: ['count_date'] },
        { fields: ['ten_id', 'stg_id'] },
    ],
});

export default InventoryCount;
