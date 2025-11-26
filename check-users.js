import models from './src/models/sequelize/index.js';
import { sequelize } from './src/models/sequelize/index.js';

async function checkUsers() {
    try {
        console.log('Checking users in database...');

        const { User } = models;

        // Just authenticate, don't sync
        await sequelize.authenticate();
        console.log('✅ Database connected\n');

        // Find all users
        const users = await User.findAll({
            attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'ten_id', 'stg_id'],
            limit: 10
        });

        console.log(`Found ${users.length} users:`);
        users.forEach(user => {
            const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'No name';
            console.log(`- ${user.email} (${fullName}) - Role: ${user.role}, TenID: ${user.ten_id}, StgID: ${user.stg_id}`);
        });

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkUsers();
