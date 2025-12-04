import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check environment variables on Vercel
 */
export async function GET() {
    const envInfo = {
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV,
        hasDatabase: !!process.env.DATABASE_URL,
        hasSupabase: !!process.env.SUPABASE_DATABASE_URL,
        hasPostgresUser: !!process.env.POSTGRES_USER,
        hasPostgresHost: !!process.env.POSTGRES_HOST,
        // Show first 20 chars of DATABASE_URL to verify (hide password)
        databaseUrlPrefix: process.env.DATABASE_URL ?
            process.env.DATABASE_URL.substring(0, 30) + '...' : 'NOT SET',
        supabaseUrlPrefix: process.env.SUPABASE_DATABASE_URL ?
            process.env.SUPABASE_DATABASE_URL.substring(0, 30) + '...' : 'NOT SET',
        // Show which env vars are available
        availableEnvVars: Object.keys(process.env).filter(key =>
            key.includes('DATABASE') ||
            key.includes('POSTGRES') ||
            key.includes('SUPABASE')
        )
    };

    return NextResponse.json(envInfo);
}
