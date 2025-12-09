import { pgTable, uuid, varchar, text, boolean, decimal, timestamp, date, pgSchema } from 'drizzle-orm/pg-core';

// HR schema
export const hrSchema = pgSchema('hr');

// Employees table
export const employees = hrSchema.table('employees', {
    id: uuid('id').primaryKey().defaultRandom(),
    employeeCode: varchar('employee_code', { length: 50 }).notNull().unique(),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    email: varchar('email', { length: 255 }).unique(),
    phone: varchar('phone', { length: 50 }),
    department: varchar('department', { length: 100 }),
    position: varchar('position', { length: 100 }),
    hireDate: date('hire_date'),
    salary: decimal('salary', { precision: 18, scale: 2 }),
    isActive: boolean('is_active').default(true),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Attendance table
export const attendance = hrSchema.table('attendance', {
    id: uuid('id').primaryKey().defaultRandom(),
    employeeId: uuid('employee_id').notNull().references(() => employees.id),
    date: date('date').notNull(),
    checkIn: timestamp('check_in'),
    checkOut: timestamp('check_out'),
    status: varchar('status', { length: 20 }).default('present'),
    notes: text('notes'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Leave Requests table
export const leaveRequests = hrSchema.table('leave_requests', {
    id: uuid('id').primaryKey().defaultRandom(),
    employeeId: uuid('employee_id').notNull().references(() => employees.id),
    leaveType: varchar('leave_type', { length: 50 }).notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    days: decimal('days', { precision: 5, scale: 1 }).notNull(),
    reason: text('reason'),
    status: varchar('status', { length: 20 }).default('pending'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Payroll table
export const payroll = hrSchema.table('payroll', {
    id: uuid('id').primaryKey().defaultRandom(),
    employeeId: uuid('employee_id').notNull().references(() => employees.id),
    period: varchar('period', { length: 20 }).notNull(),
    basicSalary: decimal('basic_salary', { precision: 18, scale: 2 }).notNull(),
    allowances: decimal('allowances', { precision: 18, scale: 2 }).default('0'),
    deductions: decimal('deductions', { precision: 18, scale: 2 }).default('0'),
    netSalary: decimal('net_salary', { precision: 18, scale: 2 }).notNull(),
    status: varchar('status', { length: 20 }).default('draft'),
    tenId: varchar('ten_id', { length: 20 }).notNull(),
    stgId: varchar('stg_id', { length: 20 }).default('DEV'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Type exports
export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
export type Attendance = typeof attendance.$inferSelect;
export type NewAttendance = typeof attendance.$inferInsert;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type NewLeaveRequest = typeof leaveRequests.$inferInsert;
export type Payroll = typeof payroll.$inferSelect;
export type NewPayroll = typeof payroll.$inferInsert;
