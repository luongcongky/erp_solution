import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

const Setting = sequelize.define('Setting', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    key: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    value: {
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
}, { tableName: 'settings', schema: 'core',
    timestamps: true,
    updatedAt: 'updated_at',
    createdAt: false,
    indexes: [
        { fields: ['key', 'ten_id', 'stg_id'], unique: true },
    ],
});

export default Setting;
