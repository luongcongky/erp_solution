import { Sequelize } from 'sequelize';

let sequelize = null;

/**
 * Get or create Sequelize instance
 */
export function getSequelize() {
    if (sequelize) {
        return sequelize;
    }

    const config = {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        database: process.env.POSTGRES_DB || 'erp',
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || '123456',
        dialect: 'postgres',
        logging: console.log,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    };

    sequelize = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        logging: config.logging,
        pool: config.pool,
    });

    return sequelize;
}

/**
 * Test database connection
 */
export async function testConnection() {
    const db = getSequelize();
    try {
        await db.authenticate();
        console.log('[PostgreSQL] Connection established successfully');
        return true;
    } catch (error) {
        console.error('[PostgreSQL] Unable to connect:', error);
        return false;
    }
}

/**
 * Close database connection
 */
export async function closeConnection() {
    if (sequelize) {
        await sequelize.close();
        sequelize = null;
        console.log('[PostgreSQL] Connection closed');
    }
}

export default getSequelize;
