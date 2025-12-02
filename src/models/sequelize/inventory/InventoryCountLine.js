import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

const InventoryCountLine = sequelize.define('InventoryCountLine', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    inventory_count_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    item_id: {
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
    system_qty: {
        type: DataTypes.DECIMAL(18, 4),
        defaultValue: 0,
        comment: 'Quantity in system at the time of snapshot',
    },
    counted_qty: {
        type: DataTypes.DECIMAL(18, 4),
        defaultValue: 0,
        comment: 'Actual physical quantity counted',
    },
    difference: {
        type: DataTypes.DECIMAL(18, 4),
        defaultValue: 0,
        comment: 'counted_qty - system_qty',
    },
}, {
    tableName: 'inventory_count_lines',
    schema: 'inventory',
    timestamps: false,
    indexes: [
        { fields: ['inventory_count_id'] },
        { fields: ['item_id'] },
    ],
});

export default InventoryCountLine;
