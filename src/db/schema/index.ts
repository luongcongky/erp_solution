// Export all schemas
export * from './core';
export * from './inventory';
export * from './hr';
export * from './accounting';
export * from './sales';
export * from './purchase';
export * from './manufacturing';
export * from './projects';
export * from './service';
export * from './ecommerce';

// Re-export commonly used tables from core
export {
    users,
    languages,
    roles,
    permissions,
    userRoles,
    translations,
    auditLogs,
    partners,
    menus,
    notifications
} from './core';

// Re-export commonly used tables from inventory
export {
    items,
    warehouses,
    locations,
    stockBalance,
    stockMovement
} from './inventory';

// Re-export types
export type {
    User,
    NewUser,
    Language,
    NewLanguage,
    Role,
    NewRole,
    Permission,
    NewPermission,
    Translation,
    NewTranslation,
    AuditLog,
    NewAuditLog,
    Partner,
    NewPartner,
    Menu,
    NewMenu,
    Notification,
    NewNotification
} from './core';

export type {
    Item,
    NewItem,
    Warehouse,
    NewWarehouse,
    Location,
    NewLocation,
    StockBalance,
    NewStockBalance,
    StockMovement,
    NewStockMovement
} from './inventory';
