// Test if schema imports correctly
import { languages, uiTranslations } from './src/db/schema/core.ts';

console.log('✅ Schema imported successfully');
console.log('Languages table:', typeof languages);
console.log('UI Translations table:', typeof uiTranslations);
