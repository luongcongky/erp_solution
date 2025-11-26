import { NextResponse } from 'next/server';
import models from '@/models/sequelize/index.js';

const { StockQuant, InventoryProduct, Warehouse } = models;

/**
 * @swagger
 * /api/inventory/stock:
 *   get:
 *     tags:
 *       - Inventory
 *     summary: Get stock levels
 *     description: Retrieve stock levels with optional filtering
 *     parameters:
 *       - in: query
 *         name: product_id
 *         schema:
 *           type: string
 *         description: Filter by product
 *       - in: query
 *         name: warehouse_id
 *         schema:
 *           type: string
 *         description: Filter by warehouse
 *     responses:
 *       200:
 *         description: Stock levels retrieved successfully
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
 *                     $ref: '#/components/schemas/StockQuant'
 *       500:
 *         description: Server error
 *   post:
 *     tags:
 *       - Inventory
 *     summary: Update stock
 *     description: Adjust stock levels manually
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - warehouse_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: string
 *               warehouse_id:
 *                 type: string
 *               quantity:
 *                 type: number
 *               lot:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/StockQuant'
 *       500:
 *         description: Server error
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const ten_id = searchParams.get('ten_id') || '1000';
        const stg_id = searchParams.get('stg_id') || 'DEV';
        const product_id = searchParams.get('product_id');
        const warehouse_id = searchParams.get('warehouse_id');

        const where = { ten_id, stg_id };
        if (product_id) where.product_id = product_id;
        if (warehouse_id) where.warehouse_id = warehouse_id;

        const stock = await StockQuant.findAll({
            where,
            include: [
                { model: InventoryProduct, as: 'Product' },
                { model: Warehouse, as: 'Warehouse' }
            ]
        });

        return NextResponse.json({ success: true, data: stock });
    } catch (error) {
        console.error('[API] Error fetching stock:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST /api/inventory/stock - Update stock (for adjustments)
export async function POST(request) {
    try {
        const body = await request.json();
        const { product_id, warehouse_id, lot, quantity, ten_id = '1000', stg_id = 'DEV' } = body;

        // Find or create stock quant
        const [stock, created] = await StockQuant.findOrCreate({
            where: { product_id, warehouse_id, lot: lot || '', ten_id, stg_id },
            defaults: { quantity, reserved: 0, ten_id, stg_id }
        });

        if (!created) {
            await stock.update({ quantity: stock.quantity + quantity });
        }

        // Create stock move record
        await models.StockMove.create({
            product_id,
            to_warehouse: warehouse_id,
            quantity,
            move_type: 'adjustment',
            lot,
            ten_id,
            stg_id
        });

        return NextResponse.json({ success: true, data: stock });
    } catch (error) {
        console.error('[API] Error updating stock:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
