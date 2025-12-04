import { NextResponse } from 'next/server';
import { db } from '@/db';
import { uiTranslations } from '@/db/schema/core';
import { eq, and, or, ilike, sql } from 'drizzle-orm';



/**
 * @swagger
 * /api/translations:
 *   get:
 *     tags:
 *       - Translations
 *     summary: Get all translations with filters
 *     description: Retrieve translations grouped by key with support for filtering and pagination
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 25
 *         description: Items per page
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by language code
 *         example: en
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *         description: Filter by module
 *         example: common
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in keys and values
 *     responses:
 *       200:
 *         description: Successfully retrieved translations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       key:
 *                         type: string
 *                         example: common.save
 *                       module:
 *                         type: string
 *                         example: common
 *                       description:
 *                         type: string
 *                         example: Save button label
 *                       translations:
 *                         type: object
 *                         additionalProperties:
 *                           type: string
 *                         example:
 *                           en: Save
 *                           vi: Lưu
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 25
 *                     totalPages:
 *                       type: integer
 *                       example: 4
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        // Pagination
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '25');

        // Filters
        const language = searchParams.get('language');
        const module = searchParams.get('module');
        const search = searchParams.get('search');

        const ten_id = '1000';
        const stg_id = 'DEV';

        // Build where conditions
        const conditions = [
            eq(uiTranslations.tenId, ten_id),
            eq(uiTranslations.stgId, stg_id)
        ];

        if (module && module !== 'all') {
            conditions.push(eq(uiTranslations.module, module));
        }

        if (search) {
            conditions.push(
                or(
                    ilike(uiTranslations.key, `%${search}%`),
                    ilike(uiTranslations.value, `%${search}%`)
                )
            );
        }

        // Get all translations with filters
        const allTranslations = await db
            .select()
            .from(uiTranslations)
            .where(and(...conditions))
            .orderBy(uiTranslations.key);


        // Group by key
        const groupedByKey = {};
        allTranslations.forEach(row => {
            if (!groupedByKey[row.key]) {
                groupedByKey[row.key] = {
                    key: row.key,
                    module: row.module,
                    translations: {}
                };
            }
            if (row.locale) {
                groupedByKey[row.key].translations[row.locale] = row.value;
            }
        });

        // Convert to array and apply language filter if needed
        let groupedData = Object.values(groupedByKey);

        if (language && language !== 'all') {
            groupedData = groupedData.filter(item => item.translations[language]);
        }

        // Apply pagination
        const total = groupedData.length;
        const offset = (page - 1) * limit;
        const paginatedData = groupedData.slice(offset, offset + limit);

        return NextResponse.json({
            success: true,
            data: paginatedData,
            pagination: {
                total: total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching translations:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST /api/translations - Create new translation
export async function POST(request) {
    try {
        const body = await request.json();
        const { key, module, translations } = body;

        if (!key || !translations) {
            return NextResponse.json(
                { success: false, error: 'Key and translations are required' },
                { status: 400 }
            );
        }

        const ten_id = '1000';
        const stg_id = 'DEV';

        // Insert translation for each language
        const records = [];
        for (const [locale, value] of Object.entries(translations)) {
            if (value) {
                const [record] = await db
                    .insert(uiTranslations)
                    .values({
                        key,
                        locale,
                        value,
                        module: module || null,
                        tenId: ten_id,
                        stgId: stg_id
                    })
                    .returning();
                records.push(record);
            }
        }

        return NextResponse.json({
            success: true,
            data: records
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating translation:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/translations - Update translation
export async function PUT(request) {
    try {
        const body = await request.json();
        const { key, module, translations } = body;

        if (!key || !translations) {
            return NextResponse.json(
                { success: false, error: 'Key and translations are required' },
                { status: 400 }
            );
        }

        const ten_id = '1000';
        const stg_id = 'DEV';

        // Update or create translation for each language
        const records = [];
        for (const [locale, value] of Object.entries(translations)) {
            if (value) {
                // Check if record exists
                const existing = await db
                    .select()
                    .from(uiTranslations)
                    .where(
                        and(
                            eq(uiTranslations.key, key),
                            eq(uiTranslations.locale, locale),
                            eq(uiTranslations.tenId, ten_id),
                            eq(uiTranslations.stgId, stg_id)
                        )
                    )
                    .limit(1);

                let record;
                if (existing.length > 0) {
                    // Update existing
                    [record] = await db
                        .update(uiTranslations)
                        .set({
                            value,
                            module: module || null,
                            updatedAt: new Date()
                        })
                        .where(eq(uiTranslations.id, existing[0].id))
                        .returning();
                } else {
                    // Insert new
                    [record] = await db
                        .insert(uiTranslations)
                        .values({
                            key,
                            locale,
                            value,
                            module: module || null,
                            tenId: ten_id,
                            stgId: stg_id
                        })
                        .returning();
                }
                records.push(record);
            }
        }

        return NextResponse.json({
            success: true,
            data: records
        });

    } catch (error) {
        console.error('Error updating translation:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/translations - Delete translation by key
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');

        if (!key) {
            return NextResponse.json(
                { success: false, error: 'Key is required' },
                { status: 400 }
            );
        }

        const ten_id = '1000';
        const stg_id = 'DEV';

        // Delete all language variants of this key
        const deleted = await db
            .delete(uiTranslations)
            .where(
                and(
                    eq(uiTranslations.key, key),
                    eq(uiTranslations.tenId, ten_id),
                    eq(uiTranslations.stgId, stg_id)
                )
            )
            .returning();

        return NextResponse.json({
            success: true,
            deleted: deleted.length
        });

    } catch (error) {
        console.error('Error deleting translation:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
