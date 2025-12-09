import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const { Client } = pg;

async function syncDataToSupabase() {
    console.log('🔄 Syncing Data from Local to Supabase...\n');

    // Setup Connections
    const localConnectionString = process.env.LOCAL_DATABASE_URL ||
        `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`;

    let supabaseConnectionString = process.env.SUPABASE_DATABASE_URL;

    if (!supabaseConnectionString) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabasePassword = process.env.SUPABASE_DB_PASSWORD;

        if (supabaseUrl && supabasePassword) {
            const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
            supabaseConnectionString = `postgresql://postgres:${supabasePassword}@db.${projectRef}.supabase.co:5432/postgres`;
        }
    }

    if (!supabaseConnectionString) {
        console.error('❌ Missing Supabase credentials in .env');
        process.exit(1);
    }

    const sslConfig = { rejectUnauthorized: false };

    if (supabaseConnectionString && supabaseConnectionString.includes(':6543')) {
        console.log('⚠️  Switching to Session Pooler (port 5432)...');
        supabaseConnectionString = supabaseConnectionString.replace(':6543', ':5432');
    }

    const localClient = new Client({ connectionString: localConnectionString });
    const supabaseClient = new Client({
        connectionString: supabaseConnectionString,
        ssl: supabaseConnectionString.includes('localhost') ? false : sslConfig
    });

    try {
        await localClient.connect();
        await supabaseClient.connect();
        console.log('✅ Connected.\n');

        await supabaseClient.query("SET session_replication_role = 'replica';");

        const schemaMappings = [
            { local: 'core', remote: 'core' },
            { local: 'sales', remote: 'sales' },
            { local: 'inventory', remote: 'inventory' },
            { local: 'accounting', remote: 'accounting' },
            { local: 'hr', remote: 'hr' },
            { local: 'manufacturing', remote: 'manufacturing' },
            { local: 'projects', remote: 'projects' },
            { local: 'purchasing', remote: 'purchase' },
            { local: 'ecommerce', remote: 'ecommerce' },
            { local: 'support', remote: 'service' }
        ];

        for (const mapping of schemaMappings) {
            const { local, remote } = mapping;
            console.log(`\n📂 Syncing: ${local} ➡️ ${remote}`);

            try {
                await supabaseClient.query(`CREATE SCHEMA IF NOT EXISTS "${remote}";`);
            } catch (e) { }

            const tablesResult = await localClient.query(`
                SELECT tablename FROM pg_tables WHERE schemaname = $1 ORDER BY tablename
            `, [local]);

            const tables = tablesResult.rows.map(r => r.tablename);

            if (tables.length === 0) {
                console.log(`   (No tables in '${local}')`);
                continue;
            }

            for (const table of tables) {
                console.log(`   - Table: ${table}`);

                try {
                    await supabaseClient.query(`TRUNCATE TABLE "${remote}"."${table}" CASCADE;`);
                } catch (err) {
                    if (err.code !== '42P01') {
                        console.log(`     Truncate Error: ${err.message}`);
                    }
                }

                const dataResult = await localClient.query(`SELECT * FROM "${local}"."${table}"`);
                const rows = dataResult.rows;

                if (rows.length === 0) {
                    console.log('     (0 rows)');
                    continue;
                }

                const batchSize = 1000;
                let insertedCount = 0;

                for (let i = 0; i < rows.length; i += batchSize) {
                    const batch = rows.slice(i, i + batchSize);
                    if (batch.length === 0) continue;

                    const columns = Object.keys(batch[0]);
                    const validColumns = columns.filter(c => c && c.trim() !== '');

                    if (validColumns.length === 0) continue;

                    const valuePlaceholders = [];
                    const values = [];
                    let paramIndex = 1;

                    batch.forEach(row => {
                        const rowPlaceholders = [];
                        validColumns.forEach(col => {
                            rowPlaceholders.push(`$${paramIndex++}`);
                            values.push(row[col]);
                        });
                        valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
                    });

                    // SIMPLIFIED QUERY CONSTRUCTION
                    const colString = validColumns.map(c => `"${c}"`).join(', ');
                    const query = `INSERT INTO "${remote}"."${table}" (${colString}) VALUES ${valuePlaceholders.join(', ')}`;

                    try {
                        await supabaseClient.query(query, values);
                        insertedCount += batch.length;
                    } catch (err) {
                        console.log('\n❌ INSERT CRASHED!');
                        console.log('Table:', table);
                        console.log('Columns:', JSON.stringify(validColumns));
                        console.log('Query Head:', query.substring(0, 300));
                        console.log('Error Message:', err.message);
                        console.log('Error Code:', err.code);
                        process.exit(1);
                    }
                }
                console.log(`     Synced ${insertedCount} rows`);
            }
        }

        await supabaseClient.query("SET session_replication_role = 'origin';");
        console.log('\n✨ DONE.');

    } catch (error) {
        console.error('\n❌ GLOBAL ERROR:', error.message);
    } finally {
        await localClient.end();
        await supabaseClient.end();
    }
}

syncDataToSupabase();
