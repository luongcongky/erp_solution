import { NextResponse } from 'next/server';
import models from '@/models/sequelize/index.js';
import { handleList, handleCreate } from '@/lib/apiHelpers.js';

const { Employee, Department, Partner, User } = models;

/**
 * @swagger
 * /api/hr/employees:
 *   get:
 *     tags:
 *       - HR
 *     summary: Get all employees
 *     description: Retrieve a list of employees with optional filtering
 *     parameters:
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of employees retrieved successfully
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
 *                     $ref: '#/components/schemas/Employee'
 *       500:
 *         description: Server error
 *   post:
 *     tags:
 *       - HR
 *     summary: Create a new employee
 *     description: Create a new employee record
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
 *               - employee_code
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               employee_code:
 *                 type: string
 *               department_id:
 *                 type: string
 *               job_title:
 *                 type: string
 *               hire_date:
 *                 type: string
 *                 format: date
 *               manager_id:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       500:
 *         description: Server error
 */
export async function GET(request) {
    return handleList(Employee, request, {
        filters: ['department_id', 'is_active'],
        include: [
            { model: Partner, as: 'partner' },
            { model: User, as: 'user' },
            { model: Department, as: 'department' },
            { model: Employee, as: 'manager' }
        ],
        order: [['employee_code', 'ASC']]
    });
}

// POST /api/hr/employees
export async function POST(request) {
    return handleCreate(Employee, request);
}
