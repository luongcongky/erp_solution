import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import dns from 'dns';

const { Pool } = pg;

// Database connection string
// Priority: DATABASE_URL > SUPABASE_DATABASE_URL > individual POSTGRES_* variables
const connectionString =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DATABASE_URL ||
    `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`;

// Create postgres pool
const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
    // Explicitly pass lookup to fix ENOTFOUND on Vercel
    // @ts-ignore - lookup is supported by pg but missing in types
    lookup: (hostname, options, callback) => {
        dns.lookup(hostname, options, callback);
    },
});

// Create drizzle instance
export const db = drizzle(pool);

// Export pool as client for closing connection
export const client = pool;


