import {
    Item,
    Warehouse,
    Location,
    StockLot,
    StockBalance,
    StockMovement,
    UomConversion
} from '../src/models/sequelize/inventory/index.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

const TENANT_ID = '1000';
const STAGE_ID = 'DEV';

async function seedInventory() {
    console.log('Starting Inventory data seeding...');
    try {
        // 1. Create Main Warehouse
        console.log('Creating Warehouse...');
        const [warehouse] = await Warehouse.findOrCreate({
            where: { code: 'WH-MAIN' },
            defaults: {
                name: 'Main Central Warehouse',
                address: { street: '123 Industrial Park', city: 'Ho Chi Minh City' },
                ten_id: TENANT_ID,
                stg_id: STAGE_ID,
            }
        });

        // 2. Create Locations (Zone -> Rack)
        console.log('Creating Locations...');
        // Zone A: Raw Materials
        const [zoneA] = await Location.findOrCreate({
            where: { code: 'ZONE-A', warehouse_id: warehouse.id },
            defaults: {
                name: 'Raw Materials Zone',
                type: 'view',
                path: '/WH-MAIN/ZONE-A',
                ten_id: TENANT_ID,
                stg_id: STAGE_ID,
            }
        });

        const [rackA1] = await Location.findOrCreate({
            where: { code: 'RACK-A1', parent_location_id: zoneA.id },
            defaults: {
                name: 'Rack A1 - Steel',
                type: 'internal',
                warehouse_id: warehouse.id,
                path: '/WH-MAIN/ZONE-A/RACK-A1',
                ten_id: TENANT_ID,
                stg_id: STAGE_ID,
            }
        });

        // Zone B: Finished Goods
        const [zoneB] = await Location.findOrCreate({
            where: { code: 'ZONE-B', warehouse_id: warehouse.id },
            defaults: {
                name: 'Finished Goods Zone',
                type: 'view',
                path: '/WH-MAIN/ZONE-B',
                ten_id: TENANT_ID,
                stg_id: STAGE_ID,
            }
        });

        const [rackB1] = await Location.findOrCreate({
            where: { code: 'RACK-B1', parent_location_id: zoneB.id },
            defaults: {
                name: 'Rack B1 - Electronics',
                type: 'internal',
                warehouse_id: warehouse.id,
                path: '/WH-MAIN/ZONE-B/RACK-B1',
                ten_id: TENANT_ID,
                stg_id: STAGE_ID,
            }
        });

        // 3. Create Items
        console.log('Creating Items...');
        const [itemSteel] = await Item.findOrCreate({
            where: { sku: 'RM-STEEL-001' },
            defaults: {
                name: 'Stainless Steel Sheet 304',
                description: 'High quality steel sheet 2mm thickness',
                item_type: 'raw_material',
                base_uom: 'kg',
                tracking: 'batch',
                min_stock: 1000,
                ten_id: TENANT_ID,
                stg_id: STAGE_ID,
            }
        });

        const [itemPlastic] = await Item.findOrCreate({
            where: { sku: 'RM-PLASTIC-001' },
            defaults: {
                name: 'Polypropylene Granules',
                description: 'Industrial grade plastic granules',
                item_type: 'raw_material',
                base_uom: 'kg',
                tracking: 'batch',
                min_stock: 500,
                ten_id: TENANT_ID,
                stg_id: STAGE_ID,
            }
        });

        const [itemWidget] = await Item.findOrCreate({
            where: { sku: 'FG-WIDGET-X' },
            defaults: {
                name: 'Super Widget X',
                description: 'The ultimate widget for all needs',
                item_type: 'finished',
                base_uom: 'pcs',
                tracking: 'serial',
                min_stock: 50,
                ten_id: TENANT_ID,
                stg_id: STAGE_ID,
            }
        });

        // 4. Initial Stock (Receipt)
        console.log('Creating Initial Stock...');

        // Receipt for Steel
        const lotSteel1 = 'LOT-20231201';
        const [stockLotSteel] = await StockLot.findOrCreate({
            where: { lot_number: lotSteel1, item_id: itemSteel.id },
            defaults: {
                manufacture_date: new Date(),
                status: 'active',
                ten_id: TENANT_ID,
                stg_id: STAGE_ID,
            }
        });

        // Create Stock Balance
        await StockBalance.findOrCreate({
            where: {
                item_id: itemSteel.id,
                warehouse_id: warehouse.id,
                location_id: rackA1.id,
                lot_id: stockLotSteel.id
            },
            defaults: {
                quantity: 5000,
                uom: 'kg',
                ten_id: TENANT_ID,
                stg_id: STAGE_ID,
            }
        });

        // Create Movement Record
        await StockMovement.create({
            movement_type: 'receipt',
            reference: 'INIT-001',
            item_id: itemSteel.id,
            to_warehouse_id: warehouse.id,
            to_location_id: rackA1.id,
            lot_id: stockLotSteel.id,
            quantity: 5000,
            uom: 'kg',
            status: 'done',
            date: new Date(),
            ten_id: TENANT_ID,
            stg_id: STAGE_ID,
        });

        console.log('Inventory data seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Inventory seeding failed:', error);
        process.exit(1);
    }
}

seedInventory();
