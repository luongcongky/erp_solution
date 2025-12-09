import pg from 'pg';
import { writeFile } from 'fs/promises';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const { Client } = pg;

async function exportSchemaToSQL() {
    console.log('📤 Exporting Local Database Schema to SQL\n');

    const localConnectionString = process.env.LOCAL_DATABASE_URL ||
        `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`;

    const client = new Client({ connectionString: localConnectionString });

    try {
        await client.connect();
        console.log('✅ Connected to local PostgreSQL\n');

        let sqlOutput = `-- ============================================
-- Supabase Schema Export
-- Generated: ${new Date().toISOString()}
-- Source: Local PostgreSQL Database
-- Tables: public schema
-- ============================================

`;

        // Get all tables
        const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);

        console.log(`📊 Found ${tablesResult.rows.length} tables\n`);
        console.log('🔨 Generating CREATE TABLE statements...\n');

        for (const row of tablesResult.rows) {
            const tableName = row.tablename;

            // Get table structure
            const columnsResult = await client.query(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          column_default,
          is_nullable,
          udt_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

            sqlOutput += `-- Table: ${tableName}\n`;
            sqlOutput += `CREATE TABLE IF NOT EXISTS public.${tableName} (\n`;

            const columns = columnsResult.rows.map(col => {
                // Quote column name to handle reserved keywords (e.g. "order")
                let def = `  "${col.column_name}" `;

                // Map PostgreSQL types to Supabase-compatible types
                if (col.data_type === 'uuid') {
                    def += 'uuid';
                } else if (col.data_type === 'character varying') {
                    def += `varchar(${col.character_maximum_length || 255})`;
                } else if (col.data_type === 'timestamp without time zone') {
                    def += 'timestamp';
                } else if (col.data_type === 'ARRAY') {
                    def += 'text[]';
                } else {
                    def += col.data_type;
                }

                if (col.column_default) {
                    if (col.column_default.includes('gen_random_uuid')) {
                        def += ' DEFAULT gen_random_uuid()';
                    } else if (col.column_default.includes('now()')) {
                        def += ' DEFAULT now()';
                    } else if (!col.column_default.includes('nextval')) {
                        def += ` DEFAULT ${col.column_default}`;
                    }
                }

                if (col.is_nullable === 'NO') {
                    def += ' NOT NULL';
                }

                return def;
            });

            sqlOutput += columns.join(',\n');
            sqlOutput += '\n);\n\n';

            console.log(`   ✅ ${tableName}`);
        }

        // Add indexes and constraints info
        sqlOutput += `-- ============================================
            --Note: Primary keys, foreign keys, and indexes
--need to be added manually or via Drizzle Kit
-- ============================================\n`;

        // Save to file
        const outputPath = join(__dirname, '..', 'migrations', 'supabase_schema_export.sql');
        await writeFile(outputPath, sqlOutput);

        console.log('\n✅ Schema exported successfully!');
        console.log(`📁 File: ${outputPath}\n`);

        console.log('📋 Next Steps:\n');
        console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard');
        console.log('2. Go to SQL Editor');
        console.log('3. Create a new query');
        console.log('4. Copy and paste the contents of supabase_schema_export.sql');
        console.log('5. Run the query');
        console.log('6. Verify tables are created in Table Editor\n');

        console.log('⚠️  Important Notes:');
        console.log('   - This exports table structures only (no data)');
        console.log('   - Primary keys and foreign keys need to be added separately');
        console.log('   - Consider using Drizzle Kit push for complete schema with relationships\n');

    } catch (error) {
        console.error('❌ Export failed:', error.message);
        console.error(error);
    } finally {
        await client.end();
    }
}

exportSchemaToSQL();
