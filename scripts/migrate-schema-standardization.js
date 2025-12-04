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
        console.log('🚀 Starting schema standardization migration...');

        // 1. Users table
        console.log('\n📦 Migrating users table...');
        await db.execute(sql`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='users' AND column_name='firstName') THEN
                    ALTER TABLE core.users RENAME COLUMN "firstName" TO first_name;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='users' AND column_name='lastName') THEN
                    ALTER TABLE core.users RENAME COLUMN "lastName" TO last_name;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='users' AND column_name='isActive') THEN
                    ALTER TABLE core.users RENAME COLUMN "isActive" TO is_active;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='users' AND column_name='createdAt') THEN
                    ALTER TABLE core.users RENAME COLUMN "createdAt" TO created_at;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='users' AND column_name='updatedAt') THEN
                    ALTER TABLE core.users RENAME COLUMN "updatedAt" TO updated_at;
                END IF;
            END $$;
        `);
        console.log('✅ Users table migrated');

        // 2. Roles table
        console.log('\n📦 Migrating roles table...');
        await db.execute(sql`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='roles' AND column_name='createdAt') THEN
                    ALTER TABLE core.roles RENAME COLUMN "createdAt" TO created_at;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='roles' AND column_name='updatedAt') THEN
                    ALTER TABLE core.roles RENAME COLUMN "updatedAt" TO updated_at;
                END IF;
            END $$;
        `);
        console.log('✅ Roles table migrated');

        // 3. User Roles table
        console.log('\n📦 Migrating user_roles table...');
        await db.execute(sql`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='user_roles' AND column_name='createdAt') THEN
                    ALTER TABLE core.user_roles RENAME COLUMN "createdAt" TO created_at;
                END IF;
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='user_roles' AND column_name='updatedAt') THEN
                    ALTER TABLE core.user_roles RENAME COLUMN "updatedAt" TO updated_at;
                END IF;
                -- Drop duplicate RoleId if it exists
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='user_roles' AND column_name='RoleId') THEN
                    ALTER TABLE core.user_roles DROP COLUMN "RoleId";
                END IF;
            END $$;
        `);
        console.log('✅ User Roles table migrated');

        // 4. UI Translations table
        console.log('\n📦 Migrating ui_translations table...');
        await db.execute(sql`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='ui_translations' AND column_name='language_code') THEN
                    ALTER TABLE core.ui_translations RENAME COLUMN language_code TO locale;
                END IF;
            END $$;
        `);
        console.log('✅ UI Translations table migrated');

        console.log('\n✨ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await client.end();
    }
}

migrate();
