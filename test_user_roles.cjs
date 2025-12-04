const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/antigravity'
});

const db = drizzle(pool);

async function testQuery() {
    try {
        // Check user_roles table
        const userRolesResult = await pool.query('SELECT * FROM "core"."user_roles" LIMIT 10');
        console.log('User Roles:', JSON.stringify(userRolesResult.rows, null, 2));

        // Test the exact subquery for a specific user
        const userId = '74096830-d8fa-44c7-b2b8-03781ceb3d04';
        const roleQuery = await pool.query(`
            SELECT STRING_AGG(r.name, ', ') as roles
            FROM "core"."user_roles" ur
            JOIN "core"."roles" r ON ur.role_id = r.id
            WHERE ur.user_id = $1
        `, [userId]);
        console.log('Roles for user', userId, ':', roleQuery.rows);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

testQuery();
