import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

const Workflow = sequelize.define('Workflow', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    module: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    trigger_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    definition: {
        type: DataTypes.JSONB,
        allowNull: false,
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
}, { tableName: 'workflows', schema: 'core',
    timestamps: true,
    indexes: [
        { fields: ['module', 'ten_id', 'stg_id'] },
        { fields: ['is_active'] },
    ],
});

export default Workflow;
