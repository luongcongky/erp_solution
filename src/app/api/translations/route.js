import { NextResponse } from 'next/server';
import models, { sequelize } from '@/models/sequelize/index.js';
import { Op } from 'sequelize';

const { UITranslation } = models;

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

        // Build where clause for filtering
        const where = {
            ten_id: '1000',
            stg_id: 'DEV'
        };

        if (module && module !== 'all') {
            where.module = module;
        }

        if (search) {
            where[Op.or] = [
                { key: { [Op.iLike]: `%${search}%` } },
                { value: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // First, get all translations with filters
        const allTranslations = await UITranslation.findAll({
            where,
            order: [['key', 'ASC'], ['languageCode', 'ASC']],
            raw: true
        });

        // Group by key
        const groupedByKey = {};
        allTranslations.forEach(row => {
            if (!groupedByKey[row.key]) {
                groupedByKey[row.key] = {
                    key: row.key,
                    module: row.module,
                    description: row.description,
                    translations: {}
                };
            }
            // Use language_code (underscored) as that's what Sequelize returns with raw: true
            const langCode = row.language_code || row.languageCode;
            if (langCode) {
                groupedByKey[row.key].translations[langCode] = row.value;
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
        const { key, module, description, translations } = body;

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
        for (const [langCode, value] of Object.entries(translations)) {
            if (value) {
                const record = await UITranslation.create({
                    key,
                    languageCode: langCode,
                    value,
                    module: module || null,
                    description: description || null,
                    ten_id,
                    stg_id
                });
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
        const { key, module, description, translations } = body;

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
        for (const [langCode, value] of Object.entries(translations)) {
            if (value) {
                const [record] = await UITranslation.upsert({
                    key,
                    languageCode: langCode,
                    value,
                    module: module || null,
                    description: description || null,
                    ten_id,
                    stg_id
                });
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
        const deleted = await UITranslation.destroy({
            where: { key, ten_id, stg_id }
        });

        return NextResponse.json({
            success: true,
            deleted
        });

    } catch (error) {
        console.error('Error deleting translation:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
