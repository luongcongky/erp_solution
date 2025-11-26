import { DataTypes } from 'sequelize';
import getSequelize from '../../config/database.js';

const sequelize = getSequelize();

const Menu = sequelize.define('Menu', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    label: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    href: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    icon: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    parentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'menus',
            key: 'id',
        },
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 3,
        },
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    roles: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: ['user', 'admin'],
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
    tableName: 'menus',
    schema: 'core',
    timestamps: true,
    indexes: [
        { fields: ['parentId'] },
        { fields: ['ten_id', 'stg_id'] },
        { fields: ['level', 'order'] },
        { fields: ['isActive'] },
    ],
});

// Self-referential association for parent-child
Menu.hasMany(Menu, { as: 'children', foreignKey: 'parentId' });
Menu.belongsTo(Menu, { as: 'parent', foreignKey: 'parentId' });

export default Menu;
