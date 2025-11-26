import { DataTypes } from 'sequelize';
import getSequelize from '../../config/database.js';

const sequelize = getSequelize();

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    orderNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    customerId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    customerName: {
        type: DataTypes.STRING(200),
        allowNull: true,
    },
    items: {
        type: DataTypes.JSON,
        defaultValue: [],
    },
    totalAmount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending',
    },
    orderDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
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
    tableName: 'orders',
    schema: 'sales',
    timestamps: true,
    indexes: [
        { fields: ['orderNumber'], unique: true },
        { fields: ['customerId'] },
        { fields: ['ten_id', 'stg_id'] },
        { fields: ['status'] },
        { fields: ['orderDate'] },
    ],
});

export default Order;
