import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

const Location = sequelize.define('Location', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    warehouse_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'Belongs to which warehouse',
    },
    parent_location_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'Parent location for hierarchy (e.g., Zone A -> Rack 1)',
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('view', 'internal', 'customer', 'supplier', 'loss', 'production'),
        defaultValue: 'internal',
        comment: 'view=folder/category, internal=physical storage',
    },
    path: {
        type: DataTypes.STRING(500),
        comment: 'Materialized path for fast tree traversal e.g. /WH1/ZONE-A/RACK-1',
    },
    meta: {
        type: DataTypes.JSONB,
        defaultValue: {},
    },
    ten_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    stg_id: {
        type: DataTypes.STRING(20),
        defaultValue: 'DEV',
    },
}, {
    tableName: 'locations',
    schema: 'inventory',
    timestamps: true,
    indexes: [
        { fields: ['warehouse_id'] },
        { fields: ['parent_location_id'] },
        { fields: ['ten_id', 'stg_id'] },
    ],
});

export default Location;
