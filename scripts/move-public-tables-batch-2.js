import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function moveTablesBatch2() {
    const connectionString = process.env.LOCAL_DATABASE_URL ||
        `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`;

    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('🚀 Moving Batch 2 Tables from Public to Correct Schemas...\n');

        // Define moves
        const moves = [
            // Accounting
            { table: 'invoices', target: 'accounting' },
            { table: 'invoice_lines', target: 'accounting' },
            { table: 'payments', target: 'accounting' },
            { table: 'journals', target: 'accounting' },
            { table: 'journal_items', target: 'accounting' },
            { table: 'tax_codes', target: 'accounting' },
            { table: 'bank_accounts', target: 'accounting' },

            // HR
            { table: 'attendance', target: 'hr' },
            { table: 'leaves', target: 'hr' },
            { table: 'leave_types', target: 'hr' },
            { table: 'payroll_runs', target: 'hr' },
            { table: 'payroll_lines', target: 'hr' },
            { table: 'contracts', target: 'hr' },

            // Sales
            { table: 'quotation_lines', target: 'sales' },
            { table: 'sales_order_lines', target: 'sales' },
            { table: 'customer_activities', target: 'sales' },
            { table: 'orders', target: 'sales' }, // Legacy

            // Inventory
            { table: 'stock_adjustment_lines', target: 'inventory' },
            { table: 'stock_adjustments', target: 'inventory' },
            { table: 'stock_quant', target: 'inventory' },
            { table: 'stock_balances', target: 'inventory' }, // Legacy/Duplicate
            { table: 'stock_moves', target: 'inventory' }, // Legacy/Duplicate
            { table: 'products', target: 'inventory' }, // Legacy/Duplicate

            // Projects
            { table: 'project_costs', target: 'projects' },
            { table: 'timesheets', target: 'projects' },

            // Manufacturing (Missed in Batch 1)
            { table: 'bom_lines', target: 'manufacturing' },
            { table: 'work_order_lines', target: 'manufacturing' },
            { table: 'routing_steps', target: 'manufacturing' },
            { table: 'routings', target: 'manufacturing' },
            { table: 'maintenance_logs', target: 'manufacturing' }, // Assuming maintenance belongs here for now

            // Core / Common
            { table: 'companies', target: 'core' },
            { table: 'settings', target: 'core' },
            { table: 'approvals', target: 'core' },
            { table: 'role_permissions', target: 'core' },
            { table: 'kpis', target: 'core' },
            { table: 'workflow_instances', target: 'core' },
            { table: 'workflows', target: 'core' },
            { table: 'supplier_evaluations', target: 'purchase' }, // Put this in purchase
        ];

        for (const move of moves) {
            try {
                // Check if target schema exists, if not create
                await client.query(`CREATE SCHEMA IF NOT EXISTS "${move.target}";`);

                // Check if table exists in public
                const checkRes = await client.query(`
                    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = $1
                `, [move.table]);

                if (checkRes.rowCount > 0) {
                    await client.query(`ALTER TABLE "public"."${move.table}" SET SCHEMA "${move.target}";`);
                    console.log(`✅ Moved ${move.table} -> ${move.target}`);
                } else {
                    // check if it's already in the target
                    const checkTarget = await client.query(`
                        SELECT 1 FROM pg_tables WHERE schemaname = $2 AND tablename = $1
                    `, [move.table, move.target]);

                    if (checkTarget.rowCount > 0) {
                        console.log(`ℹ️  ${move.table} is already in ${move.target}.`);
                    } else {
                        console.log(`⚠️  Table public.${move.table} not found.`);
                    }
                }
            } catch (err) {
                console.error(`❌ Failed to move ${move.table}: ${err.message}`);
            }
        }

        console.log('\n🏁 Batch 2 Migration Complete.');

    } catch (error) {
        console.error('CRITICAL ERROR:', error.message);
    } finally {
        await client.end();
    }
}

moveTablesBatch2();
