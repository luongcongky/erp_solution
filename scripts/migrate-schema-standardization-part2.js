import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;

const connectionString = `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || '123456'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'erp'}`;

const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool);
export const client = pool;

async function migrate() {
    try {
        console.log('🚀 Starting schema standardization migration (Part 2)...');

        // 1. Partners table
        console.log('\n📦 Migrating partners table...');
        await db.execute(sql`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='partners' AND column_name='createdAt') THEN
                    ALTER TABLE core.partners RENAME COLUMN "createdAt" TO created_at;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='partners' AND column_name='updatedAt') THEN
                    ALTER TABLE core.partners RENAME COLUMN "updatedAt" TO updated_at;
                END IF;
            END $$;
        `);
        console.log('✅ Partners table migrated');

        // 2. Menus table
        console.log('\n📦 Migrating menus table...');
        await db.execute(sql`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='menus' AND column_name='parentId') THEN
                    ALTER TABLE core.menus RENAME COLUMN "parentId" TO parent_id;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='menus' AND column_name='isActive') THEN
                    ALTER TABLE core.menus RENAME COLUMN "isActive" TO is_active;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='menus' AND column_name='createdAt') THEN
                    ALTER TABLE core.menus RENAME COLUMN "createdAt" TO created_at;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='menus' AND column_name='updatedAt') THEN
                    ALTER TABLE core.menus RENAME COLUMN "updatedAt" TO updated_at;
                END IF;
            END $$;
        `);
        console.log('✅ Menus table migrated');

        console.log('\n✨ Migration Part 2 completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await client.end();
    }
}

migrate();
