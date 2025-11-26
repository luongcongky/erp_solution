import { NextResponse } from 'next/server';
import models from '../../../../models/sequelize/index.js';

const { UITranslation } = models;

/**
 * @swagger
 * /api/translations/{locale}:
 *   get:
 *     tags:
 *       - Translations
 *     summary: Get translations for a specific locale
 *     description: Retrieve all UI translations for a specific language locale as a nested object
 *     parameters:
 *       - in: path
 *         name: locale
 *         required: true
 *         schema:
 *           type: string
 *         description: Language code (e.g., en, vi)
 *         example: en
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
 *                   type: object
 *                   description: Nested translation object
 *                   example:
 *                     common:
 *                       save: Save
 *                       cancel: Cancel
 *                     pages:
 *                       auth:
 *                         title: Login
 *                 count:
 *                   type: integer
 *                   description: Total number of translation keys
 *                   example: 150
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET(request, { params }) {
    try {
        const { locale } = await params;
        const ten_id = request.headers.get('x-tenant-id') || '1000';
        const stg_id = request.headers.get('x-stage-id') || 'DEV';

        const translations = await UITranslation.findAll({
            where: {
                languageCode: locale,
                ten_id,
                stg_id,
            },
            attributes: ['key', 'value'],
            raw: true
        });

        // Convert flat array to nested object
        const result = {};
        translations.forEach(t => {
            setNestedValue(result, t.key, t.value);
        });

        return NextResponse.json({
            success: true,
            data: result,
            count: translations.length,
        });
    } catch (error) {
        console.error(`[API] /api/translations/${params.locale} GET error:`, error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch translations',
                message: error.message,
            },
            { status: 500 }
        );
    }
}

/**
 * Helper function to set nested value in object
 * Example: setNestedValue(obj, 'common.save', 'Lưu')
 * Result: obj.common.save = 'Lưu'
 */
function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) {
            current[key] = {};
        }
        current = current[key];
    }

    current[keys[keys.length - 1]] = value;
}
