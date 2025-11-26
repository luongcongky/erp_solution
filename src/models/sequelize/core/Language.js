import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

const Language = sequelize.define('Language', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
        comment: 'Language code (ISO 639-1): vi, en, ko, etc.',
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Language name in English',
    },
    nativeName: {
        type: DataTypes.STRING(100),
        field: 'native_name',
        comment: 'Language name in native language',
    },
    flagEmoji: {
        type: DataTypes.STRING(10),
        field: 'flag_emoji',
        comment: 'Flag emoji for UI display',
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_default',
        comment: 'Is this the default language?',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active',
        comment: 'Is this language active and available?',
    },
    direction: {
        type: DataTypes.STRING(3),
        defaultValue: 'ltr',
        validate: {
            isIn: [['ltr', 'rtl']],
        },
        comment: 'Text direction: ltr (left-to-right) or rtl (right-to-left)',
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Display order in language switcher',
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
    tableName: 'languages',
    schema: 'core',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['code'], unique: true },
        { fields: ['is_active'] },
        { fields: ['is_default'] },
        { fields: ['ten_id', 'stg_id'] },
        { fields: ['order'] },
    ],
});

export default Language;
