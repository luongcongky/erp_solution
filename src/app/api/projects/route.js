import { NextResponse } from 'next/server';
import models from '@/models/sequelize/index.js';
import { handleList, handleCreate } from '@/lib/apiHelpers.js';

const { Project, Partner, Employee, Task, Milestone } = models;

/**
 * @swagger
 * /api/projects:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get all projects
 *     description: Retrieve a list of projects with optional filtering
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, active, on_hold, completed, cancelled]
 *         description: Filter by project status
 *       - in: query
 *         name: manager_id
 *         schema:
 *           type: string
 *         description: Filter by project manager
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by project name
 *     responses:
 *       200:
 *         description: List of projects retrieved successfully
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
 *                     $ref: '#/components/schemas/Project'
 *       500:
 *         description: Server error
 *   post:
 *     tags:
 *       - Projects
 *     summary: Create a new project
 *     description: Create a new project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - start_date
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [planning, active, on_hold, completed, cancelled]
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               manager_id:
 *                 type: string
 *               customer_id:
 *                 type: string
 *               budget:
 *                 type: number
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       500:
 *         description: Server error
 */
export async function GET(request) {
    return handleList(Project, request, {
        filters: ['status', 'manager_id'],
        include: [
            { model: Partner, as: 'customer' },
            { model: Employee, as: 'manager' },
            { model: Task, as: 'Tasks' },
            { model: Milestone, as: 'Milestones' }
        ],
        order: [['start_date', 'DESC']]
    });
}

// POST /api/projects
export async function POST(request) {
    return handleCreate(Project, request);
}
