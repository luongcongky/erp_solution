import pg from 'pg';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const { Client } = pg;

async function migrateToPublicSchema() {
    console.log('🔄 Migrating Local Database to Public Schema\n');

    // Connection to local PostgreSQL
    const connectionString = process.env.LOCAL_DATABASE_URL ||
        `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`;

    console.log('📍 Connecting to:', connectionString.replace(/:[^:@]+@/, ':***@'));
    console.log('');

    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL\n');

        // Step 1: Check current schemas
        console.log('📊 Checking current schema distribution...');
        const schemaCheck = await client.query(`
      SELECT schemaname, COUNT(*) as table_count 
      FROM pg_tables 
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      GROUP BY schemaname
      ORDER BY schemaname
    `);

        console.log('Current schemas:');
        schemaCheck.rows.forEach(row => {
            console.log(`   ${row.schemaname}: ${row.table_count} tables`);
        });
        console.log('');

        // Step 2: Read and execute migration SQL
        console.log('📝 Reading migration script...');
        const sqlPath = join(__dirname, '..', 'migrations', 'migrate_to_public_schema.sql');
        const sql = await readFile(sqlPath, 'utf-8');

        // Remove comments and split by semicolon
        const statements = sql
            .split('\n')
            .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
            .join('\n')
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('DROP SCHEMA'));

        console.log(`Found ${statements.length} migration statements\n`);

        // Step 3: Execute migration
        console.log('🚀 Executing migration...');
        let successCount = 0;
        let skipCount = 0;

        for (const statement of statements) {
            try {
                await client.query(statement);

                // Extract table name from ALTER TABLE statement
                const match = statement.match(/ALTER TABLE IF EXISTS (\w+)\.(\w+)/);
                if (match) {
                    console.log(`   ✅ Moved ${match[1]}.${match[2]} → public.${match[2]}`);
                    successCount++;
                }
            } catch (error) {
                // Table might not exist, which is fine
                if (error.code === '42P01') { // undefined_table
                    skipCount++;
                } else {
                    console.error(`   ❌ Error: ${error.message}`);
                }
            }
        }

        console.log('');
        console.log(`✅ Migration completed: ${successCount} tables moved, ${skipCount} skipped (not found)`);
        console.log('');

        // Step 4: Verify migration
        console.log('🔍 Verifying migration...');
        const publicTables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);

        console.log(`✅ Found ${publicTables.rows.length} tables in public schema:`);
        publicTables.rows.forEach(row => {
            console.log(`   - ${row.tablename}`);
        });
        console.log('');

        // Check if old schemas are empty
        const oldSchemas = await client.query(`
      SELECT schemaname, COUNT(*) as table_count 
      FROM pg_tables 
      WHERE schemaname IN ('core', 'accounting', 'sales', 'inventory', 'hr', 'purchasing', 'manufacturing', 'projects', 'support', 'ecommerce')
      GROUP BY schemaname
    `);

        if (oldSchemas.rows.length > 0) {
            console.log('⚠️  Some tables still remain in old schemas:');
            oldSchemas.rows.forEach(row => {
                console.log(`   ${row.schemaname}: ${row.table_count} tables`);
            });
            console.log('');
            console.log('💡 You may need to manually check these tables.');
        } else {
            console.log('✅ All tables successfully moved to public schema!');
            console.log('');
            console.log('💡 You can now drop the old schemas if desired:');
            console.log('   Run: DROP SCHEMA core, accounting, sales, ... CASCADE;');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n✨ Migration process completed!');
    }
}

migrateToPublicSchema();
