import { NextResponse } from 'next/server';
import models from '@/models/sequelize/index.js';

const { Attendance, Employee } = models;

/**
 * @swagger
 * /api/hr/attendance:
 *   get:
 *     tags:
 *       - HR
 *     summary: Get attendance records
 *     description: Retrieve attendance records with optional filtering
 *     parameters:
 *       - in: query
 *         name: employee_id
 *         schema:
 *           type: string
 *         description: Filter by employee
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: List of attendance records retrieved successfully
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
 *                     $ref: '#/components/schemas/Attendance'
 *       500:
 *         description: Server error
 *   post:
 *     tags:
 *       - HR
 *     summary: Check-in employee
 *     description: Record employee check-in time
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *             properties:
 *               employee_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Check-in recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Attendance'
 *       500:
 *         description: Server error
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const ten_id = searchParams.get('ten_id') || '1000';
        const stg_id = searchParams.get('stg_id') || 'DEV';
        const employee_id = searchParams.get('employee_id');
        const date_from = searchParams.get('date_from');
        const date_to = searchParams.get('date_to');

        const where = { ten_id, stg_id };
        if (employee_id) where.employee_id = employee_id;
        if (date_from) where.check_in = { [models.Sequelize.Op.gte]: new Date(date_from) };
        if (date_to) where.check_in = { ...where.check_in, [models.Sequelize.Op.lte]: new Date(date_to) };

        const attendance = await Attendance.findAll({
            where,
            include: [{ model: Employee, as: 'employee' }],
            order: [['check_in', 'DESC']]
        });

        return NextResponse.json({ success: true, data: attendance });
    } catch (error) {
        console.error('[API] Error fetching attendance:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST /api/hr/attendance/checkin
export async function POST(request) {
    try {
        const body = await request.json();
        const { employee_id, ten_id = '1000', stg_id = 'DEV' } = body;

        const attendance = await Attendance.create({
            employee_id,
            check_in: new Date(),
            ten_id,
            stg_id
        });

        return NextResponse.json({ success: true, data: attendance }, { status: 201 });
    } catch (error) {
        console.error('[API] Error creating attendance:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
