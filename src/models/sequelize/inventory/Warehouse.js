import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

const Warehouse = sequelize.define('Warehouse', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    address: {
        type: DataTypes.JSONB,
        comment: 'Address details: street, city, country, etc.',
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
    tableName: 'warehouses',
    schema: 'inventory',
    timestamps: true,
    indexes: [
        { fields: ['code', 'ten_id'], unique: true },
        { fields: ['ten_id', 'stg_id'] },
    ],
});

export default Warehouse;
