import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

async function inspectSchemas() {
    console.log('🔍 Inspecting Remote Schemas...\n');

    let connectionString = process.env.SUPABASE_DATABASE_URL;
    if (connectionString && connectionString.includes(':6543')) {
        connectionString = connectionString.replace(':6543', ':5432');
    }
    const sslConfig = { rejectUnauthorized: false };

    const client = new Client({
        connectionString,
        ssl: connectionString && connectionString.includes('localhost') ? false : sslConfig
    });

    try {
        await client.connect();

        const res = await client.query(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'auth', 'realtime', 'storage', 'vault', 'pgsodium', 'graphql', 'pg_toast')
            ORDER BY schema_name;
        `);

        if (res.rows.length === 0) {
            console.log('⚠️  No custom schemas found!');
        } else {
            console.log('📂 Existing Schemas:');
            res.rows.forEach(r => {
                console.log(`   - ${r.schema_name}`);
            });
        }

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
}

inspectSchemas();
