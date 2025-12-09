import dotenv from 'dotenv';
import { URL } from 'url';

dotenv.config();

async function debugConnection() {
    console.log('🔍 Debugging SUPABASE_DATABASE_URL...\n');

    const dbUrl = process.env.SUPABASE_DATABASE_URL;

    if (!dbUrl) {
        console.error('❌ SUPABASE_DATABASE_URL is not set!');
        return;
    }

    try {
        const parsed = new URL(dbUrl);
        console.log('Protocol:', parsed.protocol);
        console.log('Hostname:', parsed.hostname);
        console.log('Port:', parsed.port);
        console.log('Database:', parsed.pathname);
        console.log('Username:', parsed.username);
        console.log('Password set:', parsed.password ? 'YES (masked)' : 'NO');

        console.log('\nChecking DNS resolution for:', parsed.hostname);

        const dns = await import('dns/promises');
        try {
            const result = await dns.lookup(parsed.hostname);
            console.log('✅ DNS Lookup success:', result);
        } catch (e) {
            console.error('❌ DNS Lookup failed:', e.code);
        }

    } catch (e) {
        console.error('❌ Invalid URL format:', e.message);
    }
}

debugConnection();
