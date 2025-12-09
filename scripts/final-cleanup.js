import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function finalCleanup() {
    console.log('🧹 Final Cleanup - Removing Duplicate and Empty Schemas\n');

    const connectionString = process.env.LOCAL_DATABASE_URL ||
        `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`;

    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL\n');

        // Handle duplicate products table
        console.log('🔍 Checking inventory.products...');
        const inventoryProducts = await client.query(`
      SELECT COUNT(*) as count FROM inventory.products
    `);

        if (inventoryProducts.rows[0].count > 0) {
            console.log(`   Found ${inventoryProducts.rows[0].count} rows in inventory.products`);
            console.log('   ⚠️  This table has data. You may want to merge it with public.products manually.');
            console.log('   For now, we will drop the empty schema inventory.products');
        }

        // Drop the duplicate table (assuming it's empty or you want to keep public.products)
        try {
            await client.query('DROP TABLE IF EXISTS inventory.products CASCADE');
            console.log('   ✅ Dropped inventory.products');
        } catch (error) {
            console.log(`   ⚠️  Could not drop inventory.products: ${error.message}`);
        }
        console.log('');

        // Drop empty schemas
        console.log('🗑️  Dropping empty schemas...');
        const schemas = ['core', 'accounting', 'sales', 'inventory', 'hr', 'purchasing', 'manufacturing', 'projects', 'support', 'ecommerce', 'purchase', 'service'];

        for (const schema of schemas) {
            try {
                await client.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
                console.log(`   ✅ Dropped schema: ${schema}`);
            } catch (error) {
                console.log(`   ⚠️  Could not drop ${schema}: ${error.message}`);
            }
        }
        console.log('');

        // Final verification
        console.log('🔍 Final Verification...');
        const publicCount = await client.query(`
      SELECT COUNT(*) as count FROM pg_tables WHERE schemaname = 'public'
    `);
        console.log(`✅ Total tables in public schema: ${publicCount.rows[0].count}`);

        const oldSchemas = await client.query(`
      SELECT schemaname, COUNT(*) as count 
      FROM pg_tables 
      WHERE schemaname IN ('core', 'accounting', 'sales', 'inventory', 'hr', 'purchasing', 'manufacturing', 'projects', 'support', 'ecommerce', 'purchase', 'service')
      GROUP BY schemaname
    `);

        if (oldSchemas.rows.length === 0) {
            console.log('🎉 All old schemas successfully removed!');
        } else {
            console.log('⚠️  Some schemas still have tables:');
            oldSchemas.rows.forEach(row => {
                console.log(`   ${row.schemaname}: ${row.count} tables`);
            });
        }

    } catch (error) {
        console.error('❌ Cleanup failed:', error.message);
    } finally {
        await client.end();
        console.log('\n✨ Cleanup completed!');
    }
}

finalCleanup();
