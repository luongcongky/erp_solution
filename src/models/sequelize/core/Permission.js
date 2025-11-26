import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

const Permission = sequelize.define('Permission', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    module: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    action: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, { tableName: 'permissions', schema: 'core',
    timestamps: false,
    indexes: [
        { fields: ['module'] },
        { fields: ['key'], unique: true },
    ],
});

export default Permission;
