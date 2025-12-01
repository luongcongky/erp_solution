import { NextResponse } from 'next/server';
import { sequelize } from '@/models/sequelize/index.js';

/**
 * @swagger
 * /api/menus/reorder:
 *   post:
 *     tags:
 *       - Menus
 *     summary: Reorder menus
 *     description: Update the order and parent of multiple menu items
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     order:
 *                       type: number
 *                     parentId:
 *                       type: string
 *     responses:
 *       200:
 *         description: Successfully reordered menus
 *       500:
 *         description: Internal server error
 */
export async function POST(request) {
    try {
        const { updates } = await request.json();

        if (!updates || !Array.isArray(updates)) {
            return NextResponse.json(
                { success: false, error: 'Invalid updates format' },
                { status: 400 }
            );
        }

        // Batch update in transaction
        await sequelize.transaction(async (t) => {
            for (const update of updates) {
                const { id, order, parentId } = update;

                await sequelize.query(
                    `UPDATE "core"."menus" 
                     SET "order" = :order, 
                         "parentId" = :parentId, 
                         "updatedAt" = NOW()
                     WHERE id = :id`,
                    {
                        replacements: {
                            id,
                            order,
                            parentId: parentId || null
                        },
                        transaction: t
                    }
                );
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Menu order updated successfully'
        });
    } catch (error) {
        console.error('[API] Error reordering menus:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
