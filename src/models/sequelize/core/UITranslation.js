import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

const UITranslation = sequelize.define('UITranslation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    key: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: 'Translation key in dot notation: common.save, pages.users.title',
    },
    languageCode: {
        type: DataTypes.STRING(10),
        allowNull: false,
        field: 'language_code',
        comment: 'Language code (vi, en, ko)',
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Translated text',
    },
    module: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Module name: core, sales, inventory, etc.',
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description for translators',
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
    tableName: 'ui_translations',
    schema: 'core',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['key'] },
        { fields: ['language_code'] },
        { fields: ['module'] },
        { fields: ['ten_id', 'stg_id'] },
        { fields: ['key', 'language_code', 'ten_id', 'stg_id'], unique: true },
    ],
});

export default UITranslation;
