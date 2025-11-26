import { DataTypes } from 'sequelize';
import getSequelize from '../../config/database.js';

const sequelize = getSequelize();

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    sku: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    unit: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    ten_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    stg_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
}, {
    tableName: 'products',
    schema: 'core',
    timestamps: true,
    indexes: [
        { fields: ['sku'], unique: true },
        { fields: ['ten_id', 'stg_id'] },
        { fields: ['category'] },
        { fields: ['isActive'] },
    ],
});

export default Product;
