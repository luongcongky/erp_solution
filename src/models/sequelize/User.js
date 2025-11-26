import { DataTypes } from 'sequelize';
import getSequelize from '../../config/database.js';

const sequelize = getSequelize();

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    firstName: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    lastName: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    role: {
        type: DataTypes.STRING(50),
        defaultValue: 'user',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    ten_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    stg_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
}, {
    tableName: 'users',
    schema: 'core',
    timestamps: true,
    indexes: [
        { fields: ['email'] },
        { fields: ['ten_id', 'stg_id'] },
        { fields: ['role'] },
    ],
});

export default User;
