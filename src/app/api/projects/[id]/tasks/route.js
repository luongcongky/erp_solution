import { NextResponse } from 'next/server';
import models from '@/models/sequelize/index.js';
import { handleList, handleCreate } from '@/lib/apiHelpers.js';

const { Task, Project, Employee } = models;

/**
 * @swagger
 * /api/projects/{id}/tasks:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get project tasks
 *     description: Retrieve all tasks for a specific project
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: List of tasks retrieved successfully
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
 *                     $ref: '#/components/schemas/Task'
 *       500:
 *         description: Server error
 *   post:
 *     tags:
 *       - Projects
 *     summary: Create project task
 *     description: Create a new task for a specific project
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, review, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               due_date:
 *                 type: string
 *                 format: date
 *               assignee_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
    const { id } = params;

    try {
        const tasks = await Task.findAll({
            where: { project_id: id },
            include: [
                { model: Employee, as: 'assignee' }
            ],
            order: [['status', 'ASC'], ['due_date', 'ASC']]
        });

        return NextResponse.json({ success: true, data: tasks });
    } catch (error) {
        console.error('[API] Error fetching tasks:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST /api/projects/[id]/tasks
export async function POST(request, { params }) {
    const { id } = params;

    try {
        const body = await request.json();
        const task = await Task.create({
            ...body,
            project_id: id
        });

        return NextResponse.json({ success: true, data: task }, { status: 201 });
    } catch (error) {
        console.error('[API] Error creating task:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
