/**
 * Script to test database connection
 * Run: node test-db-connection.js
 */

import pg from 'pg';
const { Pool } = pg;

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Get connection string (same logic as src/db/index.ts)
const connectionString =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DATABASE_URL ||
    `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`;

console.log('🔍 Testing database connection...\n');
console.log('Connection string:', connectionString.replace(/:[^:@]+@/, ':****@')); // Hide password
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('');

const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 1,
    connectionTimeoutMillis: 10000,
});

async function testConnection() {
    try {
        console.log('⏳ Connecting to database...');
        const client = await pool.connect();
        console.log('✅ Connected successfully!\n');

        // Test query
        console.log('⏳ Running test query...');
        const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
        console.log('✅ Query successful!\n');

        console.log('📊 Database Info:');
        console.log('   Time:', result.rows[0].current_time);
        console.log('   Version:', result.rows[0].pg_version.split(',')[0]);
        console.log('');

        // Test core schema
        console.log('⏳ Checking core schema...');
        const schemaResult = await client.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = 'core'
        `);
        console.log(`✅ Found ${schemaResult.rows[0].count} tables in 'core' schema\n`);

        // Test users table
        console.log('⏳ Checking users table...');
        const usersResult = await client.query('SELECT COUNT(*) as count FROM "core"."users"');
        console.log(`✅ Found ${usersResult.rows[0].count} users\n`);

        client.release();

        console.log('🎉 All tests passed! Database connection is working correctly.');

    } catch (error) {
        console.error('❌ Connection failed!\n');
        console.error('Error:', error.message);
        console.error('\nDetails:', error);

        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Suggestions:');
            console.error('   - Check if database server is running');
            console.error('   - Verify host and port are correct');
            console.error('   - Check firewall settings');
        } else if (error.code === '28P01') {
            console.error('\n💡 Suggestions:');
            console.error('   - Check username and password');
            console.error('   - Verify database credentials');
        } else if (error.code === '3D000') {
            console.error('\n💡 Suggestions:');
            console.error('   - Check database name');
            console.error('   - Verify database exists');
        }

        process.exit(1);
    } finally {
        await pool.end();
    }
}

testConnection();
