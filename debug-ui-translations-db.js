import { db } from './src/db/index.ts';

import { uiTranslations } from './src/db/schema/core.ts';
import { eq, and } from 'drizzle-orm';

async function checkUiTranslations() {
    try {
        console.log('Checking ui_translations table...\n');

        // Check total count
        const allRecords = await db.select().from(uiTranslations);
        console.log(`Total records: ${allRecords.length}`);

        // Check for 'en' locale
        const enRecords = await db
            .select()
            .from(uiTranslations)
            .where(
                and(
                    eq(uiTranslations.locale, 'en'),
                    eq(uiTranslations.tenId, '1000'),
                    eq(uiTranslations.stgId, 'DEV')
                )
            );

        console.log(`\nRecords for locale 'en', tenant '1000', stage 'DEV': ${enRecords.length}`);

        if (enRecords.length > 0) {
            console.log('\nSample records:');
            console.log(JSON.stringify(enRecords.slice(0, 5), null, 2));
        } else {
            console.log('\nNo records found for en locale!');
            console.log('\nAll records sample:');
            console.log(JSON.stringify(allRecords.slice(0, 5), null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    }
    process.exit(0);
}

checkUiTranslations();
