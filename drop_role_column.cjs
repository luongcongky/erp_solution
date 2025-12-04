
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:postgres@localhost:5432/antigravity', {
    dialect: 'postgres',
    logging: false
});

async function dropColumn() {
    try {
        await sequelize.query('ALTER TABLE "core"."users" DROP COLUMN IF EXISTS "role";');
        console.log('Successfully dropped role column');
    } catch (error) {
        console.error('Error dropping role column:', error);
    } finally {
        await sequelize.close();
    }
}

dropColumn();
