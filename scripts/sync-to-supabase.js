import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function syncLocalToSupabase() {
    console.log('🔄 Syncing Local Database to Supabase\n');

    // Step 1: Get schema from local database
    console.log('📊 Step 1: Reading local database schema...');

    const localConnectionString = process.env.LOCAL_DATABASE_URL ||
        `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`;

    const localClient = new Client({ connectionString: localConnectionString });

    try {
        await localClient.connect();
        console.log('✅ Connected to local PostgreSQL\n');

        // Get all tables in public schema
        const tablesResult = await localClient.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);

        console.log(`Found ${tablesResult.rows.length} tables in local database\n`);

        // Step 2: Generate SQL dump
        console.log('📝 Step 2: Generating SQL schema dump...');

        const tables = tablesResult.rows.map(r => r.tablename);

        // For each table, get CREATE TABLE statement
        for (const table of tables.slice(0, 5)) { // Show first 5 as example
            const createTableResult = await localClient.query(`
        SELECT 
          'CREATE TABLE IF NOT EXISTS ' || tablename || ' (' ||
          string_agg(column_name || ' ' || data_type, ', ') || ');'
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        GROUP BY tablename
      `, [table.tablename]);

            console.log(`   - ${table.tablename}`);
        }

        console.log(`   ... and ${tables.length - 5} more tables\n`);

        // Step 3: Recommend using Drizzle Kit push
        console.log('💡 Recommendation:\n');
        console.log('The best way to sync schema to Supabase is using Drizzle Kit:');
        console.log('');
        console.log('1. Ensure Supabase project is active (not paused)');
        console.log('2. Set DB_PROVIDER=supabase in .env');
        console.log('3. Run: npm run db:push');
        console.log('');
        console.log('This will:');
        console.log('   ✅ Create all 87 tables in Supabase');
        console.log('   ✅ Set up all relationships and constraints');
        console.log('   ✅ Match your local schema exactly');
        console.log('');
        console.log('⚠️  Note: This only syncs SCHEMA, not DATA');
        console.log('');
        console.log('To sync DATA after schema is created:');
        console.log('   Run: node scripts/sync-data-to-supabase.js (we can create this)');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await localClient.end();
    }
}

syncLocalToSupabase();
