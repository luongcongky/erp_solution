import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

const UserRole = sequelize.define('UserRole', {
    user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    role_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
            model: 'roles',
            key: 'id'
        }
    },
    ten_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: '1000'
    },
    stg_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'DEV'
    }
}, {
    tableName: 'user_roles',
    schema: 'core',
    timestamps: true,
    indexes: [
        { fields: ['ten_id', 'stg_id'] }
    ]
});

export default UserRole;
