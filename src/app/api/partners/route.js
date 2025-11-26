import { NextResponse } from 'next/server';
import models from '@/models/sequelize/index.js';

const { Partner } = models;

/**
 * @swagger
 * /api/partners:
 *   get:
 *     tags:
 *       - Partners
 *     summary: Get all partners
 *     description: Retrieve a list of partners (customers/suppliers) with optional filtering
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [customer, supplier]
 *         description: Filter by partner type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or phone
 *       - in: query
 *         name: ten_id
 *         schema:
 *           type: string
 *           default: "1000"
 *         description: Tenant ID
 *       - in: query
 *         name: stg_id
 *         schema:
 *           type: string
 *           default: DEV
 *         description: Stage ID
 *     responses:
 *       200:
 *         description: List of partners retrieved successfully
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
 *                     $ref: '#/components/schemas/Partner'
 *       500:
 *         description: Server error
 *   post:
 *     tags:
 *       - Partners
 *     summary: Create a new partner
 *     description: Create a new customer or supplier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - partner_type
 *             properties:
 *               partner_type:
 *                 type: string
 *                 enum: [customer, supplier]
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               tax_number:
 *                 type: string
 *               billing_address:
 *                 type: string
 *               shipping_address:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Partner created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Partner'
 *       500:
 *         description: Server error
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const ten_id = searchParams.get('ten_id') || '1000';
        const stg_id = searchParams.get('stg_id') || 'DEV';
        const partner_type = searchParams.get('type');
        const search = searchParams.get('search');

        const where = { ten_id, stg_id };
        if (partner_type) where.partner_type = partner_type;

        const partners = await Partner.findAll({
            where,
            order: [['name', 'ASC']]
        });

        // Filter by search if provided
        let filteredPartners = partners;
        if (search) {
            const searchLower = search.toLowerCase();
            filteredPartners = partners.filter(p =>
                p.name?.toLowerCase().includes(searchLower) ||
                p.email?.toLowerCase().includes(searchLower) ||
                p.phone?.includes(search)
            );
        }

        return NextResponse.json({ success: true, data: filteredPartners });
    } catch (error) {
        console.error('[API] Error fetching partners:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST /api/partners - Create new partner
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            partner_type,
            name,
            email,
            phone,
            tax_number,
            billing_address,
            shipping_address,
            ten_id = '1000',
            stg_id = 'DEV',
            metadata = {}
        } = body;

        const partner = await Partner.create({
            partner_type,
            name,
            email,
            phone,
            tax_number,
            billing_address,
            shipping_address,
            ten_id,
            stg_id,
            metadata
        });

        return NextResponse.json({ success: true, data: partner }, { status: 201 });
    } catch (error) {
        console.error('[API] Error creating partner:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
