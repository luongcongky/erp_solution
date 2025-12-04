import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Automated API Migration Script
 * Converts Sequelize API routes to Drizzle ORM
 */

// Schema mapping: Sequelize model name -> Drizzle schema info
const schemaMapping = {
    // Core
    'User': { schema: 'core', table: 'users', import: 'users' },
    'Language': { schema: 'core', table: 'languages', import: 'languages' },
    'Role': { schema: 'core', table: 'roles', import: 'roles' },
    'Permission': { schema: 'core', table: 'permissions', import: 'permissions' },
    'Translation': { schema: 'core', table: 'translations', import: 'translations' },
    'UITranslation': { schema: 'core', table: 'uiTranslations', import: 'uiTranslations' },
    'AuditLog': { schema: 'core', table: 'auditLogs', import: 'auditLogs' },
    'Partner': { schema: 'core', table: 'partners', import: 'partners' },
    'Notification': { schema: 'core', table: 'notifications', import: 'notifications' },

    // Inventory
    'Item': { schema: 'inventory', table: 'items', import: 'items' },
    'Warehouse': { schema: 'inventory', table: 'warehouses', import: 'warehouses' },
    'Location': { schema: 'inventory', table: 'locations', import: 'locations' },
    'StockLot': { schema: 'inventory', table: 'stockLots', import: 'stockLots' },
    'StockBalance': { schema: 'inventory', table: 'stockBalance', import: 'stockBalance' },
    'StockMovement': { schema: 'inventory', table: 'stockMovement', import: 'stockMovement' },

    // HR
    'Employee': { schema: 'hr', table: 'employees', import: 'employees' },
    'Attendance': { schema: 'hr', table: 'attendance', import: 'attendance' },
    'LeaveRequest': { schema: 'hr', table: 'leaveRequests', import: 'leaveRequests' },
    'Payroll': { schema: 'hr', table: 'payroll', import: 'payroll' },

    // Add more mappings as needed...
};

// Conversion patterns
const conversionPatterns = [
    {
        name: 'Import Statement',
        from: /import models from ['"].*models\/sequelize\/index\.js['"];?/g,
        to: (match, modelName) => `import { db } from '../../../db';\nimport { ${modelName} } from '../../../db/schema';`,
    },
    {
        name: 'Model Destructuring',
        from: /const\s*{\s*(\w+)\s*}\s*=\s*models;?/g,
        to: (match, modelName) => `// Using Drizzle schema: ${modelName}`,
    },
    {
        name: 'findAll with where',
        from: /await\s+(\w+)\.findAll\(\s*{\s*where:\s*({[^}]+})/g,
        to: (match, model, whereClause) => {
            const tableName = schemaMapping[model]?.import || model.toLowerCase();
            return `await db.select().from(${tableName}).where(/* convert where clause */)`;
        },
    },
    {
        name: 'findOne',
        from: /await\s+(\w+)\.findOne\(\s*{\s*where:\s*({[^}]+})/g,
        to: (match, model, whereClause) => {
            const tableName = schemaMapping[model]?.import || model.toLowerCase();
            return `const [result] = await db.select().from(${tableName}).where(/* convert where */).limit(1)`;
        },
    },
    {
        name: 'create',
        from: /await\s+(\w+)\.create\(([^)]+)\)/g,
        to: (match, model, data) => {
            const tableName = schemaMapping[model]?.import || model.toLowerCase();
            return `const [result] = await db.insert(${tableName}).values(${data}).returning()`;
        },
    },
    {
        name: 'update',
        from: /await\s+(\w+)\.update\(\s*({[^}]+}),\s*{\s*where:\s*({[^}]+})/g,
        to: (match, model, data, whereClause) => {
            const tableName = schemaMapping[model]?.import || model.toLowerCase();
            return `await db.update(${tableName}).set(${data}).where(/* convert where */)`;
        },
    },
    {
        name: 'destroy',
        from: /await\s+(\w+)\.destroy\(\s*{\s*where:\s*({[^}]+})/g,
        to: (match, model, whereClause) => {
            const tableName = schemaMapping[model]?.import || model.toLowerCase();
            return `await db.delete(${tableName}).where(/* convert where */)`;
        },
    },
];

function convertFile(filePath) {
    console.log(`\n📝 Converting: ${filePath}`);

    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // Extract model names used in this file
    const modelMatch = content.match(/const\s*{\s*([^}]+)\s*}\s*=\s*models/);
    if (!modelMatch) {
        console.log('   ⏭️  No Sequelize models found, skipping...');
        return false;
    }

    const modelNames = modelMatch[1].split(',').map(m => m.trim());
    console.log(`   📦 Models found: ${modelNames.join(', ')}`);

    // Build import statement
    const imports = modelNames
        .map(name => schemaMapping[name]?.import || name.toLowerCase())
        .filter(Boolean);

    // Replace import
    content = content.replace(
        /import models from ['"].*models\/sequelize\/index\.js['"];?/g,
        `import { db } from '../../../db';\nimport { ${imports.join(', ')} } from '../../../db/schema';\nimport { eq, and, or } from 'drizzle-orm';`
    );

    // Remove model destructuring
    content = content.replace(/const\s*{\s*[^}]+\s*}\s*=\s*models;?\n?/g, '');

    // Apply conversion patterns
    conversionPatterns.forEach(pattern => {
        if (content.match(pattern.from)) {
            console.log(`   🔄 Applying: ${pattern.name}`);
            // Note: This is a simplified conversion, manual review needed
            content = content.replace(pattern.from, '/* TODO: Convert this query to Drizzle */');
        }
    });

    // Add TODO comment at top
    if (content !== originalContent) {
        content = `/* 
 * ⚠️ AUTO-CONVERTED FROM SEQUELIZE TO DRIZZLE
 * TODO: Review and test all queries
 * TODO: Convert where clauses to Drizzle syntax
 * TODO: Update response handling if needed
 */\n\n` + content;

        // Write converted file
        const backupPath = filePath + '.sequelize.bak';
        fs.writeFileSync(backupPath, originalContent);
        fs.writeFileSync(filePath, content);

        console.log(`   ✅ Converted! Backup saved to: ${path.basename(backupPath)}`);
        return true;
    }

    return false;
}

function findAPIFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findAPIFiles(filePath, fileList);
        } else if (file === 'route.js' || file === 'route.ts') {
            fileList.push(filePath);
        }
    });

    return fileList;
}

async function main() {
    console.log('🚀 Starting API Migration to Drizzle...\n');

    const apiDir = path.join(__dirname, '../src/app/api');

    if (!fs.existsSync(apiDir)) {
        console.error('❌ API directory not found:', apiDir);
        process.exit(1);
    }

    const apiFiles = findAPIFiles(apiDir);
    console.log(`📁 Found ${apiFiles.length} API route files\n`);

    let converted = 0;
    let skipped = 0;

    for (const file of apiFiles) {
        const relativePath = path.relative(apiDir, file);
        if (convertFile(file)) {
            converted++;
        } else {
            skipped++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Converted: ${converted} files`);
    console.log(`   ⏭️  Skipped: ${skipped} files`);
    console.log(`   📁 Total: ${apiFiles.length} files`);
    console.log('='.repeat(60));

    console.log('\n⚠️  IMPORTANT NEXT STEPS:');
    console.log('   1. Review all converted files (marked with TODO comments)');
    console.log('   2. Manually convert where clauses to Drizzle syntax');
    console.log('   3. Test each API endpoint');
    console.log('   4. Original files backed up with .sequelize.bak extension');
    console.log('\n💡 TIP: Use the migration guide for conversion patterns');
}

main().catch(console.error);
