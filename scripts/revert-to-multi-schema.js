import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const { Client } = pg;

// Define schema mappings
// Core tables were in public, now going to core
const mappings = {
    core: [
        'users', 'languages', 'roles', 'permissions', 'user_roles',
        'translations', 'ui_translations', 'audit_logs', 'partners',
        'menus', 'notifications'
    ],
    sales: [
        'leads', 'opportunities', 'quotations', 'sales_orders'
    ],
    inventory: [
        'items', 'warehouses', 'locations', 'stock_lots',
        'stock_balance', 'stock_movements', 'uom_conversions',
        'inventory_counts', 'inventory_count_lines'
    ],
    accounting: ['transactions', 'accounts', 'journal_entries'], // Assuming these exist
    hr: ['employees', 'departments', 'positions'], // Assuming these exist
    manufacturing: ['production_orders', 'bom', 'operations'], // Assuming these exist
    projects: ['projects', 'tasks', 'milestones'], // Assuming these exist
    purchasing: ['purchase_orders', 'suppliers', 'receipts'], // Assuming these exist
    // Add other schemas as needed based on file existence
};

async function revertToMultiSchema() {
    console.log('🔄 Reverting Local Database to Multi-Schema Structure...\n');

    const connectionString = process.env.LOCAL_DATABASE_URL ||
        `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`;

    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Local PostgreSQL\n');

        // 1. Create Schemas
        console.log('🏗️  Creating Schemas...');
        const schemas = Object.keys(mappings);
        for (const schema of schemas) {
            await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}";`);
            process.stdout.write(` ${schema}`);
        }
        console.log('\n');

        // 2. Move Tables
        console.log('📦 Moving Tables...');
        let movedCount = 0;
        let notFoundCount = 0;

        for (const [schema, tables] of Object.entries(mappings)) {
            for (const table of tables) {
                try {
                    // Check if table exists in public
                    const check = await client.query(`
                        SELECT 1 FROM pg_tables 
                        WHERE schemaname = 'public' AND tablename = $1
                    `, [table]);

                    if (check.rowCount > 0) {
                        await client.query(`ALTER TABLE public."${table}" SET SCHEMA "${schema}";`);
                        console.log(`   ✅ public.${table} -> ${schema}.${table}`);
                        movedCount++;
                    } else {
                        // Check if it's already in the target schema
                        const checkTarget = await client.query(`
                            SELECT 1 FROM pg_tables 
                            WHERE schemaname = $1 AND tablename = $2
                        `, [schema, table]);

                        if (checkTarget.rowCount > 0) {
                            console.log(`   ok ${schema}.${table} (already there)`);
                        } else {
                            // console.log(`   ⚠️  public.${table} not found`);
                            notFoundCount++;
                        }
                    }
                } catch (err) {
                    console.error(`   ❌ Error moving ${table}: ${err.message}`);
                }
            }
        }

        console.log(`\n✨ Reversion Complete! Moved ${movedCount} tables.`);

    } catch (error) {
        console.error('\n❌ Reversion failed:', error.message);
    } finally {
        await client.end();
    }
}

revertToMultiSchema();
