// Simple test script to verify database connection
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getDatabase } from './src/lib/db.js';
import { getMenuRepository } from './src/lib/repositories/index.js';

async function test() {
    try {
        console.log('Testing database connection...');

        // Test 1: Get database adapter
        const db = await getDatabase();
        console.log('✓ Database adapter initialized:', db.getType());

        // Test 2: Get menu repository
        const menuRepo = await getMenuRepository();
        console.log('✓ Menu repository created');

        // Test 3: Try to fetch menus
        const menus = await menuRepo.findByTenantAndStage('1000', 'DEV');
        console.log('✓ Found', menus.length, 'menus');

        // Test 4: Build menu tree
        const tree = await menuRepo.buildMenuTree('1000', 'DEV', 'admin');
        console.log('✓ Built menu tree with', tree.length, 'root items');

        console.log('\n✅ All tests passed!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

test();
