import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    action: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    module: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    object_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    object_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    changes: {
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
}, { tableName: 'audit_logs', schema: 'core',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['ten_id', 'stg_id', 'created_at'] },
        { fields: ['object_type', 'object_id'] },
    ],
});

export default AuditLog;
