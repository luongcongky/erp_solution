import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

async function inspectLocalSchemas() {
    console.log('🔍 Inspecting LOCAL Schemas...\n');

    // Connection string for LOCAL
    const connectionString = process.env.LOCAL_DATABASE_URL ||
        `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`;

    const client = new Client({ connectionString });

    try {
        await client.connect();

        const res = await client.query(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'public')
            ORDER BY schema_name;
        `);

        if (res.rows.length === 0) {
            console.log('⚠️  No custom schemas found locally!');
        } else {
            console.log('📂 Existing Local Schemas:');
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

inspectLocalSchemas();
