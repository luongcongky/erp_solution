import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import dns from 'dns';

const { Pool } = pg;

// Determine which database to use based on DB_PROVIDER
// Smart fallback: In production, if DB_PROVIDER is not set but DATABASE_URL or SUPABASE_DATABASE_URL exists, use supabase
// Smart fallback: If DB_PROVIDER is set, use it.
// If not, and SUPABASE_DATABASE_URL exists, use 'supabase'.
const dbProvider = process.env.DB_PROVIDER ||
    ((process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL) ? 'supabase' : 'local');

// Database connection string based on provider
const getConnectionString = () => {
    if (dbProvider === 'supabase') {
        // Supabase connection - prefer DATABASE_URL (standard) over SUPABASE_DATABASE_URL (legacy)
        return process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
    } else {
        // Local PostgreSQL connection
        return process.env.LOCAL_DATABASE_URL ||
            `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`;
    }
};

const connectionString = getConnectionString();

console.log(`🔍 Debug: DB_PROVIDER env var is: '${process.env.DB_PROVIDER}'`);
console.log(`🔧 Database Connection - Using: ${dbProvider.toUpperCase()} database`);
console.log(`📍 Connection: ${connectionString?.replace(/:[^:@]+@/, ':***@') || 'NOT SET'}`);

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
        // Try IPv4 first (most compatible, avoids breaking Vercel's caching if applicable)
        dns.lookup(hostname, { family: 4 }, (err, address, family) => {
            if (err) {
                // IPv4 failed. Accessing Supabase direct connection likely requires IPv6.
                // We typically get ENOTFOUND here if no A record exists.
                // IMPORTANT: Do NOT pass `...options` here. pg might pass hints like ADDRCONFIG
                // which causes lookup to fail if the container doesn't have a public IPv6 identity,
                // even if it can route IPv6. We just want the address.
                const IPv6_OPTIONS = { family: 6 };
                dns.lookup(hostname, IPv6_OPTIONS, (err2, addr2, fam2) => {
                    if (err2) {
                        console.error(`[DB] DNS Lookup failed for ${hostname}. IPv4 error: ${err.message}, IPv6 error: ${err2.message}`);
                        callback(err2, addr2, fam2);
                    } else {
                        console.log(`[DB] Resolved ${hostname} to ${addr2} (IPv${fam2})`);
                        callback(null, addr2, fam2);
                    }
                });
            } else {
                console.log(`[DB] Resolved ${hostname} to ${address} (IPv${family})`);
                callback(null, address, family);
            }
        });
    },
});

// Create drizzle instance with logging enabled
export const db = drizzle(pool, {
    logger: {
        logQuery: (query, params) => {
            console.log('[DRIZZLE SQL]', query);
            console.log('[DRIZZLE PARAMS]', params);
        }
    }
});

// Export pool as client for closing connection
export const client = pool;


