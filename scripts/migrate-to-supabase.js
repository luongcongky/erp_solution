import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import dotenv from 'dotenv';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

async function migrateToSupabase() {
    console.log('🚀 Starting Supabase Migration...\n');

    // Get Supabase connection string
    let connectionString = process.env.SUPABASE_DATABASE_URL;
    const supabasePassword = process.env.SUPABASE_DB_PASSWORD;

    // Fallback to construction if not set (but prefer env var)
    if (!connectionString) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (supabaseUrl && supabasePassword) {
            const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
            connectionString = `postgresql://postgres:${supabasePassword}@db.${projectRef}.supabase.co:5432/postgres`;
        }
    }

    if (!connectionString) {
        console.error('❌ SUPABASE_DATABASE_URL or credentials not set in .env');
        process.exit(1);
    }

    // Force Session Pooler (Port 5432) for Migrations (DDL)
    if (connectionString.includes(':6543')) {
        console.log('⚠️  Switching from Transaction Pooler (6543) to Session Pooler (5432) for DDL...');
        connectionString = connectionString.replace(':6543', ':5432');
    }

    console.log('📋 Connection Info:');
    console.log('Connection String:', connectionString.replace(supabasePassword || 'password', '***'));
    console.log('');

    try {
        // Create connection
        console.log('🔌 Connecting to Supabase...');
        // Use ssl: { rejectUnauthorized: false } for Supabase Poolers often
        const sql = postgres(connectionString, { max: 1, ssl: { rejectUnauthorized: false } });
        const db = drizzle(sql);

        // Test connection
        await sql`SELECT 1`;
        console.log('✅ Connected to Supabase!\n');

        // Run migrations
        console.log('📦 Running migrations...');
        const migrationsFolder = join(__dirname, '..', 'drizzle', 'migrations');

        try {
            await migrate(db, { migrationsFolder });
            console.log('✅ Migrations completed successfully!\n');
        } catch (error) {
            if (error.message.includes('No migrations found')) {
                console.log('⚠️  No migration files found. Run `npm run db:generate` first.\n');
            } else {
                throw error;
            }
        }

        // Verify tables
        console.log('🔍 Verifying tables...');
        const tables = await sql`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'auth', 'realtime', 'storage') 
      AND table_type = 'BASE TABLE'
      ORDER BY table_schema, table_name
    `;

        if (tables.length > 0) {
            console.log('✅ Tables found:');
            tables.forEach(t => console.log(`   - ${t.table_schema}.${t.table_name}`));
        } else {
            console.log('⚠️  No tables found in user schemas');
        }

        await sql.end();
        console.log('\n✨ Migration to Supabase completed!');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

migrateToSupabase();
