import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

async function inspect() {
    console.log('🔍 Inspecting Remote Database Structure...\n');

    // SSL config for Supabase
    const sslConfig = { rejectUnauthorized: false };
    const connectionString = process.env.SUPABASE_DATABASE_URL;

    if (!connectionString) {
        console.error('No SUPABASE_DATABASE_URL');
        return;
    }

    const client = new Client({
        connectionString,
        ssl: connectionString.includes('localhost') ? false : sslConfig
    });

    try {
        await client.connect();
        console.log('✅ Connected');

        const res = await client.query(`
            SELECT schemaname, tablename 
            FROM pg_tables 
            WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
            ORDER BY schemaname, tablename;
        `);

        if (res.rows.length === 0) {
            console.log('⚠️  No tables found in user schemas!');
        } else {
            console.log('📊 Existing Tables:');
            res.rows.forEach(r => {
                console.log(`   - ${r.schemaname}.${r.tablename}`);
            });
        }

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
}

inspect();
