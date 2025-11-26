import { NextResponse } from 'next/server';
import models from '@/models/sequelize/index.js';
import { handleList, handleCreate, generateSequenceNumber } from '@/lib/apiHelpers.js';

const { Lead } = models;

/**
 * @swagger
 * /api/sales/leads:
 *   get:
 *     tags:
 *       - Sales
 *     summary: Get all leads
 *     description: Retrieve a list of sales leads with optional filtering
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, contacted, qualified, lost]
 *         description: Filter by lead status
 *       - in: query
 *         name: assigned_to
 *         schema:
 *           type: string
 *         description: Filter by assigned user
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [website, referral, cold_call, event, other]
 *         description: Filter by lead source
 *     responses:
 *       200:
 *         description: List of leads retrieved successfully
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
 *                     $ref: '#/components/schemas/Lead'
 *       500:
 *         description: Server error
 *   post:
 *     tags:
 *       - Sales
 *     summary: Create a new lead
 *     description: Create a new sales lead
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [new, contacted, qualified, lost]
 *               source:
 *                 type: string
 *                 enum: [website, referral, cold_call, event, other]
 *               assigned_to:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lead created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Lead'
 *       500:
 *         description: Server error
 */
export async function GET(request) {
    return handleList(Lead, request, {
        filters: ['status', 'assigned_to', 'source'],
        order: [['createdAt', 'DESC']]
    });
}

// POST /api/sales/leads
export async function POST(request) {
    return handleCreate(Lead, request);
}
