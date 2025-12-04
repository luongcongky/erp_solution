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

async function checkAllTables() {
    try {
        console.log('=== CHECKING LANGUAGES TABLE ===');
        const langCols = await db.execute(sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'core' AND table_name = 'languages'
            ORDER BY ordinal_position
        `);
        console.log('Languages columns:', langCols.rows.map(r => r.column_name).join(', '));

        console.log('\n=== CHECKING UI_TRANSLATIONS TABLE ===');
        const uiTransCols = await db.execute(sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'core' AND table_name = 'ui_translations'
            ORDER BY ordinal_position
        `);
        console.log('UI Translations columns:', uiTransCols.rows.map(r => r.column_name).join(', '));

        console.log('\n=== CHECKING MENUS TABLE ===');
        const menuCols = await db.execute(sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'core' AND table_name = 'menus'
            ORDER BY ordinal_position
        `);
        console.log('Menus columns:', menuCols.rows.map(r => r.column_name).join(', '));

    } catch (error) {
        console.error('❌ Query failed:', error);
    } finally {
        await client.end();
    }
}

checkAllTables();
