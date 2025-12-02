import Item from './Item.js';
import Warehouse from './Warehouse.js';
import Location from './Location.js';
import StockLot from './StockLot.js';
import StockBalance from './StockBalance.js';
import StockMovement from './StockMovement.js';
import UomConversion from './UomConversion.js';
import InventoryCount from './InventoryCount.js';
import InventoryCountLine from './InventoryCountLine.js';

// --- Associations ---

// 1. Location Hierarchy & Warehouse
Warehouse.hasMany(Location, { foreignKey: 'warehouse_id', as: 'locations' });
Location.belongsTo(Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });

Location.hasMany(Location, { foreignKey: 'parent_location_id', as: 'children' });
Location.belongsTo(Location, { foreignKey: 'parent_location_id', as: 'parent' });

// 2. Stock Lots
Item.hasMany(StockLot, { foreignKey: 'item_id', as: 'lots' });
StockLot.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });

// 3. Stock Balances
Item.hasMany(StockBalance, { foreignKey: 'item_id', as: 'balances' });
StockBalance.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });

Warehouse.hasMany(StockBalance, { foreignKey: 'warehouse_id', as: 'balances' });
StockBalance.belongsTo(Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });

Location.hasMany(StockBalance, { foreignKey: 'location_id', as: 'balances' });
StockBalance.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });

StockLot.hasMany(StockBalance, { foreignKey: 'lot_id', as: 'balances' });
StockBalance.belongsTo(StockLot, { foreignKey: 'lot_id', as: 'lot' });

// 4. Stock Movements
Item.hasMany(StockMovement, { foreignKey: 'item_id', as: 'movements' });
StockMovement.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });

Warehouse.hasMany(StockMovement, { foreignKey: 'from_warehouse_id', as: 'outgoing_movements' });
StockMovement.belongsTo(Warehouse, { foreignKey: 'from_warehouse_id', as: 'from_warehouse' });

Warehouse.hasMany(StockMovement, { foreignKey: 'to_warehouse_id', as: 'incoming_movements' });
StockMovement.belongsTo(Warehouse, { foreignKey: 'to_warehouse_id', as: 'to_warehouse' });

Location.hasMany(StockMovement, { foreignKey: 'from_location_id', as: 'outgoing_location_movements' });
StockMovement.belongsTo(Location, { foreignKey: 'from_location_id', as: 'from_location' });

Location.hasMany(StockMovement, { foreignKey: 'to_location_id', as: 'incoming_location_movements' });
StockMovement.belongsTo(Location, { foreignKey: 'to_location_id', as: 'to_location' });

StockLot.hasMany(StockMovement, { foreignKey: 'lot_id', as: 'movements' });
StockMovement.belongsTo(StockLot, { foreignKey: 'lot_id', as: 'lot' });

// 5. UOM Conversions
Item.hasMany(UomConversion, { foreignKey: 'item_id', as: 'uom_conversions' });
UomConversion.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });

// 6. Inventory Counts
Warehouse.hasMany(InventoryCount, { foreignKey: 'warehouse_id', as: 'inventory_counts' });
InventoryCount.belongsTo(Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });

InventoryCount.hasMany(InventoryCountLine, { foreignKey: 'inventory_count_id', as: 'lines' });
InventoryCountLine.belongsTo(InventoryCount, { foreignKey: 'inventory_count_id', as: 'count' });

Item.hasMany(InventoryCountLine, { foreignKey: 'item_id', as: 'inventory_count_lines' });
InventoryCountLine.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });

Location.hasMany(InventoryCountLine, { foreignKey: 'location_id', as: 'inventory_count_lines' });
InventoryCountLine.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });

StockLot.hasMany(InventoryCountLine, { foreignKey: 'lot_id', as: 'inventory_count_lines' });
InventoryCountLine.belongsTo(StockLot, { foreignKey: 'lot_id', as: 'lot' });

export {
    Item,
    Warehouse,
    Location,
    StockLot,
    StockBalance,
    StockMovement,
    UomConversion,
    InventoryCount,
    InventoryCountLine
};
