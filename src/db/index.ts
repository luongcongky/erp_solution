import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

const { Pool } = pg;

// Database connection string
const connectionString = `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`;

// Create postgres pool
const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
});

// Create drizzle instance
export const db = drizzle(pool);

// Export pool as client for closing connection
export const client = pool;


