import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

console.log('🚀 Running Drizzle Push with Session Pooler (Port 5432)...\n');

let connectionString = process.env.SUPABASE_DATABASE_URL;

if (!connectionString) {
    console.error('No SUPABASE_DATABASE_URL found.');
    process.exit(1);
}

// Force port 5432
if (connectionString.includes(':6543')) {
    connectionString = connectionString.replace(':6543', ':5432');
    console.log('Using Port 5432 for Schema Push.');
}

// Set env var for this process + child process
process.env.SUPABASE_DATABASE_URL = connectionString;
process.env.DB_PROVIDER = 'supabase';

try {
    // Run db:push
    execSync('npm run db:push', { stdio: 'inherit', env: process.env });
    console.log('\n✅ Push completed.');
} catch (e) {
    console.error('\n❌ Push failed.');
    process.exit(1);
}
