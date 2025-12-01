import getSequelize from '../../config/database.js';

// Import existing models
import User from './User.js';
import Menu from './Menu.js';
import Product from './Product.js';
import Order from './Order.js';
import Company from './Company.js';

// Import Core models
import Role from './core/Role.js';
import UserRole from './core/UserRole.js';
import Permission from './core/Permission.js';
import AuditLog from './core/AuditLog.js';
import Partner from './core/Partner.js';
import Setting from './core/Setting.js';
import Notification from './core/Notification.js';
import Translation from './core/Translation.js';
import Language from './core/Language.js';
import UITranslation from './core/UITranslation.js';
import Workflow from './core/Workflow.js';
import WorkflowInstance from './core/WorkflowInstance.js';
import Approval from './core/Approval.js';

// Import Sales models
import * as SalesModels from './sales/index.js';

// Import Purchase models
import * as PurchaseModels from './purchase/index.js';

// Import Inventory models
import * as InventoryModels from './inventory/index.js';

// Import Manufacturing models
import * as ManufacturingModels from './manufacturing/index.js';

// Import Accounting models
import * as AccountingModels from './accounting/index.js';

// Import HR models
import * as HRModels from './hr/index.js';

// Import Projects, Service, E-commerce models
import * as OtherModels from './other/index.js';

const sequelize = getSequelize();

// Export all models
const models = {
    // Existing
    User,
    Menu,
    Product,
    Order,
    Company,

    // Core
    Role,
    UserRole,
    Permission,
    AuditLog,
    Partner,
    Setting,
    Notification,
    Translation,
    Language,
    UITranslation,
    Workflow,
    WorkflowInstance,
    Approval,

    // Sales/CRM
    Lead: SalesModels.Lead,
    Opportunity: SalesModels.Opportunity,
    Quotation: SalesModels.Quotation,
    QuotationLine: SalesModels.QuotationLine,
    SalesOrder: SalesModels.SalesOrder,
    SalesOrderLine: SalesModels.SalesOrderLine,
    CustomerActivity: SalesModels.CustomerActivity,

    // Purchase
    PurchaseRequest: PurchaseModels.PurchaseRequest,
    PurchaseRequestLine: PurchaseModels.PurchaseRequestLine,
    RFQ: PurchaseModels.RFQ,
    RFQLine: PurchaseModels.RFQLine,
    PurchaseOrder: PurchaseModels.PurchaseOrder,
    PurchaseOrderLine: PurchaseModels.PurchaseOrderLine,
    SupplierEvaluation: PurchaseModels.SupplierEvaluation,

    // Inventory
    InventoryProduct: InventoryModels.Product,
    Warehouse: InventoryModels.Warehouse,
    StockQuant: InventoryModels.StockQuant,
    StockMove: InventoryModels.StockMove,
    StockAdjustment: InventoryModels.StockAdjustment,
    StockAdjustmentLine: InventoryModels.StockAdjustmentLine,

    // Manufacturing
    BOM: ManufacturingModels.BOM,
    BOMLine: ManufacturingModels.BOMLine,
    Routing: ManufacturingModels.Routing,
    RoutingStep: ManufacturingModels.RoutingStep,
    WorkOrder: ManufacturingModels.WorkOrder,
    WorkOrderLine: ManufacturingModels.WorkOrderLine,
    QualityCheck: ManufacturingModels.QualityCheck,

    // Accounting
    Account: AccountingModels.Account,
    Journal: AccountingModels.Journal,
    JournalEntry: AccountingModels.JournalEntry,
    JournalItem: AccountingModels.JournalItem,
    Invoice: AccountingModels.Invoice,
    InvoiceLine: AccountingModels.InvoiceLine,
    Payment: AccountingModels.Payment,
    BankAccount: AccountingModels.BankAccount,
    TaxCode: AccountingModels.TaxCode,

    // HR
    Department: HRModels.Department,
    Employee: HRModels.Employee,
    Contract: HRModels.Contract,
    Attendance: HRModels.Attendance,
    LeaveType: HRModels.LeaveType,
    Leave: HRModels.Leave,
    PayrollRun: HRModels.PayrollRun,
    PayrollLine: HRModels.PayrollLine,
    KPI: HRModels.KPI,

    // Projects
    Project: OtherModels.Project,
    Milestone: OtherModels.Milestone,
    Task: OtherModels.Task,
    Timesheet: OtherModels.Timesheet,
    ProjectCost: OtherModels.ProjectCost,

    // Service
    Ticket: OtherModels.Ticket,
    SLA: OtherModels.SLA,
    Warranty: OtherModels.Warranty,
    MaintenanceLog: OtherModels.MaintenanceLog,

    // E-commerce/POS
    POSSession: OtherModels.POSSession,
    POSOrder: OtherModels.POSOrder,
    POSOrderLine: OtherModels.POSOrderLine,
    OnlineOrder: OtherModels.OnlineOrder,
    OnlineOrderLine: OtherModels.OnlineOrderLine,
    Cart: OtherModels.Cart,
    CartItem: OtherModels.CartItem,
};

