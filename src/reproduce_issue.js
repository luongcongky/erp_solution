import AuditLog from './models/sequelize/core/AuditLog.js';
import { getSequelize, closeConnection } from './config/database.js';

async function run() {
    try {
        console.log('Authenticating...');
        const sequelize = getSequelize();
        await sequelize.authenticate();
        console.log('Authentication successful.');

        console.log('Attempting to create AuditLog...');
        const log = await AuditLog.create({
            user_id: null,
            action: 'CREATE',
            module: 'USERS',
            object_type: null,
            object_id: null,
            changes: null,
            ten_id: 'ANTIGRAVITY',
            stg_id: 'DEV'
        });
        console.log('AuditLog created successfully:', log.toJSON());
    } catch (error) {
        console.error('Error details:', error);
        if (error.original) {
            console.error('Original error:', error.original);
        }
    } finally {
        await closeConnection();
    }
}

run();
