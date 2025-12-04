import { pgTable, uuid, varchar, text, decimal, timestamp, date, pgSchema, pgEnum } from 'drizzle-orm/pg-core';

// Accounting schema
export const accountingSchema = pgSchema('accounting');

// Account Type enum
export const accountTypeEnum = pgEnum('account_type', ['asset', 'liability', 'equity', 'revenue', 'expense']);

// Accounts table (Chart of Accounts)
export const accounts = accountingSchema.table('accounts', {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 200 }).notNull(),
    accountType: accountTypeEnum('account_type').notNull(),
    parentId: uuid('parent_id').references((): any => accounts.id),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    metadata: text('metadata'),
});

// Journals table
export const journals = accountingSchema.table('journals', {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 200 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Journal Entries table
export const journalEntries = accountingSchema.table('journal_entries', {
    id: uuid('id').primaryKey().defaultRandom(),
    journalId: uuid('journal_id').notNull().references(() => journals.id),
    entryNumber: varchar('entry_number', { length: 50 }).notNull().unique(),
    entryDate: date('entry_date').notNull(),
    reference: varchar('reference', { length: 100 }),
    description: text('description'),
    status: varchar('status', { length: 20 }).default('draft'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Journal Items table (Entry Lines)
export const journalItems = accountingSchema.table('journal_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    entryId: uuid('entry_id').notNull().references(() => journalEntries.id),
    accountId: uuid('account_id').notNull().references(() => accounts.id),
    debit: decimal('debit', { precision: 18, scale: 2 }).default('0'),
    credit: decimal('credit', { precision: 18, scale: 2 }).default('0'),
    description: text('description'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
});

// Invoices table
export const invoices = accountingSchema.table('invoices', {
    id: uuid('id').primaryKey().defaultRandom(),
    invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
    partnerId: uuid('partner_id').notNull(),
    invoiceDate: date('invoice_date').notNull(),
    dueDate: date('due_date'),
    subtotal: decimal('subtotal', { precision: 18, scale: 2 }).notNull(),
    taxAmount: decimal('tax_amount', { precision: 18, scale: 2 }).default('0'),
    total: decimal('total', { precision: 18, scale: 2 }).notNull(),
    status: varchar('status', { length: 20 }).default('draft'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Invoice Lines table
export const invoiceLines = accountingSchema.table('invoice_lines', {
    id: uuid('id').primaryKey().defaultRandom(),
    invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
    productId: uuid('product_id'),
    description: text('description'),
    qty: decimal('qty', { precision: 18, scale: 4 }).notNull(),
    unitPrice: decimal('unit_price', { precision: 18, scale: 2 }).notNull(),
    taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0'),
    amount: decimal('amount', { precision: 18, scale: 2 }).notNull(),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
});

// Payments table
export const payments = accountingSchema.table('payments', {
    id: uuid('id').primaryKey().defaultRandom(),
    paymentNumber: varchar('payment_number', { length: 50 }).notNull().unique(),
    invoiceId: uuid('invoice_id').references(() => invoices.id),
    paymentDate: date('payment_date').notNull(),
    amount: decimal('amount', { precision: 18, scale: 2 }).notNull(),
    paymentMethod: varchar('payment_method', { length: 50 }),
    reference: varchar('reference', { length: 100 }),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Type exports
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Journal = typeof journals.$inferSelect;
export type NewJournal = typeof journals.$inferInsert;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
