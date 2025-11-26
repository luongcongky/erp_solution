// Accounting Models
import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

export const Account = sequelize.define('Account', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    code: { type: DataTypes.STRING(50), allowNull: false },
    name: { type: DataTypes.STRING(200), allowNull: false },
    account_type: { type: DataTypes.ENUM('asset', 'liability', 'equity', 'income', 'expense'), allowNull: false },
    parent_id: { type: DataTypes.UUID },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
    metadata: { type: DataTypes.JSONB, defaultValue: {} },
}, { tableName: 'accounts', schema: 'accounting', timestamps: false });

export const Journal = sequelize.define('Journal', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    code: { type: DataTypes.STRING(50), allowNull: false },
    type: { type: DataTypes.ENUM('sale', 'purchase', 'bank', 'cash', 'general'), allowNull: false },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'journals', schema: 'accounting', timestamps: false });

export const JournalEntry = sequelize.define('JournalEntry', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    journal_id: { type: DataTypes.UUID },
    name: { type: DataTypes.STRING(100) },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    ref: { type: DataTypes.STRING(100) },
    posted: { type: DataTypes.BOOLEAN, defaultValue: false },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
    metadata: { type: DataTypes.JSONB, defaultValue: {} },
}, { tableName: 'journal_entries', schema: 'accounting', timestamps: true, createdAt: 'created_at', updatedAt: false });

export const JournalItem = sequelize.define('JournalItem', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    entry_id: { type: DataTypes.UUID, allowNull: false },
    account_id: { type: DataTypes.UUID },
    partner_id: { type: DataTypes.UUID },
    debit: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    credit: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    currency: { type: DataTypes.STRING(10), defaultValue: 'VND' },
    label: { type: DataTypes.STRING(200) },
}, { tableName: 'journal_items', schema: 'accounting', timestamps: false });

export const Invoice = sequelize.define('Invoice', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    invoice_number: { type: DataTypes.STRING(100), allowNull: false },
    partner_id: { type: DataTypes.UUID },
    type: { type: DataTypes.ENUM('out_invoice', 'in_invoice', 'out_refund', 'in_refund'), allowNull: false },
    date_issued: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    due_date: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.STRING(50), defaultValue: 'draft' },
    currency: { type: DataTypes.STRING(10), defaultValue: 'VND' },
    amount_total: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    amount_paid: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
    metadata: { type: DataTypes.JSONB, defaultValue: {} },
}, { tableName: 'invoices', schema: 'accounting', timestamps: true });

export const InvoiceLine = sequelize.define('InvoiceLine', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    invoice_id: { type: DataTypes.UUID, allowNull: false },
    product_id: { type: DataTypes.UUID },
    description: { type: DataTypes.TEXT },
    qty: { type: DataTypes.DECIMAL(18, 4), defaultValue: 1 },
    unit_price: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    tax_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
}, { tableName: 'invoice_lines', schema: 'accounting', timestamps: false });

export const Payment = sequelize.define('Payment', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    payment_number: { type: DataTypes.STRING(100), allowNull: false },
    partner_id: { type: DataTypes.UUID },
    invoice_id: { type: DataTypes.UUID },
    amount: { type: DataTypes.DECIMAL(18, 4), allowNull: false },
    payment_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    payment_method: { type: DataTypes.STRING(50) },
    journal_id: { type: DataTypes.UUID },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'payments', schema: 'accounting', timestamps: true, createdAt: 'created_at', updatedAt: false });

export const BankAccount = sequelize.define('BankAccount', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    account_number: { type: DataTypes.STRING(100), allowNull: false },
    bank_name: { type: DataTypes.STRING(200) },
    account_holder: { type: DataTypes.STRING(200) },
    currency: { type: DataTypes.STRING(10), defaultValue: 'VND' },
    balance: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'bank_accounts', schema: 'accounting', timestamps: true, createdAt: 'created_at', updatedAt: false });

export const TaxCode = sequelize.define('TaxCode', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    code: { type: DataTypes.STRING(50), allowNull: false },
    name: { type: DataTypes.STRING(200), allowNull: false },
    rate: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'tax_codes', schema: 'accounting', timestamps: false });
