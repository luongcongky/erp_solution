import { NextResponse } from 'next/server';
import models from '@/models/sequelize/index.js';
import { handleList, handleCreate, generateSequenceNumber } from '@/lib/apiHelpers.js';

const { WorkOrder, BOM, InventoryProduct, WorkOrderLine } = models;

/**
 * @swagger
 * /api/manufacturing/work-orders:
 *   get:
 *     tags:
 *       - Manufacturing
 *     summary: Get all work orders
 *     description: Retrieve a list of work orders with optional filtering
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, confirmed, in_progress, done, cancelled]
 *         description: Filter by work order status
 *     responses:
 *       200:
 *         description: List of work orders retrieved successfully
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
 *                     $ref: '#/components/schemas/WorkOrder'
 *       500:
 *         description: Server error
 *   post:
 *     tags:
 *       - Manufacturing
 *     summary: Create a new work order
 *     description: Create a new work order, optionally from a BOM
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *               - planned_start
 *             properties:
 *               product_id:
 *                 type: string
 *               bom_id:
 *                 type: string
 *               quantity:
 *                 type: number
 *               planned_start:
 *                 type: string
 *                 format: date-time
 *               planned_end:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [draft, confirmed, in_progress, done, cancelled]
 *     responses:
 *       201:
 *         description: Work order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/WorkOrder'
 *       500:
 *         description: Server error
 */
export async function GET(request) {
    return handleList(WorkOrder, request, {
        filters: ['status'],
        include: [
            { model: InventoryProduct, as: 'product' },
            { model: BOM, as: 'bom' },
            { model: WorkOrderLine, as: 'WorkOrderLines' }
        ],
        order: [['planned_start', 'ASC']]
    });
}

// POST /api/manufacturing/work-orders
export async function POST(request) {
    return handleCreate(WorkOrder, request, {
        transform: async (data) => {
            if (!data.name) {
                data.name = await generateSequenceNumber(
                    WorkOrder,
                    'WO',
                    data.ten_id,
                    data.stg_id
                );
            }
            return data;
        },
        afterCreate: async (workOrder, body) => {
            // If BOM is specified, create work order lines from BOM
            if (body.bom_id) {
                const bom = await BOM.findByPk(body.bom_id, {
                    include: [{ model: models.BOMLine, as: 'BOMLines' }]
                });

                if (bom && bom.BOMLines) {
                    const lines = bom.BOMLines.map(bomLine => ({
                        work_order_id: workOrder.id,
                        product_id: bomLine.product_id,
                        required_qty: bomLine.quantity * workOrder.quantity,
                        consumed_qty: 0
                    }));
                    await WorkOrderLine.bulkCreate(lines);
                }
            }
        }
    });
}
