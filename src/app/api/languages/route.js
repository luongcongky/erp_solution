import { NextResponse } from 'next/server';
import models from '../../../models/sequelize/index.js';

const { Language } = models;

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
        const ten_id = request.headers.get('x-tenant-id') || '1000';
        const stg_id = request.headers.get('x-stage-id') || 'DEV';

        const languages = await Language.findAll({
            where: {
                ten_id,
                stg_id,
                isActive: true,
            },
            order: [['order', 'ASC']],
            attributes: ['id', 'code', 'name', 'nativeName', 'flagEmoji', 'isDefault', 'direction'],
        });

        return NextResponse.json({
            success: true,
            data: languages,
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
