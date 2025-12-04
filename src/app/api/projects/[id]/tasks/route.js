/* 
 * ⚠️ AUTO-CONVERTED FROM SEQUELIZE TO DRIZZLE
 * TODO: Review and test all queries
 * TODO: Convert where clauses to Drizzle syntax
 * TODO: Update response handling if needed
 */

import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks, projects, employees } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { handleList, handleCreate } from '@/lib/apiHelpers.js';

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
        const taskList = await db.select()
            .from(tasks)
            .leftJoin(employees, eq(tasks.assignedTo, employees.id))
            .where(eq(tasks.projectId, id))
            .orderBy(tasks.status, tasks.dueDate);

        return NextResponse.json({ success: true, data: taskList });
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
        const [newTask] = await db.insert(tasks).values({
            ...body,
            projectId: id,
        }).returning();

        return NextResponse.json({ success: true, data: newTask }, { status: 201 });
    } catch (error) {
        console.error('[API] Error creating task:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
