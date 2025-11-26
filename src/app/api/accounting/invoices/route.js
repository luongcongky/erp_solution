import { NextResponse } from 'next/server';
import models from '@/models/sequelize/index.js';
import { handleList, handleCreate, generateSequenceNumber } from '@/lib/apiHelpers.js';

const { Invoice, InvoiceLine, Partner } = models;

/**
 * @swagger
 * /api/accounting/invoices:
 *   get:
 *     tags:
 *       - Accounting
 *     summary: Get all invoices
 *     description: Retrieve a list of invoices with optional filtering
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [out_invoice, out_refund, in_invoice, in_refund]
 *         description: Filter by invoice type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, posted, paid, cancelled]
 *         description: Filter by invoice status
 *       - in: query
 *         name: partner_id
 *         schema:
 *           type: string
 *         description: Filter by partner
 *     responses:
 *       200:
 *         description: List of invoices retrieved successfully
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
 *                     $ref: '#/components/schemas/Invoice'
 *       500:
 *         description: Server error
 *   post:
 *     tags:
 *       - Accounting
 *     summary: Create a new invoice
 *     description: Create a new invoice with optional lines
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - partner_id
 *               - type
 *               - date_issued
 *             properties:
 *               partner_id:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [out_invoice, out_refund, in_invoice, in_refund]
 *               date_issued:
 *                 type: string
 *                 format: date
 *               date_due:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [draft, posted, paid, cancelled]
 *               lines:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - description
 *                     - qty
 *                     - unit_price
 *                   properties:
 *                     description:
 *                       type: string
 *                     qty:
 *                       type: number
 *                     unit_price:
 *                       type: number
 *                     tax_rate:
 *                       type: number
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Invoice'
 *       500:
 *         description: Server error
 */
export async function GET(request) {
    return handleList(Invoice, request, {
        filters: ['type', 'status', 'partner_id'],
        include: [
            { model: Partner, as: 'partner' },
            { model: InvoiceLine, as: 'InvoiceLines' }
        ],
        order: [['date_issued', 'DESC']]
    });
}

// POST /api/accounting/invoices
export async function POST(request) {
    return handleCreate(Invoice, request, {
        transform: async (data) => {
            if (!data.invoice_number) {
                const prefix = data.type === 'out_invoice' ? 'INV' : 'BILL';
                data.invoice_number = await generateSequenceNumber(
                    Invoice,
                    prefix,
                    data.ten_id,
                    data.stg_id
                );
            }
            return data;
        },
        afterCreate: async (invoice, body) => {
            if (body.lines && body.lines.length > 0) {
                const lines = body.lines.map(line => ({
                    ...line,
                    invoice_id: invoice.id
                }));
                await InvoiceLine.bulkCreate(lines);

                const total = body.lines.reduce((sum, line) => {
                    return sum + (line.qty * line.unit_price * (1 + line.tax_rate / 100));
                }, 0);
                await invoice.update({ amount_total: total });
            }
        }
    });
}
