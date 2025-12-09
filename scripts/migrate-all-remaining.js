import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function migrateAllRemainingTables() {
    console.log('🔄 Migrating ALL Remaining Tables to Public Schema\n');

    const connectionString = process.env.LOCAL_DATABASE_URL ||
        `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`;

    console.log('📍 Connecting to:', connectionString.replace(/:[^:@]+@/, ':***@'));
    console.log('');

    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL\n');

        // Get all schemas to migrate
        const schemas = ['core', 'accounting', 'sales', 'inventory', 'hr', 'purchasing', 'manufacturing', 'projects', 'support', 'ecommerce', 'purchase', 'service'];

        let totalMoved = 0;
        let totalSkipped = 0;

        for (const schema of schemas) {
            // Get all tables in this schema
            const tables = await client.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = $1
        ORDER BY tablename
      `, [schema]);

            if (tables.rows.length > 0) {
                console.log(`📦 Processing schema: ${schema} (${tables.rows.length} tables)`);

                for (const table of tables.rows) {
                    try {
                        await client.query(`ALTER TABLE ${schema}.${table.tablename} SET SCHEMA public`);
                        console.log(`   ✅ Moved ${schema}.${table.tablename} → public.${table.tablename}`);
                        totalMoved++;
                    } catch (error) {
                        if (error.code === '42P07') {
                            // Table already exists in public schema
                            console.log(`   ⚠️  Skipped ${schema}.${table.tablename} (already exists in public)`);
                            totalSkipped++;
                        } else {
                            console.error(`   ❌ Error moving ${schema}.${table.tablename}: ${error.message}`);
                        }
                    }
                }
                console.log('');
            }
        }

        console.log(`✅ Migration completed: ${totalMoved} tables moved, ${totalSkipped} skipped`);
        console.log('');

        // Verify final state
        console.log('🔍 Final verification...');
        const publicTables = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);

        console.log(`✅ Total tables in public schema: ${publicTables.rows[0].count}`);
        console.log('');

        // Check if old schemas are now empty
        const remainingCheck = await client.query(`
      SELECT schemaname, COUNT(*) as table_count 
      FROM pg_tables 
      WHERE schemaname IN ('core', 'accounting', 'sales', 'inventory', 'hr', 'purchasing', 'manufacturing', 'projects', 'support', 'ecommerce', 'purchase', 'service')
      GROUP BY schemaname
    `);

        if (remainingCheck.rows.length > 0) {
            console.log('⚠️  Some tables still remain:');
            remainingCheck.rows.forEach(row => {
                console.log(`   ${row.schemaname}: ${row.table_count} tables`);
            });
        } else {
            console.log('🎉 All tables successfully moved to public schema!');
            console.log('');
            console.log('💡 You can now drop the empty schemas:');
            console.log('   DROP SCHEMA IF EXISTS core, accounting, sales, inventory, hr, purchasing, manufacturing, projects, support, ecommerce, purchase, service CASCADE;');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n✨ Migration process completed!');
    }
}

migrateAllRemainingTables();
