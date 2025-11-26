import getSequelize from '@/config/database';

export class PostgreSQLAdapter {
    constructor() {
        this.sequelize = getSequelize();
        this.type = 'postgres';
    }

    getType() {
        return this.type;
    }

    async connect() {
        try {
            await this.sequelize.authenticate();
            return true;
        } catch (error) {
            console.error('[PostgreSQLAdapter] Unable to connect:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await this.sequelize.close();
            return true;
        } catch (error) {
            console.error('[PostgreSQLAdapter] Error closing connection:', error);
            throw error;
        }
    }

    getInstance() {
        return this.sequelize;
    }
}

export default PostgreSQLAdapter;
