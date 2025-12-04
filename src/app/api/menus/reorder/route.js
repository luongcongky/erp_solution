import { NextResponse } from 'next/server';
import { db } from '@/db';
import { menus } from '@/db/schema/core';
import { eq, sql } from 'drizzle-orm';

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

        // Batch update using transaction
        await db.transaction(async (tx) => {
            for (const update of updates) {
                const { id, order, parentId } = update;

                await tx
                    .update(menus)
                    .set({
                        order: order,
                        parentId: parentId || null,
                        updatedAt: new Date(),
                    })
                    .where(eq(menus.id, id));
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
