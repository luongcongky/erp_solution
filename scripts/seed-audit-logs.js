import getSequelize from '../src/config/database.js';
import AuditLog from '../src/models/sequelize/core/AuditLog.js';

const sequelize = getSequelize();

// Helper function to generate random date between two dates
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to get random item from array
function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Sample data arrays
const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'EXPORT', 'IMPORT'];
const modules = ['Core', 'Sales', 'Finance', 'Inventory', 'HR', 'Projects', 'Service'];
const objectTypes = ['User', 'Role', 'Customer', 'Product', 'Order', 'Invoice', 'Employee', 'Project', 'Task'];
const users = [
    'Admin User',
    'Sales Manager',
    'Finance Manager',
    'Inventory Manager',
    'HR Manager',
    'Project Manager',
    'John Doe',
    'Jane Smith',
    'Bob Johnson',
    'Alice Williams'
];

// Generate random IP address
function randomIP() {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

// Generate random details based on action and object type
function generateDetails(action, objectType) {
    const details = {
        CREATE: `Created new ${objectType.toLowerCase()}`,
        UPDATE: `Updated ${objectType.toLowerCase()} information`,
        DELETE: `Deleted ${objectType.toLowerCase()}`,
        LOGIN: 'User logged in successfully',
        LOGOUT: 'User logged out',
        VIEW: `Viewed ${objectType.toLowerCase()} details`,
        EXPORT: `Exported ${objectType.toLowerCase()} data to CSV`,
        IMPORT: `Imported ${objectType.toLowerCase()} data from file`
    };
    return details[action] || `Performed ${action} on ${objectType}`;
}

async function seedAuditLogs() {
    try {
        console.log('🌱 Starting audit logs seeding...');

        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connection established');

        // Sync model (create table if not exists)
        await AuditLog.sync();
        console.log('✅ AuditLog table synced');

        // Check existing count
        const existingCount = await AuditLog.count();
        console.log(`📊 Existing audit logs: ${existingCount}`);

        // Define date range: 2021-01-01 to now
        const startDate = new Date('2021-01-01');
        const endDate = new Date();

        console.log(`📅 Generating logs from ${startDate.toISOString()} to ${endDate.toISOString()}`);

        // Generate 30,000 records
        const totalRecords = 30000;
        const batchSize = 1000; // Insert in batches for better performance
        const batches = Math.ceil(totalRecords / batchSize);

        for (let batch = 0; batch < batches; batch++) {
            const records = [];
            const recordsInBatch = Math.min(batchSize, totalRecords - (batch * batchSize));

            for (let i = 0; i < recordsInBatch; i++) {
                const action = randomItem(actions);
                const objectType = randomItem(objectTypes);
                const module = randomItem(modules);
                const user = randomItem(users);

                records.push({
                    user_id: null, // We don't have actual user IDs, so null
                    action: action,
                    module: module,
                    object_type: objectType,
                    object_id: null,
                    changes: {
                        user: user,
                        ip: randomIP(),
                        details: generateDetails(action, objectType),
                        timestamp: randomDate(startDate, endDate).toISOString()
                    },
                    ten_id: '1000',
                    stg_id: 'DEV',
                    created_at: randomDate(startDate, endDate)
                });
            }

            // Bulk insert
            await AuditLog.bulkCreate(records, {
                validate: true,
                ignoreDuplicates: false
            });

            const progress = ((batch + 1) / batches * 100).toFixed(1);
            console.log(`⏳ Progress: ${progress}% (${(batch + 1) * batchSize}/${totalRecords} records)`);
        }

        const finalCount = await AuditLog.count();
        console.log(`✅ Seeding completed! Total audit logs: ${finalCount}`);
        console.log(`📈 New records added: ${finalCount - existingCount}`);

    } catch (error) {
        console.error('❌ Error seeding audit logs:', error);
        throw error;
    } finally {
        await sequelize.close();
        console.log('👋 Database connection closed');
    }
}

// Run the seeder
seedAuditLogs()
    .then(() => {
        console.log('🎉 Audit logs seeding finished successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Audit logs seeding failed:', error);
        process.exit(1);
    });
