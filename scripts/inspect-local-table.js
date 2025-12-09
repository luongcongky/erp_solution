import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

async function inspectTable(schema, table) {
    console.log(`🔍 Inspecting Local Table: ${schema}.${table}\n`);

    const connectionString = process.env.LOCAL_DATABASE_URL ||
        `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`;

    const client = new Client({ connectionString });

    try {
        await client.connect();

        const res = await client.query(`
            SELECT column_name, data_type, udt_name, character_maximum_length, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = $1 AND table_name = $2
            ORDER BY ordinal_position;
        `, [schema, table]);

        if (res.rows.length === 0) {
            console.log('⚠️  Table not found or no columns!');
        } else {
            console.log('Columns:');
            res.rows.forEach(r => {
                const type = r.character_maximum_length ? `${r.udt_name}(${r.character_maximum_length})` : r.udt_name;
                console.log(`   - ${r.column_name}: ${type} ${r.is_nullable === 'YES' ? '(nullable)' : 'NOT NULL'}`);
            });
        }

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
}

// Inspect inventory.stock_lots
inspectTable('inventory', 'stock_lots');
inspectTable('inventory', 'stock_movements');
