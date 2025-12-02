import {
    Item,
    Warehouse,
    Location,
    StockLot,
    StockBalance,
    StockMovement,
    UomConversion,
    InventoryCount,
    InventoryCountLine
} from '../src/models/sequelize/inventory/index.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function syncInventory() {
    console.log('Starting Inventory database synchronization...');
    try {
        const options = { alter: true };

        // Sync in order of dependency
        console.log('Syncing Warehouse...');
        await Warehouse.sync(options);

        console.log('Syncing Location...');
        await Location.sync(options);

        console.log('Syncing Item...');
        await Item.sync(options);

        console.log('Syncing StockLot...');
        await StockLot.sync(options);

        console.log('Syncing StockBalance...');
        await StockBalance.sync(options);

        console.log('Syncing StockMovement...');
        await StockMovement.sync(options);

        console.log('Syncing UomConversion...');
        await UomConversion.sync(options);

        console.log('Syncing InventoryCount...');
        await InventoryCount.sync(options);

        console.log('Syncing InventoryCountLine...');
        await InventoryCountLine.sync(options);

        console.log('Inventory database synchronization completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Inventory synchronization failed:', error);
        process.exit(1);
    }
}

syncInventory();
