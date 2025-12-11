// Export all schemas
export * from './core';
export * from './inventory';
export * from './inventory_ext';
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
    itemGroups,
    itemCategories,
    uomMaster,
    priceLists,
    itemBarcodes,
    itemSuppliers,
    itemCustomers,
    itemPrices,
    itemSpecifications,
    itemImages,
    itemDocuments,
    itemVariants,
    warehouses,
    locations,
    stockBalance,
    stockMovement,
    uomConversion
} from './inventory';

// Re-export industry extension tables
export {
    itemPlastics,
    itemFood,
    itemMechanical,
    itemTextile
} from './inventory_ext';

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
    ItemGroup,
    NewItemGroup,
    ItemCategory,
    NewItemCategory,
    UomMaster,
    NewUomMaster,
    PriceList,
    NewPriceList,
    ItemBarcode,
    NewItemBarcode,
    ItemSupplier,
    NewItemSupplier,
    ItemCustomer,
    NewItemCustomer,
    ItemPrice,
    NewItemPrice,
    ItemSpecification,
    NewItemSpecification,
    ItemImage,
    NewItemImage,
    ItemDocument,
    NewItemDocument,
    ItemVariant,
    NewItemVariant,
    Warehouse,
    NewWarehouse,
    Location,
    NewLocation,
    StockBalance,
    NewStockBalance,
    StockMovement,
    NewStockMovement,
    UomConversion,
    NewUomConversion
} from './inventory';

export type {
    ItemPlastic,
    NewItemPlastic,
    ItemFood,
    NewItemFood,
    ItemMechanical,
    NewItemMechanical,
    ItemTextile,
    NewItemTextile
} from './inventory_ext';
