
import models, { sequelize, setupAssociations } from './src/models/sequelize/index.js';

const { Role, Permission } = models;

async function debugRoles() {
    try {
        await sequelize.authenticate();
        console.log('Connection established successfully.');
        setupAssociations();

        const roles = await models.Role.findAll({
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM "core"."user_roles" AS "UserRoles"
                            WHERE "UserRoles"."role_id" = "Role"."id"
                        )`),
                        'usersCount'
                    ]
                ]
            },
            where: { ten_id: '1000', stg_id: 'DEV' },
            include: [{
                model: Permission,
                through: { attributes: [] }
            }],
            order: [['name', 'ASC']]
        });
        console.log(`Found ${roles.length} roles with count:`);
        roles.forEach(role => {
            console.log(JSON.stringify(role.toJSON(), null, 2));
        });

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

debugRoles();
