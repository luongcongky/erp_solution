
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:postgres@localhost:5432/antigravity', {
    dialect: 'postgres',
    logging: false
});

async function checkData() {
    try {
        const users = await sequelize.query('SELECT id, email FROM "core"."users"', { type: sequelize.QueryTypes.SELECT });
        console.log('Users:', users);

        const roles = await sequelize.query('SELECT id, name FROM "core"."roles"', { type: sequelize.QueryTypes.SELECT });
        console.log('Roles:', roles);

        const userRoles = await sequelize.query('SELECT * FROM "core"."user_roles"', { type: sequelize.QueryTypes.SELECT });
        console.log('User Roles:', userRoles);
    } catch (error) {
        console.error('Error checking data:', error);
    } finally {
        await sequelize.close();
    }
}

checkData();
