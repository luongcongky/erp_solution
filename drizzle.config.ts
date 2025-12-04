import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default defineConfig({
    schema: './src/db/schema/*',
    out: './drizzle/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`,
    },
    verbose: true,
    strict: true,
});
