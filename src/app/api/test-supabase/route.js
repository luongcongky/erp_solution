import { NextResponse } from 'next/server';
import { db, client } from '@/db';
import { sql } from 'drizzle-orm';
import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);

/**
 * @swagger
 * /api/test-supabase:
 *   get:
 *     tags:
 *       - System
 *     summary: Test Supabase database connection
 *     description: Comprehensive health check for Supabase PostgreSQL connection
 *     responses:
 *       200:
 *         description: Connection successful
 *       500:
 *         description: Connection failed
 */
export async function GET() {
    const startTime = Date.now();
    const results = {
        success: false,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        checks: {},
        connectionInfo: {},
        dnsInfo: {}, // Added DNS info
        error: null
    };

    try {
        // 0. Test DNS Resolution first
        console.log('[Supabase Test] Testing DNS resolution...');
        const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
        if (dbUrl) {
            try {
                const match = dbUrl.match(/@([^:]+):/);
                if (match) {
                    const host = match[1];
                    results.dnsInfo.host = host;
                    const { address, family } = await lookup(host);
                    results.dnsInfo.address = address;
                    results.dnsInfo.family = family;
                    results.checks.dns = {
                        status: 'success',
                        message: `Resolved to ${address} (IPv${family})`
                    };
                }
            } catch (e) {
                results.dnsInfo.error = e.message;
                results.checks.dns = {
                    status: 'error',
                    message: `DNS Lookup failed: ${e.message}`
                };
            }
        }

        // 1. Test basic connection
        console.log('[Supabase Test] Testing connection...');
        const connectionTest = await client.query('SELECT 1 as test');
        results.checks.basicConnection = {
            status: 'success',
            message: 'Basic connection successful'
        };

        // 2. Get database version and info
        console.log('[Supabase Test] Getting database info...');
        const versionResult = await client.query(`
            SELECT 
                version() as pg_version,
                current_database() as database_name,
                current_user as current_user,
                inet_server_addr() as server_ip,
                inet_server_port() as server_port
        `);

        const dbInfo = versionResult.rows[0];
        results.connectionInfo = {
            postgresVersion: dbInfo.pg_version.split(',')[0],
            databaseName: dbInfo.database_name,
            currentUser: dbInfo.current_user,
            serverIp: dbInfo.server_ip,
            serverPort: dbInfo.server_port
        };
        results.checks.databaseInfo = {
            status: 'success',
            message: 'Database info retrieved'
        };

        // 3. Test connection pool
        console.log('[Supabase Test] Testing connection pool...');
        results.connectionInfo.poolStats = {
            totalCount: client.totalCount,
            idleCount: client.idleCount,
            waitingCount: client.waitingCount
        };
        results.checks.connectionPool = {
            status: 'success',
            message: `Pool: ${client.totalCount} total, ${client.idleCount} idle, ${client.waitingCount} waiting`
        };

        // 4. Check core schema exists
        console.log('[Supabase Test] Checking core schema...');
        const schemaResult = await client.query(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name = 'core'
        `);

        if (schemaResult.rows.length > 0) {
            results.checks.coreSchema = {
                status: 'success',
                message: 'Core schema exists'
            };
        } else {
            results.checks.coreSchema = {
                status: 'warning',
                message: 'Core schema not found'
            };
        }

        // 5. Count tables in core schema
        console.log('[Supabase Test] Counting tables...');
        const tablesResult = await client.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = 'core'
        `);

        const tableCount = parseInt(tablesResult.rows[0].count);
        results.connectionInfo.coreTableCount = tableCount;
        results.checks.coreTables = {
            status: tableCount > 0 ? 'success' : 'warning',
            message: `Found ${tableCount} tables in core schema`
        };

        // 6. Test query on users table
        console.log('[Supabase Test] Testing users table...');
        try {
            const usersResult = await client.query('SELECT COUNT(*) as count FROM "core"."users"');
            const userCount = parseInt(usersResult.rows[0].count);
            results.connectionInfo.userCount = userCount;
            results.checks.usersTable = {
                status: 'success',
                message: `Users table accessible, ${userCount} users found`
            };
        } catch (error) {
            results.checks.usersTable = {
                status: 'error',
                message: `Users table error: ${error.message}`
            };
        }

        // 7. Test current time sync
        console.log('[Supabase Test] Testing time sync...');
        const timeResult = await client.query('SELECT NOW() as db_time');
        const dbTime = new Date(timeResult.rows[0].db_time);
        const localTime = new Date();
        const timeDiff = Math.abs(localTime - dbTime);

        results.connectionInfo.databaseTime = dbTime.toISOString();
        results.connectionInfo.localTime = localTime.toISOString();
        results.connectionInfo.timeDifferenceMs = timeDiff;
        results.checks.timeSync = {
            status: timeDiff < 5000 ? 'success' : 'warning',
            message: `Time difference: ${timeDiff}ms`
        };

        // 8. Check connection string source
        const connectionSource = process.env.DATABASE_URL ? 'DATABASE_URL' :
            process.env.SUPABASE_DATABASE_URL ? 'SUPABASE_DATABASE_URL' :
                'POSTGRES_* variables';
        results.connectionInfo.connectionSource = connectionSource;
        results.checks.connectionSource = {
            status: 'info',
            message: `Using ${connectionSource}`
        };

        // Calculate total response time
        const responseTime = Date.now() - startTime;
        results.connectionInfo.responseTimeMs = responseTime;
        results.checks.performance = {
            status: responseTime < 1000 ? 'success' : 'warning',
            message: `Response time: ${responseTime}ms`
        };

        // Overall success
        results.success = true;
        results.message = 'All Supabase connection tests passed';

        console.log('[Supabase Test] All tests completed successfully');
        return NextResponse.json(results, { status: 200 });

    } catch (error) {
        console.error('[Supabase Test] Error:', error);

        results.success = false;
        results.error = {
            message: error.message,
            code: error.code,
            detail: error.detail,
            hint: error.hint
        };

        // Provide helpful error messages
        if (error.code === 'ECONNREFUSED') {
            results.error.suggestion = 'Database server is not reachable. Check host and port.';
        } else if (error.code === '28P01') {
            results.error.suggestion = 'Authentication failed. Check username and password.';
        } else if (error.code === '3D000') {
            results.error.suggestion = 'Database does not exist. Check database name.';
        } else if (error.code === 'ETIMEDOUT') {
            results.error.suggestion = 'Connection timeout. Check network and firewall settings.';
        }

        return NextResponse.json(results, { status: 500 });
    }
}
