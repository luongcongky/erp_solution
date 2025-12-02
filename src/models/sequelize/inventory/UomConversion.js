import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

const UomConversion = sequelize.define('UomConversion', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    item_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'If null, applies globally to all items (e.g. kg to g)',
    },
    from_uom: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    to_uom: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    factor: {
        type: DataTypes.DECIMAL(18, 6),
        allowNull: false,
        comment: 'Multiplier: 1 from_uom = factor * to_uom',
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
    tableName: 'uom_conversions',
    schema: 'inventory',
    timestamps: true,
    indexes: [
        { fields: ['item_id', 'from_uom', 'to_uom'], unique: true },
        { fields: ['ten_id', 'stg_id'] },
    ],
});

export default UomConversion;
