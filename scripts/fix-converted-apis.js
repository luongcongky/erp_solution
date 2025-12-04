import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Auto-Fix Common Patterns in Converted API Files
 * Fixes imports, WHERE clauses, and common Drizzle patterns
 */

// Table name mapping
const tableMapping = {
    'User': 'users',
    'Language': 'languages',
    'Role': 'roles',
    'Permission': 'permissions',
    'Translation': 'translations',
    'UITranslation': 'uiTranslations',
    'AuditLog': 'auditLogs',
    'Partner': 'partners',
    'Menu': 'menus',
    'Employee': 'employees',
    'Attendance': 'attendance',
    'Item': 'items',
    'Warehouse': 'warehouses',
    'Lead': 'leads',
    'Opportunity': 'opportunities',
    'SalesOrder': 'salesOrders',
    'PurchaseOrder': 'purchaseOrders',
    'WorkOrder': 'workOrders',
    'Project': 'projects',
    'Task': 'tasks',
};

function fixFile(filePath) {
    console.log(`\n🔧 Fixing: ${path.relative(process.cwd(), filePath)}`);

    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    let changes = [];

    // 1. Fix broken imports - remove old Sequelize imports
    if (content.includes('import models from') || content.includes('from \'@/models/sequelize')) {
        content = content.replace(/import models.*from.*models\/sequelize.*\n/g, '');
        content = content.replace(/import.*from.*@\/models\/sequelize.*\n/g, '');
        changes.push('Removed old Sequelize imports');
    }

    // 2. Fix incomplete TODO conversions (syntax errors)
    // Pattern: const x = /* TODO: Convert */ , ...
    const todoPattern = /const\s+(\w+)\s*=\s*\/\*\s*TODO:.*?\*\/\s*,/g;
    if (content.match(todoPattern)) {
        content = content.replace(todoPattern, (match, varName) => {
            return `const ${varName} = await db.select().from(/* FIX: specify table */)`;
        });
        changes.push('Fixed incomplete TODO conversions');
    }

    // 3. Fix Model.findOne() patterns
    const findOnePattern = /await\s+(\w+)\.findOne\(\s*{\s*where:\s*(\w+)\s*}\s*\)/g;
    content = content.replace(findOnePattern, (match, model, whereVar) => {
        const tableName = tableMapping[model] || model.toLowerCase();
        return `const [result] = await db.select().from(${tableName}).where(/* TODO: convert ${whereVar} */).limit(1)`;
    });
    if (content !== originalContent && content.includes('findOne')) {
        changes.push('Converted findOne() calls');
    }

    // 4. Fix Model.findAll() patterns
    const findAllPattern = /await\s+(\w+)\.findAll\(\s*{\s*where:\s*{([^}]+)}\s*}\s*\)/g;
    content = content.replace(findAllPattern, (match, model, whereClause) => {
        const tableName = tableMapping[model] || model.toLowerCase();
        return `await db.select().from(${tableName}).where(/* TODO: convert where clause */)`;
    });

    // 5. Fix Model.create() patterns
    const createPattern = /await\s+(\w+)\.create\(([^)]+)\)/g;
    content = content.replace(createPattern, (match, model, data) => {
        const tableName = tableMapping[model] || model.toLowerCase();
        return `const [result] = await db.insert(${tableName}).values(${data}).returning()`;
    });

    // 6. Fix Model.update() patterns
    const updatePattern = /await\s+(\w+)\.update\(\s*({[^}]+}),\s*{\s*where:\s*{([^}]+)}\s*}\s*\)/g;
    content = content.replace(updatePattern, (match, model, setData, whereClause) => {
        const tableName = tableMapping[model] || model.toLowerCase();
        return `await db.update(${tableName}).set(${setData}).where(/* TODO: convert where */)`;
    });

    // 7. Fix Model.destroy() patterns
    const destroyPattern = /await\s+(\w+)\.destroy\(\s*{\s*where:\s*{([^}]+)}\s*}\s*\)/g;
    content = content.replace(destroyPattern, (match, model, whereClause) => {
        const tableName = tableMapping[model] || model.toLowerCase();
        return `await db.delete(${tableName}).where(/* TODO: convert where */)`;
    });

    // 8. Ensure Drizzle imports exist
    if (content.includes('await db.') && !content.includes('import { db }')) {
        const firstImport = content.indexOf('import');
        if (firstImport !== -1) {
            const drizzleImports = `import { db } from '../../../db';\nimport { eq, and, or, desc, asc } from 'drizzle-orm';\n`;
            content = content.slice(0, firstImport) + drizzleImports + content.slice(firstImport);
            changes.push('Added Drizzle imports');
        }
    }

    // 9. Fix common where clause patterns
    // Simple equality: { field: value }
    const simpleWherePattern = /where:\s*{\s*(\w+):\s*(\w+)\s*}/g;
    content = content.replace(simpleWherePattern, (match, field, value) => {
        return `where(eq(table.${field}, ${value}))`;
    });

    // 10. Fix order by patterns
    const orderPattern = /order:\s*\[\s*\['(\w+)',\s*'(ASC|DESC)'\]\s*\]/g;
    content = content.replace(orderPattern, (match, field, direction) => {
        const fn = direction === 'DESC' ? 'desc' : 'asc';
        return `orderBy(${fn}(table.${field}))`;
    });

    // 11. Remove empty model destructuring
    content = content.replace(/const\s*{\s*}\s*=\s*models;?\n?/g, '');

    // 12. Fix attributes in select
    const attributesPattern = /attributes:\s*\[([^\]]+)\]/g;
    content = content.replace(attributesPattern, (match, attrs) => {
        const fields = attrs.split(',').map(a => a.trim().replace(/['"]/g, ''));
        const selectObj = fields.map(f => `${f}: table.${f}`).join(', ');
        return `select({ ${selectObj} })`;
    });

    if (content !== originalContent) {
        // Create backup
        const backupPath = filePath + '.pre-fix.bak';
        if (!fs.existsSync(backupPath)) {
            fs.writeFileSync(backupPath, originalContent);
        }

        // Write fixed content
        fs.writeFileSync(filePath, content);

        console.log(`   ✅ Fixed! Changes: ${changes.join(', ')}`);
        console.log(`   💾 Backup: ${path.basename(backupPath)}`);
        return true;
    } else {
        console.log(`   ⏭️  No changes needed`);
        return false;
    }
}

function findConvertedFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findConvertedFiles(filePath, fileList);
        } else if (file === 'route.js') {
            // Check if file has TODO comment from conversion
            const content = fs.readFileSync(filePath, 'utf-8');
            if (content.includes('⚠️ AUTO-CONVERTED FROM SEQUELIZE TO DRIZZLE')) {
                fileList.push(filePath);
            }
        }
    });

    return fileList;
}

