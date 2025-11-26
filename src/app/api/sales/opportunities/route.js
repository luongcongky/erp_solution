import { NextResponse } from 'next/server';
import models from '@/models/sequelize/index.js';
import { handleList, handleCreate, generateSequenceNumber } from '@/lib/apiHelpers.js';

const { Opportunity } = models;

/**
 * @swagger
 * /api/sales/opportunities:
 *   get:
 *     tags:
 *       - Sales
 *     summary: Get all opportunities
 *     description: Retrieve a list of sales opportunities with optional filtering
 *     parameters:
 *       - in: query
 *         name: stage
 *         schema:
 *           type: string
 *           enum: [prospecting, qualification, proposal, negotiation, closed_won, closed_lost]
 *         description: Filter by opportunity stage
 *       - in: query
 *         name: assigned_to
 *         schema:
 *           type: string
 *         description: Filter by assigned user
 *     responses:
 *       200:
 *         description: List of opportunities retrieved successfully
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
 *                     $ref: '#/components/schemas/Opportunity'
 *       500:
 *         description: Server error
 *   post:
 *     tags:
 *       - Sales
 *     summary: Create a new opportunity
 *     description: Create a new sales opportunity
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - stage
 *               - expected_close_date
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               stage:
 *                 type: string
 *                 enum: [prospecting, qualification, proposal, negotiation, closed_won, closed_lost]
 *               probability:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               expected_close_date:
 *                 type: string
 *                 format: date
 *               lead_id:
 *                 type: string
 *               customer_id:
 *                 type: string
 *               assigned_to:
 *                 type: string
 *     responses:
 *       201:
 *         description: Opportunity created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Opportunity'
 *       500:
 *         description: Server error
 */
export async function GET(request) {
    return handleList(Opportunity, request, {
        filters: ['stage', 'assigned_to'],
        include: [
            { model: models.Lead, as: 'lead' },
            { model: models.Partner, as: 'customer' }
        ],
        order: [['expected_close_date', 'ASC']]
    });
}

// POST /api/sales/opportunities
export async function POST(request) {
    return handleCreate(Opportunity, request);
}
