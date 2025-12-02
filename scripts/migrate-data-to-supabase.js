import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

/**
 * Migrate Data from Local PostgreSQL to Supabase
 * This script will:
 * 1. Connect to both local and Supabase databases
 * 2. Copy all data from local to Supabase
 * 3. Preserve existing data on Supabase (upsert mode)
 */

// Load local database config
const localSequelize = new Sequelize({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'erp',
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '123456',
    dialect: 'postgres',
    logging: false,
});

// Load Supabase config
dotenv.config({ path: '.env.supabase' });
const supabaseSequelize = new Sequelize({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    dialect: 'postgres',
    logging: false,
});

async function migrateData() {
    console.log('🚀 Starting Data Migration...\n');

    try {
        // Connect to both databases
        console.log('📡 Connecting to Local PostgreSQL...');
        await localSequelize.authenticate();
        console.log('✅ Connected to Local\n');

        console.log('📡 Connecting to Supabase...');
        await supabaseSequelize.authenticate();
        console.log('✅ Connected to Supabase\n');

        // Get all tables from local database
        const schemas = ['core', 'inventory', 'hr', 'accounting', 'sales', 'purchase', 'manufacturing', 'projects', 'service', 'ecommerce'];

        let totalTables = 0;
        let totalRows = 0;

        for (const schema of schemas) {
            console.log(`\n📁 Processing schema: ${schema}`);

            const [tables] = await localSequelize.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = '${schema}' 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name
            `);

            if (tables.length === 0) {
                console.log(`   ⚠️  No tables found in ${schema}`);
                continue;
            }

            for (const table of tables) {
                const tableName = table.table_name;
                totalTables++;

                try {
                    // Get data from local
                    const [rows] = await localSequelize.query(`
                        SELECT * FROM "${schema}"."${tableName}"
                    `);

                    if (rows.length === 0) {
                        console.log(`   📭 ${tableName} - 0 rows (skipped)`);
                        continue;
                    }

                    // Get column names
                    const [columns] = await localSequelize.query(`
                        SELECT column_name 
                        FROM information_schema.columns 
                        WHERE table_schema = '${schema}' 
                        AND table_name = '${tableName}'
                        ORDER BY ordinal_position
                    `);

                    const columnNames = columns.map(c => c.column_name);

                    // Insert data into Supabase (batch insert)
                    const batchSize = 100;
                    let inserted = 0;

                    for (let i = 0; i < rows.length; i += batchSize) {
                        const batch = rows.slice(i, i + batchSize);

                        // Build INSERT query with ON CONFLICT DO NOTHING
                        const values = batch.map(row => {
                            const vals = columnNames.map(col => {
                                const val = row[col];
                                if (val === null) return 'NULL';
                                if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                                if (val instanceof Date) return `'${val.toISOString()}'`;
                                if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
                                return val;
                            }).join(', ');
                            return `(${vals})`;
                        }).join(', ');

                        const insertQuery = `
                            INSERT INTO "${schema}"."${tableName}" (${columnNames.map(c => `"${c}"`).join(', ')})
                            VALUES ${values}
                            ON CONFLICT DO NOTHING
                        `;

                        await supabaseSequelize.query(insertQuery);
                        inserted += batch.length;
                    }

                    totalRows += inserted;
                    console.log(`   ✅ ${tableName} - ${inserted} rows migrated`);

                } catch (error) {
                    console.log(`   ❌ ${tableName} - Error: ${error.message}`);
                }
            }
        }

        console.log(`\n\n🎉 Migration completed!`);
        console.log(`   Tables processed: ${totalTables}`);
        console.log(`   Total rows migrated: ${totalRows}\n`);

        await localSequelize.close();
        await supabaseSequelize.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        process.exit(1);
    }
}

migrateData();
