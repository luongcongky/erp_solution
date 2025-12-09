import dotenv from 'dotenv';
import { URL } from 'url';

dotenv.config();

function checkconfig() {
    console.log('🔍 Checking Configuration Consistency...\n');

    const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const dbUrl = process.env.SUPABASE_DATABASE_URL;

    console.log('API URL Present:', !!apiUrl);
    console.log('DB URL Present:', !!dbUrl);

    if (apiUrl) {
        try {
            const projectRef = apiUrl.replace('https://', '').replace('.supabase.co', '');
            console.log('Project ID (from API):', projectRef);

            if (dbUrl) {
                const dbUrlObj = new URL(dbUrl);
                const dbHost = dbUrlObj.hostname;
                console.log('DB Hostname:', dbHost);

                // Expected host format: db.[PROJECT_ID].supabase.co
                const expectedHost = `db.${projectRef}.supabase.co`;

                if (dbHost === expectedHost) {
                    console.log('✅ Hostname matches Project ID pattern');
                } else {
                    console.log('⚠️  Hostname mismatch!');
                    console.log(`   Expected: ${expectedHost}`);
                    console.log(`   Actual:   ${dbHost}`);
                    console.log('   (This might be okay if using a custom domain or different region, but usually indicates an error)');
                }
            }

        } catch (e) {
            console.error('Error parsing URLs:', e.message);
        }
    }
}

checkconfig();
