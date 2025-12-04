import { db } from './src/db/index.ts';
import { uiTranslations } from './src/db/schema/core.ts';
import { eq, and } from 'drizzle-orm';

async function testDirectQuery() {
    try {
        console.log('Testing direct database query...\n');

        const result = await db
            .select()
            .from(uiTranslations)
            .where(
                and(
                    eq(uiTranslations.locale, 'en'),
                    eq(uiTranslations.tenId, '1000'),
                    eq(uiTranslations.stgId, 'DEV')
                )
            )
            .limit(5);

        console.log(`Found ${result.length} records`);
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('Error:', error);
        console.error('Stack:', error.stack);
    }
    process.exit(0);
}

testDirectQuery();
