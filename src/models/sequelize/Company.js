import { DataTypes } from 'sequelize';
import getSequelize from '../../config/database.js';

const sequelize = getSequelize();

const Company = sequelize.define('Company', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    ten_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: 'tenant_stage_unique',
    },
    stg_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: 'tenant_stage_unique',
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            isEmail: true,
        },
    },
    settings: {
        type: DataTypes.JSON,
        defaultValue: {},
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'companies',
    schema: 'core',
    timestamps: true,
    indexes: [
        { fields: ['ten_id', 'stg_id'], unique: true },
        { fields: ['isActive'] },
    ],
});

export default Company;
