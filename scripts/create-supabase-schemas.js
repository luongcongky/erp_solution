import dotenv from 'dotenv';
import { getSequelize } from '../src/config/database.js';

// Load Supabase environment variables
dotenv.config({ path: '.env.supabase' });

/**
 * Create necessary schemas on Supabase
 * Run this BEFORE sync-to-supabase.js
 */
async function createSchemas() {
    console.log('🔧 Creating schemas on Supabase...\n');

    try {
        const sequelize = getSequelize();

        console.log('📡 Connecting to Supabase...');
        await sequelize.authenticate();
        console.log('✅ Connected!\n');

        // List of schemas used in your models
        const schemas = [
            'core',
            'inventory',
            'hr',
            'accounting',
            'sales',
            'purchase',
            'manufacturing',
            'projects',
            'service',
            'ecommerce'
        ];

        console.log('Creating schemas:');
        for (const schema of schemas) {
            try {
                await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
                console.log(`  ✅ ${schema}`);
            } catch (error) {
                console.log(`  ⚠️  ${schema} - ${error.message}`);
            }
        }

        console.log('\n✅ Schemas created successfully!');
        console.log('\n💡 Next step: Run npm run supabase:sync\n');

        await sequelize.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Failed:', error.message);
        process.exit(1);
    }
}

createSchemas();
