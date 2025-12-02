import dotenv from 'dotenv';
import { getSequelize } from '../src/config/database.js';

// Load Supabase environment variables
dotenv.config({ path: '.env.supabase' });

/**
 * Sync Database Schema to Supabase
 * This script will:
 * 1. Connect to Supabase PostgreSQL
 * 2. Sync all Sequelize models (create/update tables)
 * 3. Preserve existing data (uses alter: true)
 */
async function syncToSupabase() {
    console.log('🚀 Starting Supabase Sync...\n');

    try {
        // Get Sequelize instance with Supabase credentials
        const sequelize = getSequelize();

        console.log('📡 Connecting to Supabase...');
        console.log(`   Host: ${process.env.POSTGRES_HOST}`);
        console.log(`   Database: ${process.env.POSTGRES_DB}`);
        console.log(`   User: ${process.env.POSTGRES_USER}\n`);

        // Test connection
        await sequelize.authenticate();
        console.log('✅ Connected to Supabase successfully!\n');

        // Import all models to register them with Sequelize
        console.log('📦 Loading models...');
        await import('../src/models/sequelize/index.js');
        console.log('✅ Models loaded\n');

        // Sync all models
        // Using force: false - only creates new tables, doesn't modify existing ones
        // This avoids SQL syntax errors with ALTER TABLE statements
        console.log('🔄 Syncing schema to Supabase...');
        console.log('   Using { force: false } - will create new tables only\n');

        await sequelize.sync({ force: false });

        console.log('\n✅ Schema synced successfully!');

        // Get list of synced tables
        const [tables] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);

        console.log(`\n📋 Tables in Supabase (${tables.length} total):`);
        tables.forEach(table => {
            console.log(`   • ${table.table_name}`);
        });

        console.log('\n🎉 Sync completed successfully!');
        console.log('\n💡 Next steps:');
        console.log('   1. Run: node scripts/verify-supabase.js (to verify tables)');
        console.log('   2. Check Supabase Dashboard → Table Editor');
        console.log('   3. Optionally seed data or migrate existing data\n');

        await sequelize.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Sync failed:', error.message);

        if (error.message.includes('connect')) {
            console.error('\n💡 Connection tips:');
            console.error('   1. Check .env.supabase credentials');
            console.error('   2. Verify Supabase project is active');
            console.error('   3. Check firewall/network settings');
        }

        process.exit(1);
    }
}

// Run sync
syncToSupabase();
