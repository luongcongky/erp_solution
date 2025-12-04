import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const { Pool } = pg;

const connectionString = `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`;

const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool);
export const client = pool;

async function testConnection() {
    try {
        console.log('⏳ Checking languages columns...');
        const result = await db.execute(sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'core' AND table_name = 'languages'
            ORDER BY ordinal_position
        `);
        console.log('✅ Columns:', result.rows);
    } catch (error) {
        console.error('❌ Query failed:', error);
    } finally {
        await client.end();
    }
}

testConnection();
