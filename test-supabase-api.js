/**
 * Test script for Supabase connection API
 * Run: node test-supabase-api.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testSupabaseAPI() {
    console.log('🧪 Testing Supabase Connection API\n');
    console.log(`API URL: ${API_URL}/api/test-supabase\n`);

    try {
        console.log('⏳ Sending request...\n');
        const startTime = Date.now();

        const response = await fetch(`${API_URL}/api/test-supabase`);
        const data = await response.json();

        const requestTime = Date.now() - startTime;

        console.log('📊 Response Status:', response.status);
        console.log('⏱️  Request Time:', requestTime, 'ms\n');

        if (data.success) {
            console.log('✅ SUCCESS - All checks passed!\n');

            console.log('📋 Connection Info:');
            console.log('   Database:', data.connectionInfo.databaseName);
            console.log('   User:', data.connectionInfo.currentUser);
            console.log('   PostgreSQL:', data.connectionInfo.postgresVersion);
            console.log('   Connection Source:', data.connectionInfo.connectionSource);
            console.log('   Response Time:', data.connectionInfo.responseTimeMs, 'ms');
            console.log('');

            console.log('📊 Pool Stats:');
            console.log('   Total:', data.connectionInfo.poolStats.totalCount);
            console.log('   Idle:', data.connectionInfo.poolStats.idleCount);
            console.log('   Waiting:', data.connectionInfo.poolStats.waitingCount);
            console.log('');

            console.log('📁 Schema Info:');
            console.log('   Core Tables:', data.connectionInfo.coreTableCount);
            console.log('   Users:', data.connectionInfo.userCount);
            console.log('');

            console.log('⏰ Time Sync:');
            console.log('   Database Time:', data.connectionInfo.databaseTime);
            console.log('   Local Time:', data.connectionInfo.localTime);
            console.log('   Difference:', data.connectionInfo.timeDifferenceMs, 'ms');
            console.log('');

            console.log('✅ Health Checks:');
            Object.entries(data.checks).forEach(([name, check]) => {
                const icon = check.status === 'success' ? '✅' :
                    check.status === 'warning' ? '⚠️' :
                        check.status === 'error' ? '❌' : 'ℹ️';
                console.log(`   ${icon} ${name}: ${check.message}`);
            });
            console.log('');

        } else {
            console.log('❌ FAILED - Connection error!\n');

            console.log('Error Details:');
            console.log('   Message:', data.error.message);
            console.log('   Code:', data.error.code);
            if (data.error.suggestion) {
                console.log('   💡 Suggestion:', data.error.suggestion);
            }
            console.log('');
        }

        // Summary
        console.log('═══════════════════════════════════════');
        if (data.success) {
            console.log('🎉 Supabase connection is healthy!');
        } else {
            console.log('⚠️  Supabase connection has issues!');
        }
        console.log('═══════════════════════════════════════');

    } catch (error) {
        console.error('❌ Request failed!\n');
        console.error('Error:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Suggestion: Make sure dev server is running (npm run dev)');
        }

        process.exit(1);
    }
}

// Run test
testSupabaseAPI();
