import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

const Translation = sequelize.define('Translation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    object_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    object_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    locale: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    key: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, { tableName: 'translations', schema: 'core',
    timestamps: false,
    indexes: [
        { fields: ['object_type', 'object_id', 'locale', 'key'], unique: true },
        { fields: ['locale'] },
    ],
});

export default Translation;
