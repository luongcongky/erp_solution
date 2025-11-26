import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

const WorkflowInstance = sequelize.define('WorkflowInstance', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    workflow_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    object_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    object_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'pending',
    },
    current_step: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    data: {
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
}, { tableName: 'workflow_instances', schema: 'core',
    timestamps: true,
    indexes: [
        { fields: ['workflow_id'] },
        { fields: ['object_type', 'object_id'] },
        { fields: ['status'] },
    ],
});

export default WorkflowInstance;
