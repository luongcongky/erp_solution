
import models, { sequelize } from './src/models/sequelize/index.js';

async function debugUserRoles() {
    try {
        await sequelize.authenticate();
        console.log('Connection established.');

        // Check Users
        const users = await models.User.findAll();
        console.log(`Found ${users.length} users.`);
        users.forEach(u => console.log(`User: ${u.email}, Role Column: ${u.role}, ID: ${u.id}`));

        // Check Roles
        const roles = await models.Role.findAll();
        console.log(`Found ${roles.length} roles.`);
        roles.forEach(r => console.log(`Role: ${r.name}, ID: ${r.id}`));

        // Check UserRoles (Junction)
        // We need to query the raw table or use the association if defined
        const [results] = await sequelize.query('SELECT * FROM "core"."user_roles"');
        console.log(`Found ${results.length} entries in user_roles table.`);
        console.log(results);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

debugUserRoles();
