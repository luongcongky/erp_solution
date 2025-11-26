// HR Models
import { DataTypes } from 'sequelize';
import getSequelize from '../../../config/database.js';

const sequelize = getSequelize();

export const Department = sequelize.define('Department', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    code: { type: DataTypes.STRING(50), allowNull: false },
    name: { type: DataTypes.STRING(200), allowNull: false },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'departments', schema: 'hr', timestamps: true, createdAt: 'created_at', updatedAt: false });

export const Employee = sequelize.define('Employee', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    employee_code: { type: DataTypes.STRING(50), allowNull: false },
    partner_id: { type: DataTypes.UUID },
    user_id: { type: DataTypes.UUID },
    department_id: { type: DataTypes.UUID },
    job_title: { type: DataTypes.STRING(200) },
    manager_id: { type: DataTypes.UUID },
    hire_date: { type: DataTypes.DATEONLY },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'employees', schema: 'hr', timestamps: true });

export const Contract = sequelize.define('Contract', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    employee_id: { type: DataTypes.UUID, allowNull: false },
    contract_type: { type: DataTypes.STRING(50) },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY },
    salary: { type: DataTypes.DECIMAL(18, 4) },
    currency: { type: DataTypes.STRING(10), defaultValue: 'VND' },
    terms: { type: DataTypes.JSONB },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'contracts', schema: 'hr', timestamps: true, createdAt: 'created_at', updatedAt: false });

export const Attendance = sequelize.define('Attendance', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    employee_id: { type: DataTypes.UUID, allowNull: false },
    check_in: { type: DataTypes.DATE },
    check_out: { type: DataTypes.DATE },
    work_hours: { type: DataTypes.DECIMAL(6, 2) },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'attendance', schema: 'hr', timestamps: true, createdAt: 'created_at', updatedAt: false });

export const LeaveType = sequelize.define('LeaveType', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    code: { type: DataTypes.STRING(50), allowNull: false },
    name: { type: DataTypes.STRING(200), allowNull: false },
    days_per_year: { type: DataTypes.INTEGER },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'leave_types', schema: 'hr', timestamps: false });

export const Leave = sequelize.define('Leave', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    employee_id: { type: DataTypes.UUID, allowNull: false },
    leave_type_id: { type: DataTypes.UUID },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY, allowNull: false },
    days: { type: DataTypes.DECIMAL(4, 1) },
    reason: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING(50), defaultValue: 'pending' },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'leaves', schema: 'hr', timestamps: true });

export const PayrollRun = sequelize.define('PayrollRun', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    period_start: { type: DataTypes.DATEONLY, allowNull: false },
    period_end: { type: DataTypes.DATEONLY, allowNull: false },
    payment_date: { type: DataTypes.DATEONLY },
    total_amount: { type: DataTypes.DECIMAL(18, 4) },
    status: { type: DataTypes.STRING(50), defaultValue: 'draft' },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'payroll_runs', schema: 'hr', timestamps: true });

export const PayrollLine = sequelize.define('PayrollLine', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    payroll_id: { type: DataTypes.UUID, allowNull: false },
    employee_id: { type: DataTypes.UUID },
    basic_salary: { type: DataTypes.DECIMAL(18, 4) },
    allowances: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    bonuses: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    deductions: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
    gross_pay: { type: DataTypes.DECIMAL(18, 4) },
    net_pay: { type: DataTypes.DECIMAL(18, 4) },
    details: { type: DataTypes.JSONB },
}, { tableName: 'payroll_lines', schema: 'hr', timestamps: false });

export const KPI = sequelize.define('KPI', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    employee_id: { type: DataTypes.UUID, allowNull: false },
    period_start: { type: DataTypes.DATEONLY },
    period_end: { type: DataTypes.DATEONLY },
    metrics: { type: DataTypes.JSONB },
    score: { type: DataTypes.DECIMAL(5, 2) },
    ten_id: { type: DataTypes.STRING(20), allowNull: false },
    stg_id: { type: DataTypes.STRING(20), defaultValue: 'DEV' },
}, { tableName: 'kpis', schema: 'hr', timestamps: true, createdAt: 'created_at', updatedAt: false });
