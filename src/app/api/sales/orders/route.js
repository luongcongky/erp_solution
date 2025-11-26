import { NextResponse } from 'next/server';
import models from '@/models/sequelize/index.js';
import { handleList, handleCreate, generateSequenceNumber } from '@/lib/apiHelpers.js';

const { SalesOrder, SalesOrderLine } = models;

/**
 * @swagger
 * /api/sales/orders:
 *   get:
 *     tags:
 *       - Sales
 *     summary: Get all sales orders
 *     description: Retrieve a list of sales orders with optional filtering
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, confirmed, processing, shipped, delivered, cancelled]
 *         description: Filter by order status
 *       - in: query
 *         name: customer_id
 *         schema:
 *           type: string
 *         description: Filter by customer
 *     responses:
 *       200:
 *         description: List of sales orders retrieved successfully
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
 *                     $ref: '#/components/schemas/SalesOrder'
 *       500:
 *         description: Server error
 *   post:
 *     tags:
 *       - Sales
 *     summary: Create a new sales order
 *     description: Create a new sales order with optional order lines
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_id
 *               - order_date
 *             properties:
 *               customer_id:
 *                 type: string
 *               order_date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [draft, confirmed, processing, shipped, delivered, cancelled]
 *               lines:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - qty
 *                     - unit_price
 *                   properties:
 *                     product_id:
 *                       type: string
 *                     qty:
 *                       type: number
 *                     unit_price:
 *                       type: number
 *                     discount:
 *                       type: number
 *                     tax_rate:
 *                       type: number
 *     responses:
 *       201:
 *         description: Sales order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SalesOrder'
 *       500:
 *         description: Server error
 */
export async function GET(request) {
    return handleList(SalesOrder, request, {
        filters: ['status', 'customer_id'],
        include: [
            { model: models.Partner, as: 'customer' },
            { model: SalesOrderLine, as: 'SalesOrderLines' }
        ],
        order: [['order_date', 'DESC']]
    });
}

// POST /api/sales/orders
export async function POST(request) {
    return handleCreate(SalesOrder, request, {
        transform: async (data) => {
            // Generate order number if not provided
            if (!data.name) {
                data.name = await generateSequenceNumber(
                    SalesOrder,
                    'SO',
                    data.ten_id,
                    data.stg_id
                );
            }
            return data;
        },
        afterCreate: async (order, body) => {
            // Create order lines if provided
            if (body.lines && body.lines.length > 0) {
                const lines = body.lines.map(line => ({
                    ...line,
                    order_id: order.id
                }));
                await SalesOrderLine.bulkCreate(lines);

                // Update total amount
                const total = body.lines.reduce((sum, line) => {
                    return sum + (line.qty * line.unit_price * (1 - line.discount / 100) * (1 + line.tax_rate / 100));
                }, 0);
                await order.update({ total_amount: total });
            }
        }
    });
}
