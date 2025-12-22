import pg from 'pg';
import dotenv from 'dotenv';

// Load env
dotenv.config();

const { Client } = pg;

const localUrl = process.env.LOCAL_DATABASE_URL ||
    `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`;

console.log('Connecting to:', localUrl.replace(/:[^:@]+@/, ':***@'));

const client = new Client({ connectionString: localUrl });

async function check() {
    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_schema, table_name, column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'inventory' 
              AND table_name = 'items' 
              AND column_name = 'external_code';
        `);
        console.log('Result:', res.rows);
        if (res.rows.length === 0) {
            console.log('❌ Column "external_code" NOT FOUND in inventory.items');
        } else {
            console.log('✅ Column "external_code" FOUND');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await client.end();
    }
}

check();
