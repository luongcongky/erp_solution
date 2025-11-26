import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

const Approval = sequelize.define('Approval', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    workflow_instance_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    approver_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    step_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'pending',
    },
    approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    comments: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, { tableName: 'approvals', schema: 'core',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        { fields: ['workflow_instance_id'] },
        { fields: ['approver_id', 'status'] },
    ],
});

export default Approval;
