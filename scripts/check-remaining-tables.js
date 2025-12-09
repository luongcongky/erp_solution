import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function checkRemainingTables() {
    const connectionString = process.env.LOCAL_DATABASE_URL ||
        `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`;

    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('🔍 Checking Remaining Tables in Old Schemas\n');

        const schemas = ['core', 'accounting', 'sales', 'inventory', 'hr', 'purchasing', 'manufacturing', 'projects', 'support', 'ecommerce', 'purchase', 'service'];

        for (const schema of schemas) {
            const result = await client.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = $1
        ORDER BY tablename
      `, [schema]);

            if (result.rows.length > 0) {
                console.log(`📦 Schema: ${schema} (${result.rows.length} tables)`);
                result.rows.forEach(row => {
                    console.log(`   - ${row.tablename}`);
                });
                console.log('');
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
}

checkRemainingTables();
