import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function moveTables() {
    const connectionString = process.env.LOCAL_DATABASE_URL ||
        `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`;

    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('🚀 Moving Tables from Public to Correct Schemas...\n');

        // 1. Create missing schemas
        // Ensured 'purchase' is created, not 'purchasing'
        const schemasToCreate = ['manufacturing', 'ecommerce', 'service', 'purchase'];
        for (const schema of schemasToCreate) {
            await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}";`);
            console.log(`✅ Ensure schema exists: ${schema}`);
        }

        // 2. Define moves
        const moves = [
            // Manufacturing
            { table: 'boms', target: 'manufacturing' },
            { table: 'work_orders', target: 'manufacturing' },
            { table: 'quality_checks', target: 'manufacturing' },

            // Ecommerce
            { table: 'pos_sessions', target: 'ecommerce' },
            { table: 'pos_orders', target: 'ecommerce' },
            { table: 'pos_order_lines', target: 'ecommerce' },
            { table: 'online_orders', target: 'ecommerce' },
            { table: 'online_order_lines', target: 'ecommerce' },
            { table: 'carts', target: 'ecommerce' },
            { table: 'cart_items', target: 'ecommerce' },

            // Service
            { table: 'tickets', target: 'service' },
            { table: 'slas', target: 'service' },
            { table: 'warranties', target: 'service' },

            // Purchase
            { table: 'purchase_requests', target: 'purchase' },
            { table: 'purchase_request_lines', target: 'purchase' },
            { table: 'rfqs', target: 'purchase' },
            { table: 'rfq_lines', target: 'purchase' },
            { table: 'purchase_orders', target: 'purchase' },
            { table: 'purchase_order_lines', target: 'purchase' },
        ];

        for (const move of moves) {
            try {
                // Check if table exists in public
                const checkRes = await client.query(`
                    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = $1
                `, [move.table]);

                if (checkRes.rowCount > 0) {
                    await client.query(`ALTER TABLE "public"."${move.table}" SET SCHEMA "${move.target}";`);
                    console.log(`✅ Moved ${move.table} -> ${move.target}`);
                } else {
                    // console.log(`ℹ️  Table public.${move.table} not found (already moved?).`);
                }
            } catch (err) {
                console.error(`❌ Failed to move ${move.table}: ${err.message}`);
            }
        }

        console.log('\n🏁 Migration Complete.');

    } catch (error) {
        console.error('CRITICAL ERROR:', error.message);
    } finally {
        await client.end();
    }
}

moveTables();
