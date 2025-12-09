import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function checkPublicTables() {
    const connectionString = process.env.LOCAL_DATABASE_URL ||
        `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`;

    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('🔍 Checking Tables in Public Schema\n');

        const result = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename
        `);

        if (result.rows.length > 0) {
            console.log(`📦 Schema: public (${result.rows.length} tables)`);
            result.rows.forEach(row => {
                console.log(`   - ${row.tablename}`);
            });
        } else {
            console.log('✅ No tables found in public schema.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
}

checkPublicTables();
