
import models, { sequelize, setupAssociations } from './src/models/sequelize/index.js';

async function fixUserRoles() {
    try {
        await sequelize.authenticate();
        console.log('Connection established.');
        setupAssociations();

        const users = await models.User.findAll();
        const roles = await models.Role.findAll();

        // Clear existing user_roles to ensure clean state (optional, but good for dev)
        await sequelize.query('TRUNCATE TABLE "core"."user_roles"');
        console.log('Cleared user_roles table.');

        let count = 0;
        for (const user of users) {
            const roleName = (user.role || 'user').toLowerCase();
            const userTenId = user.ten_id || '1000';
            const userStgId = user.stg_id || 'DEV';

            // Find matching role
            const targetRole = roles.find(r =>
                r.name.toLowerCase() === roleName &&
                r.ten_id === userTenId &&
                r.stg_id === userStgId
            );

            if (targetRole) {
                await sequelize.query(
                    'INSERT INTO "core"."user_roles" (user_id, role_id, "createdAt", "updatedAt") VALUES (:userId, :roleId, NOW(), NOW())',
                    {
                        replacements: { userId: user.id, roleId: targetRole.id }
                    }
                );
                console.log(`Assigned ${targetRole.name} (ID: ${targetRole.id}) to user ${user.email} (Ten: ${userTenId})`);
                count++;
            } else {
                console.warn(`Role ${roleName} not found for user ${user.email} in Ten: ${userTenId}`);
            }
        }

        console.log(`Fixed ${count} user role assignments.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

fixUserRoles();
