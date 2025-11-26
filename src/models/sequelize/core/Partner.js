import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

const Partner = sequelize.define('Partner', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    partner_type: {
        type: DataTypes.ENUM('customer', 'supplier', 'employee', 'other'),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            isEmail: true,
        },
    },
    phone: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    tax_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    billing_address: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    shipping_address: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    ten_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    stg_id: {
        type: DataTypes.STRING(20),
        defaultValue: 'DEV',
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
    },
}, { tableName: 'partners', schema: 'core',
    timestamps: true,
    indexes: [
        { fields: ['partner_type', 'ten_id', 'stg_id'] },
        { fields: ['email'] },
        { fields: ['ten_id', 'stg_id'] },
    ],
});

export default Partner;
