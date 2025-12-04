import { NextResponse } from 'next/server';
import { db } from '@/db';
import { uiTranslations } from '@/db/schema/core';
import { eq, and } from 'drizzle-orm';


/**
 * @swagger
 * /api/translations/{locale}:
 *   get:
 *     tags:
 *       - Translations
 *     summary: Get translations for a specific locale
 *     description: Retrieve all UI translations for a specific language locale as a nested object
 */
export async function GET(request, { params }) {
    try {
        const { locale } = await params;
        const ten_id = request.headers.get('x-tenant-id') || '1000';
        const stg_id = request.headers.get('x-stage-id') || 'DEV';

        const translations = await db
            .select({
                key: uiTranslations.key,
                value: uiTranslations.value
            })
            .from(uiTranslations)
            .where(
                and(
                    eq(uiTranslations.locale, locale),
                    eq(uiTranslations.tenId, ten_id),
                    eq(uiTranslations.stgId, stg_id)
                )
            );

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
