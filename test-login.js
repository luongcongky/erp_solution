import models, { initializeDatabase } from './src/models/sequelize/index.js';

async function testLogin() {
    try {
        console.log('Testing database connection and login (no sync)...');

        const { User } = models;
        const { sequelize } = await import('./src/models/sequelize/index.js');

        // Just authenticate, don't sync
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Setup associations only
        const { default: modelsExport } = await import('./src/models/sequelize/index.js');

        // Try to find user
        const user = await User.findOne({
            where: {
                email: 'admin@gmail.com',
                ten_id: 'DEMO',
                stg_id: 'DEV'
            }
        });

        if (user) {
            console.log('✅ User found:', {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            });

            // Test password
            const bcrypt = await import('bcrypt');
            const isMatch = await bcrypt.compare('admin123', user.password);
            console.log('✅ Password match:', isMatch);
        } else {
            console.log('❌ User not found');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testLogin();
