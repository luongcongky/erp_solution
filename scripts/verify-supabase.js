import dotenv from 'dotenv';
import { getSequelize } from '../src/config/database.js';

// Load Supabase environment variables
dotenv.config({ path: '.env.supabase' });

/**
 * Verify Supabase Database
 * This script will:
 * 1. Connect to Supabase
 * 2. List all tables
 * 3. Count rows in each table
 * 4. Show table structures
 */
async function verifySupabase() {
    console.log('🔍 Verifying Supabase Database...\n');

    try {
        const sequelize = getSequelize();

        // Test connection
        console.log('📡 Connecting to Supabase...');
        await sequelize.authenticate();
        console.log('✅ Connected successfully!\n');

        // Get all tables from all schemas (not just public)
        const [tables] = await sequelize.query(`
            SELECT 
                table_schema,
                table_name,
                pg_size_pretty(pg_total_relation_size(quote_ident(table_schema) || '.' || quote_ident(table_name))) as size
            FROM information_schema.tables 
            WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
            AND table_type = 'BASE TABLE'
            ORDER BY table_schema, table_name
        `);

        console.log(`📋 Found ${tables.length} tables:\n`);

        // Count rows in each table
        for (const table of tables) {
            try {
                const [count] = await sequelize.query(
                    `SELECT COUNT(*) as count FROM "${table.table_name}"`
                );

                const rowCount = count[0].count;
                const icon = rowCount > 0 ? '📊' : '📭';

                console.log(`${icon} ${table.table_name}`);
                console.log(`   Rows: ${rowCount}`);
                console.log(`   Size: ${table.size}\n`);

            } catch (error) {
                console.log(`⚠️  ${table.table_name}`);
                console.log(`   Error: ${error.message}\n`);
            }
        }

        // Get database size
        const [dbSize] = await sequelize.query(`
            SELECT pg_size_pretty(pg_database_size(current_database())) as size
        `);

        console.log(`💾 Total Database Size: ${dbSize[0].size}\n`);

        // Show some table structures
        console.log('📐 Sample Table Structures:\n');

        const samplesToShow = tables.slice(0, 3);
        for (const table of samplesToShow) {
            const [columns] = await sequelize.query(`
                SELECT 
                    column_name,
                    data_type,
                    is_nullable,
                    column_default
                FROM information_schema.columns
                WHERE table_name = '${table.table_name}'
                ORDER BY ordinal_position
            `);

            console.log(`📋 ${table.table_name}:`);
            columns.forEach(col => {
                const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
                console.log(`   • ${col.column_name}: ${col.data_type} ${nullable}`);
            });
            console.log('');
        }

        console.log('✅ Verification completed!\n');

        await sequelize.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        process.exit(1);
    }
}

// Run verification
verifySupabase();
