import pg from 'pg';
import dotenv from 'dotenv';
import { URL } from 'url';

dotenv.config();

const { Client } = pg;

const schemas = [
    'core',
    'sales',
    'inventory',
    'accounting',
    'hr',
    'manufacturing',
    'projects',
    'purchasing',
    'ecommerce',
    'support'
];

async function createRemoteSchemas() {
    console.log('🏗️  Creating Schemas on Supabase...\n');

    let connectionString = process.env.SUPABASE_DATABASE_URL;

    if (!connectionString) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabasePassword = process.env.SUPABASE_DB_PASSWORD;

        if (supabaseUrl && supabasePassword) {
            const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
            connectionString = `postgresql://postgres:${supabasePassword}@db.${projectRef}.supabase.co:5432/postgres`;
        }
    }

    if (!connectionString) {
        console.error('❌ Missing Supabase credentials in .env');
        process.exit(1);
    }

    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to Supabase\n');

        for (const schema of schemas) {
            process.stdout.write(`   Creating schema '${schema}'... `);
            try {
                await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}";`);
                console.log('✅ Done');
            } catch (err) {
                console.log(`❌ Error: ${err.message}`);
            }
        }

        console.log('\n✨ Schema creation process completed!');

    } catch (error) {
        console.error('\n❌ Connection failed:', error.message);
    } finally {
        await client.end();
    }
}

createRemoteSchemas();
