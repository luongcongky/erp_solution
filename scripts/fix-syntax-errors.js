import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files with known syntax errors
const filesToFix = [
    'src/app/api/projects/[id]/tasks/route.js',
    'src/app/api/menus/admin/route.js',
    'src/app/api/hr/attendance/route.js'
];

function fixSyntaxErrors(filePath) {
    const fullPath = path.join(__dirname, '..', filePath);
    console.log(`\n🔧 Fixing: ${filePath}`);

    let content = fs.readFileSync(fullPath, 'utf-8');
    const originalContent = content;

    // Fix pattern: await db.select().from(/* FIX: specify table */)
    // This is incomplete and causes syntax errors
    const brokenPattern = /await db\.select\(\)\.from\(\/\*\s*FIX:.*?\*\/\)[^;]*/g;

    if (content.match(brokenPattern)) {
        // Comment out the broken lines
        content = content.replace(brokenPattern, (match) => {
            return `/* FIXME: Broken query - needs manual conversion\n        ${match}\n        */\n        const result = []`;
        });

        fs.writeFileSync(fullPath, content);
        console.log(`   ✅ Fixed syntax errors (commented out broken queries)`);
        return true;
    }

    console.log(`   ⏭️  No syntax errors found`);
    return false;
}

console.log('🚀 Fixing syntax errors in remaining files...\n');

let fixed = 0;
for (const file of filesToFix) {
    if (fixSyntaxErrors(file)) {
        fixed++;
    }
}

console.log(`\n✅ Fixed ${fixed} files`);
console.log('\n⚠️  Note: Broken queries have been commented out.');
console.log('   These files will need manual conversion to work properly.');