// Define relationships
let associationsSetup = false;

export function setupAssociations() {
    // Prevent multiple calls to setupAssociations
    if (associationsSetup) {
        console.log('[Database] Associations already set up, skipping...');
        return;
    }

    const {
        User, Role, UserRole, Permission, Partner, Employee, Department,
        Lead, Opportunity, Quotation, QuotationLine, SalesOrder, SalesOrderLine, CustomerActivity,
        PurchaseRequest, PurchaseRequestLine, RFQ, RFQLine, PurchaseOrder, PurchaseOrderLine,
        InventoryProduct, Warehouse, StockQuant, StockMove, StockAdjustment, StockAdjustmentLine,
        BOM, BOMLine, Routing, RoutingStep, WorkOrder, WorkOrderLine, QualityCheck,
        Account, Journal, JournalEntry, JournalItem, Invoice, InvoiceLine, Payment,
        Contract, Attendance, Leave, LeaveType, PayrollRun, PayrollLine, KPI,
        Project, Milestone, Task, Timesheet, ProjectCost,
        Ticket, Warranty, MaintenanceLog,
        POSSession, POSOrder, POSOrderLine, OnlineOrder, OnlineOrderLine, Cart, CartItem,
        Workflow, WorkflowInstance, Approval
    } = models;

    // Core relationships
    User.belongsToMany(Role, { through: UserRole, foreignKey: 'user_id' });
    Role.belongsToMany(Permission, { through: 'role_permissions', foreignKey: 'role_id' });
    Permission.belongsToMany(Role, { through: 'role_permissions', foreignKey: 'permission_id' });
    AuditLog.belongsTo(User, { as: 'user', foreignKey: 'user_id' });

    // Sales relationships
    Lead.belongsTo(User, { as: 'assignedLeadUser', foreignKey: 'assigned_to' });
    Opportunity.belongsTo(Lead, { foreignKey: 'lead_id' });
    Opportunity.belongsTo(Partner, { as: 'customer', foreignKey: 'customer_id' });
    Opportunity.belongsTo(User, { as: 'assignedOpportunityUser', foreignKey: 'assigned_to' });
    Quotation.belongsTo(Partner, { as: 'customer', foreignKey: 'customer_id' });
    Quotation.belongsTo(Opportunity, { foreignKey: 'opportunity_id' });
    Quotation.hasMany(QuotationLine, { foreignKey: 'quotation_id' });
    QuotationLine.belongsTo(Quotation, { foreignKey: 'quotation_id' });
    SalesOrder.belongsTo(Partner, { as: 'customer', foreignKey: 'customer_id' });
    SalesOrder.belongsTo(Quotation, { foreignKey: 'quotation_id' });
    SalesOrder.hasMany(SalesOrderLine, { foreignKey: 'order_id' });
    SalesOrderLine.belongsTo(SalesOrder, { foreignKey: 'order_id' });
    CustomerActivity.belongsTo(Partner, { as: 'customer', foreignKey: 'customer_id' });
    CustomerActivity.belongsTo(User, { foreignKey: 'user_id' });

    // Purchase relationships
    PurchaseRequest.belongsTo(User, { as: 'requester', foreignKey: 'requested_by' });
    PurchaseRequest.hasMany(PurchaseRequestLine, { foreignKey: 'request_id' });
    PurchaseRequestLine.belongsTo(PurchaseRequest, { foreignKey: 'request_id' });
    RFQ.belongsTo(Partner, { as: 'supplier', foreignKey: 'supplier_id' });
    RFQ.hasMany(RFQLine, { foreignKey: 'rfq_id' });
    RFQLine.belongsTo(RFQ, { foreignKey: 'rfq_id' });
    PurchaseOrder.belongsTo(Partner, { as: 'supplier', foreignKey: 'supplier_id' });
    PurchaseOrder.hasMany(PurchaseOrderLine, { foreignKey: 'purchase_id' });
    PurchaseOrderLine.belongsTo(PurchaseOrder, { foreignKey: 'purchase_id' });

    // Inventory relationships
    StockQuant.belongsTo(InventoryProduct, { foreignKey: 'product_id' });
    StockQuant.belongsTo(Warehouse, { foreignKey: 'warehouse_id' });
    StockMove.belongsTo(InventoryProduct, { foreignKey: 'product_id' });
    StockMove.belongsTo(Warehouse, { as: 'fromWarehouse', foreignKey: 'from_warehouse' });
    StockMove.belongsTo(Warehouse, { as: 'toWarehouse', foreignKey: 'to_warehouse' });
    StockAdjustment.belongsTo(Warehouse, { foreignKey: 'warehouse_id' });
    StockAdjustment.hasMany(StockAdjustmentLine, { foreignKey: 'adjustment_id' });
    StockAdjustmentLine.belongsTo(StockAdjustment, { foreignKey: 'adjustment_id' });

    // Manufacturing relationships
    BOM.belongsTo(InventoryProduct, { foreignKey: 'product_id' });
    BOM.hasMany(BOMLine, { foreignKey: 'bom_id' });
    BOMLine.belongsTo(BOM, { foreignKey: 'bom_id' });
    BOMLine.belongsTo(InventoryProduct, { foreignKey: 'product_id' });
    Routing.belongsTo(InventoryProduct, { foreignKey: 'product_id' });
    Routing.hasMany(RoutingStep, { foreignKey: 'routing_id' });
    RoutingStep.belongsTo(Routing, { foreignKey: 'routing_id' });
    WorkOrder.belongsTo(InventoryProduct, { foreignKey: 'product_id' });
    WorkOrder.belongsTo(BOM, { foreignKey: 'bom_id' });
    WorkOrder.hasMany(WorkOrderLine, { foreignKey: 'work_order_id' });
    WorkOrderLine.belongsTo(WorkOrder, { foreignKey: 'work_order_id' });
    QualityCheck.belongsTo(WorkOrder, { foreignKey: 'work_order_id' });
    QualityCheck.belongsTo(User, { as: 'inspectorUser', foreignKey: 'inspector' });

    // Accounting relationships
    Account.belongsTo(Account, { as: 'parent', foreignKey: 'parent_id' });
    JournalEntry.belongsTo(Journal, { foreignKey: 'journal_id' });
    JournalEntry.hasMany(JournalItem, { foreignKey: 'entry_id' });
    JournalItem.belongsTo(JournalEntry, { foreignKey: 'entry_id' });
    JournalItem.belongsTo(Account, { foreignKey: 'account_id' });
    JournalItem.belongsTo(Partner, { foreignKey: 'partner_id' });
    Invoice.belongsTo(Partner, { foreignKey: 'partner_id' });
    Invoice.hasMany(InvoiceLine, { foreignKey: 'invoice_id' });
    InvoiceLine.belongsTo(Invoice, { foreignKey: 'invoice_id' });
    Payment.belongsTo(Partner, { foreignKey: 'partner_id' });
    Payment.belongsTo(Invoice, { foreignKey: 'invoice_id' });
    Payment.belongsTo(Journal, { foreignKey: 'journal_id' });

    // HR relationships
    Department.belongsTo(Department, { as: 'parent', foreignKey: 'parent_id' });
    Department.belongsTo(Employee, { as: 'manager', foreignKey: 'manager_id' });
    Employee.belongsTo(Partner, { foreignKey: 'partner_id' });
    Employee.belongsTo(User, { foreignKey: 'user_id' });
    Employee.belongsTo(Department, { foreignKey: 'department_id' });
    Employee.belongsTo(Employee, { as: 'manager', foreignKey: 'manager_id' });
    Contract.belongsTo(Employee, { foreignKey: 'employee_id' });
    Attendance.belongsTo(Employee, { foreignKey: 'employee_id' });
    Leave.belongsTo(Employee, { foreignKey: 'employee_id' });
    Leave.belongsTo(LeaveType, { foreignKey: 'leave_type_id' });
    PayrollRun.hasMany(PayrollLine, { foreignKey: 'payroll_id' });
    PayrollLine.belongsTo(PayrollRun, { foreignKey: 'payroll_id' });
    PayrollLine.belongsTo(Employee, { foreignKey: 'employee_id' });
    KPI.belongsTo(Employee, { foreignKey: 'employee_id' });

    // Projects relationships
    Project.belongsTo(Partner, { as: 'customer', foreignKey: 'customer_id' });
    Project.belongsTo(Employee, { as: 'manager', foreignKey: 'manager_id' });
    Project.hasMany(Milestone, { foreignKey: 'project_id' });
    Project.hasMany(Task, { foreignKey: 'project_id' });
    Milestone.belongsTo(Project, { foreignKey: 'project_id' });
    Task.belongsTo(Project, { foreignKey: 'project_id' });
    Task.belongsTo(Milestone, { foreignKey: 'milestone_id' });
    Task.belongsTo(Employee, { as: 'assignedEmployee', foreignKey: 'assignee' });
    Timesheet.belongsTo(Employee, { foreignKey: 'employee_id' });
    Timesheet.belongsTo(Project, { foreignKey: 'project_id' });
    Timesheet.belongsTo(Task, { foreignKey: 'task_id' });
    ProjectCost.belongsTo(Project, { foreignKey: 'project_id' });

    // Service relationships
    Ticket.belongsTo(Partner, { as: 'customer', foreignKey: 'customer_id' });
    Ticket.belongsTo(Employee, { as: 'assignedEmployee', foreignKey: 'assignee' });
    Warranty.belongsTo(InventoryProduct, { foreignKey: 'product_id' });
    Warranty.belongsTo(Partner, { as: 'customer', foreignKey: 'customer_id' });
    MaintenanceLog.belongsTo(Ticket, { foreignKey: 'ticket_id' });
    MaintenanceLog.belongsTo(Warranty, { foreignKey: 'warranty_id' });
    MaintenanceLog.belongsTo(Employee, { as: 'technicianEmployee', foreignKey: 'technician' });

    // E-commerce/POS relationships
    POSSession.belongsTo(User, { foreignKey: 'user_id' });
    POSOrder.belongsTo(POSSession, { foreignKey: 'session_id' });
    POSOrder.belongsTo(Partner, { as: 'customer', foreignKey: 'customer_id' });
    POSOrder.hasMany(POSOrderLine, { foreignKey: 'order_id' });
    POSOrderLine.belongsTo(POSOrder, { foreignKey: 'order_id' });
    OnlineOrder.belongsTo(Partner, { as: 'customer', foreignKey: 'customer_id' });
    OnlineOrder.hasMany(OnlineOrderLine, { foreignKey: 'order_id' });
    OnlineOrderLine.belongsTo(OnlineOrder, { foreignKey: 'order_id' });
    Cart.belongsTo(Partner, { as: 'customer', foreignKey: 'customer_id' });
    Cart.hasMany(CartItem, { foreignKey: 'cart_id' });
    CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });

    // Workflow relationships
    WorkflowInstance.belongsTo(Workflow, { foreignKey: 'workflow_id' });
    Approval.belongsTo(WorkflowInstance, { foreignKey: 'workflow_instance_id' });
    Approval.belongsTo(User, { as: 'approver', foreignKey: 'approver_id' });

    // Mark associations as set up
    associationsSetup = true;
    console.log('[Database] Associations set up successfully');
}

/**
 * Initialize database and create tables
 */
export async function initializeDatabase(options = {}) {
    try {
        await sequelize.authenticate();
        console.log('[Database] Connection established successfully');

        // Setup associations
        setupAssociations();

        const syncOptions = {
            alter: options.alter || false,
            force: options.force || false,
        };

        await sequelize.sync(syncOptions);
        console.log('[Database] All models synchronized');

        return true;
    } catch (error) {
        console.error('[Database] Initialization failed:', error);
        throw error;
    }
}

/**
 * Get a specific model
 */
export function getModel(modelName) {
    if (!models[modelName]) {
        throw new Error(`Model ${modelName} not found`);
    }
    return models[modelName];
}

export { sequelize };
export default models;
