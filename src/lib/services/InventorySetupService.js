/**
 * Inventory Setup Service
 * Business logic layer for inventory setup operations
 */

import { getInventorySetupRepository } from '@/lib/repositories/InventorySetupRepository.js';
import { getItemRepository } from '@/lib/repositories/ItemRepository.js';
import { getWarehouseRepository } from '@/lib/repositories/WarehouseRepository.js';
import { ValidationError, NotFoundError } from '@/lib/errors.js';

export class InventorySetupService {
    constructor() {
        this.repository = getInventorySetupRepository();
        this.itemRepository = getItemRepository();
        this.warehouseRepository = getWarehouseRepository();
    }

    /**
     * Get all inventory setups with filters
     */
    async getAllSetups(tenantContext, filters = {}) {
        return await this.repository.findAll(tenantContext, filters);
    }

    /**
     * Get inventory setup by ID
     */
    async getSetupById(id, tenantContext) {
        const setup = await this.repository.findById(id, tenantContext);
        if (!setup) {
            throw new NotFoundError('Inventory setup not found');
        }
        return setup;
    }

    /**
     * Create new inventory setup
     */
    async createSetup(data, tenantContext) {
        // Validate required fields
        if (!data.itemId) {
            throw new ValidationError('Item is required');
        }
        if (!data.warehouseId) {
            throw new ValidationError('Warehouse is required');
        }

        // Verify item exists
        const item = await this.itemRepository.findById(data.itemId, tenantContext);
        if (!item) {
            throw new NotFoundError('Item not found');
        }

        // Verify warehouse exists
        const warehouse = await this.warehouseRepository.findById(data.warehouseId, tenantContext);
        if (!warehouse) {
            throw new NotFoundError('Warehouse not found');
        }

        // Check if setup already exists for this item-warehouse combination
        const exists = await this.repository.setupExists(
            data.itemId,
            data.warehouseId,
            tenantContext
        );
        if (exists) {
            throw new ValidationError('Inventory setup already exists for this item-warehouse combination');
        }

        // Validate min/max/reorder values
        this.validateStockLevels(data);

        // Create setup
        return await this.repository.create(data, tenantContext);
    }

    /**
     * Update inventory setup
     */
    async updateSetup(id, data, tenantContext) {
        // Check if setup exists
        const existing = await this.repository.findById(id, tenantContext);
        if (!existing) {
            throw new NotFoundError('Inventory setup not found');
        }

        // If changing item or warehouse, check for duplicates
        if (data.itemId || data.warehouseId) {
            const itemId = data.itemId || existing.itemId;
            const warehouseId = data.warehouseId || existing.warehouseId;

            const exists = await this.repository.setupExists(
                itemId,
                warehouseId,
                tenantContext,
                id
            );
            if (exists) {
                throw new ValidationError('Inventory setup already exists for this item-warehouse combination');
            }
        }

        // Validate min/max/reorder values
        this.validateStockLevels(data);

        // Update setup
        return await this.repository.update(id, data, tenantContext);
    }

    /**
     * Bulk update inventory setups
     */
    async bulkUpdateSetups(ids, data, tenantContext) {
        if (!ids || ids.length === 0) {
            throw new ValidationError('No setups selected for bulk update');
        }

        // Validate stock levels if provided
        this.validateStockLevels(data);

        // Perform bulk update
        return await this.repository.bulkUpdate(ids, data, tenantContext);
    }

    /**
     * Duplicate setup to other warehouses
     */
    async duplicateSetup(sourceId, targetWarehouseIds, adjustments, tenantContext) {
        if (!targetWarehouseIds || targetWarehouseIds.length === 0) {
            throw new ValidationError('No target warehouses selected');
        }

        // Get source setup
        const sourceSetup = await this.repository.findById(sourceId, tenantContext);
        if (!sourceSetup) {
            throw new NotFoundError('Source inventory setup not found');
        }

        const results = [];
        const errors = [];

        for (const warehouseId of targetWarehouseIds) {
            try {
                // Check if setup already exists
                const exists = await this.repository.setupExists(
                    sourceSetup.itemId,
                    warehouseId,
                    tenantContext
                );

                if (exists) {
                    errors.push({
                        warehouseId,
                        error: 'Setup already exists for this warehouse'
                    });
                    continue;
                }

                // Create new setup with adjustments
                const newSetupData = {
                    itemId: sourceSetup.itemId,
                    warehouseId: warehouseId,
                    tracking: sourceSetup.tracking,
                    reorderPoint: adjustments?.reorderPoint ?? sourceSetup.reorderPoint,
                    reorderQty: adjustments?.reorderQty ?? sourceSetup.reorderQty,
                    minStock: adjustments?.minStock ?? sourceSetup.minStock,
                    maxStock: adjustments?.maxStock ?? sourceSetup.maxStock,
                    safetyStock: adjustments?.safetyStock ?? sourceSetup.safetyStock,
                    valuationMethod: sourceSetup.valuationMethod,
                    allowNegativeStock: sourceSetup.allowNegativeStock,
                    notes: sourceSetup.notes,
                };

                const newSetup = await this.repository.create(newSetupData, tenantContext);
                results.push(newSetup);
            } catch (error) {
                errors.push({
                    warehouseId,
                    error: error.message
                });
            }
        }

        return {
            success: results,
            errors: errors
        };
    }

    /**
     * Delete inventory setup (soft delete)
     */
    async deleteSetup(id, tenantContext) {
        const existing = await this.repository.findById(id, tenantContext);
        if (!existing) {
            throw new NotFoundError('Inventory setup not found');
        }

        return await this.repository.delete(id, tenantContext);
    }

    /**
     * Activate/Deactivate setups
     */
    async toggleSetupStatus(ids, isActive, tenantContext) {
        if (!ids || ids.length === 0) {
            throw new ValidationError('No setups selected');
        }

        return await this.repository.bulkUpdate(ids, { isActive }, tenantContext);
    }

    /**
     * Validate stock levels
     */
    validateStockLevels(data) {
        const { minStock, maxStock, reorderPoint, reorderQty } = data;

        // Convert to numbers for comparison
        const min = minStock ? parseFloat(minStock) : null;
        const max = maxStock ? parseFloat(maxStock) : null;
        const reorder = reorderPoint ? parseFloat(reorderPoint) : null;
        const qty = reorderQty ? parseFloat(reorderQty) : null;

        // Min should be less than Max
        if (min !== null && max !== null && min > max) {
            throw new ValidationError('Min stock cannot be greater than max stock');
        }

        // Reorder point should be between min and max
        if (reorder !== null) {
            if (min !== null && reorder < min) {
                throw new ValidationError('Reorder point cannot be less than min stock');
            }
            if (max !== null && reorder > max) {
                throw new ValidationError('Reorder point cannot be greater than max stock');
            }
        }

        // Reorder qty should be positive
        if (qty !== null && qty <= 0) {
            throw new ValidationError('Reorder quantity must be greater than zero');
        }

        // All values should be non-negative
        if (min !== null && min < 0) {
            throw new ValidationError('Min stock cannot be negative');
        }
        if (max !== null && max < 0) {
            throw new ValidationError('Max stock cannot be negative');
        }
        if (reorder !== null && reorder < 0) {
            throw new ValidationError('Reorder point cannot be negative');
        }
    }
}

// Export singleton instance
let inventorySetupServiceInstance = null;

export function getInventorySetupService() {
    if (!inventorySetupServiceInstance) {
        inventorySetupServiceInstance = new InventorySetupService();
    }
    return inventorySetupServiceInstance;
}
