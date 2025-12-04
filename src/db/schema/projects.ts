import { pgTable, uuid, varchar, text, decimal, timestamp, date, integer, pgSchema } from 'drizzle-orm/pg-core';

// Projects schema
export const projectsSchema = pgSchema('projects');

// Projects table
export const projects = projectsSchema.table('projects', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 200 }).notNull(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    description: text('description'),
    startDate: date('start_date'),
    endDate: date('end_date'),
    budget: decimal('budget', { precision: 18, scale: 2 }),
    status: varchar('status', { length: 20 }).default('planning'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Tasks table
export const tasks = projectsSchema.table('tasks', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').notNull().references(() => projects.id),
    name: varchar('name', { length: 200 }).notNull(),
    description: text('description'),
    assignedTo: uuid('assigned_to'),
    startDate: date('start_date'),
    dueDate: date('due_date'),
    priority: varchar('priority', { length: 20 }).default('medium'),
    status: varchar('status', { length: 20 }).default('todo'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Timesheets table
export const timesheets = projectsSchema.table('timesheets', {
    id: uuid('id').primaryKey().defaultRandom(),
    taskId: uuid('task_id').references(() => tasks.id),
    employeeId: uuid('employee_id').notNull(),
    date: date('date').notNull(),
    hours: decimal('hours', { precision: 5, scale: 2 }).notNull(),
    description: text('description'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Type exports
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Timesheet = typeof timesheets.$inferSelect;
export type NewTimesheet = typeof timesheets.$inferInsert;
