import { NextResponse } from 'next/server';
import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);

/**
 * Debug endpoint to check environment variables and DNS on Vercel
 */
export async function GET() {
    const dbUrl = process.env.DATABASE_URL || '';
    let dnsResult = { status: 'skipped', ip: null, error: null };
    let parsedConfig = { host: null, port: null, user: null, database: null };

    // Parse connection string manually to check for hidden chars or parsing errors
    if (dbUrl) {
        try {
            // Simple regex to parse postgres url
            // postgresql://user:pass@host:port/db
            const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
            if (match) {
                parsedConfig = {
                    user: match[1],
                    // pass: match[2], // Don't log password
                    host: match[3],
                    port: match[4],
                    database: match[5]
                };

                // Test DNS resolution
                try {
                    const { address } = await lookup(parsedConfig.host);
                    dnsResult = { status: 'success', ip: address, error: null };
                } catch (err) {
                    dnsResult = { status: 'failed', ip: null, error: err.message };
                }
            } else {
                parsedConfig.error = 'Regex did not match URL format';
            }
        } catch (e) {
            parsedConfig.error = e.message;
        }
    }

    const envInfo = {
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV,
        hasDatabase: !!process.env.DATABASE_URL,
        databaseUrlLength: dbUrl.length,
        // Check for quotes
        startsWithQuote: dbUrl.startsWith('"') || dbUrl.startsWith("'"),
        // Show first 30 chars
        databaseUrlPrefix: dbUrl.substring(0, 30) + '...',
        parsedConfig,
        dnsResult,
        availableEnvVars: Object.keys(process.env).filter(key =>
            key.includes('DATABASE') ||
            key.includes('POSTGRES') ||
            key.includes('SUPABASE')
        )
    };

    return NextResponse.json(envInfo);
}
