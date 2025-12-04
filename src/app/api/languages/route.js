import { NextResponse } from 'next/server';
import { db } from '@/db';
import { languages } from '@/db/schema/core';
import { eq, and } from 'drizzle-orm';


/**
 * @swagger
 * /api/languages:
 *   get:
 *     tags:
 *       - Languages
 *     summary: Get all active languages
 *     description: Retrieve all active languages ordered by display order
 *     responses:
 *       200:
 *         description: Successfully retrieved languages
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
 *                     $ref: '#/components/schemas/Language'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET(request) {
    try {
        const tenId = request.headers.get('x-tenant-id') || '1000';
        const stgId = request.headers.get('x-stage-id') || 'DEV';

        // Drizzle query
        const result = await db
            .select({
                id: languages.id,
                code: languages.code,
                name: languages.name,
                nativeName: languages.nativeName,
                flagEmoji: languages.flagEmoji,
                isDefault: languages.isDefault,
                direction: languages.direction,
            })
            .from(languages)
            .where(
                and(
                    eq(languages.tenId, tenId),
                    eq(languages.stgId, stgId),
                    eq(languages.isActive, true)
                )
            )
            .orderBy(languages.order);

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('[API] /api/languages GET error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch languages',
                message: error.message,
            },
            { status: 500 }
        );
    }
}
