import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Determine which database to use
const dbProvider = process.env.DB_PROVIDER || 'local'; // 'local' or 'supabase'

// Connection string based on provider
const getConnectionString = () => {
    if (dbProvider === 'supabase') {
        // Supabase connection
        let url = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
        if (url && !url.includes('sslmode=')) {
            url += '?sslmode=no-verify';
        }
        return url;
    } else {
        // Local PostgreSQL connection
        return process.env.LOCAL_DATABASE_URL ||
            `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`;
    }
};

const connectionString = getConnectionString();

console.log(`🔧 Drizzle Config - Using: ${dbProvider.toUpperCase()} database`);
console.log(`📍 Connection: ${connectionString?.replace(/:[^:@]+@/, ':***@') || 'NOT SET'}`);

export default defineConfig({
    schema: './src/db/schema/*',
    out: './drizzle/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: connectionString!,
    },
    verbose: true,
    strict: true,
});