async function main() {
    console.log('🔧 Starting Auto-Fix for Converted APIs...\n');

    const apiDir = path.join(__dirname, '../src/app/api');

    if (!fs.existsSync(apiDir)) {
        console.error('❌ API directory not found:', apiDir);
        process.exit(1);
    }

    const convertedFiles = findConvertedFiles(apiDir);
    console.log(`📁 Found ${convertedFiles.length} converted files\n`);

    let fixed = 0;
    let skipped = 0;

    for (const file of convertedFiles) {
        if (fixFile(file)) {
            fixed++;
        } else {
            skipped++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Auto-Fix Summary:');
    console.log(`   ✅ Fixed: ${fixed} files`);
    console.log(`   ⏭️  Skipped: ${skipped} files`);
    console.log(`   📁 Total: ${convertedFiles.length} files`);
    console.log('='.repeat(60));

    console.log('\n⚠️  IMPORTANT:');
    console.log('   1. Review all fixed files');
    console.log('   2. Replace /* TODO: convert */ with actual logic');
    console.log('   3. Test each API endpoint');
    console.log('   4. Backups saved as .pre-fix.bak');

    console.log('\n💡 Common fixes still needed:');
    console.log('   - Convert complex WHERE clauses');
    console.log('   - Add proper table imports');
    console.log('   - Fix JOIN queries');
    console.log('   - Update response handling');
}

main().catch(console.error);
