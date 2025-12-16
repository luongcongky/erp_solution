/**
 * Item Service
 * Business logic layer for item management
 */

import { BaseService } from './BaseService.js';
import { getItemRepository } from '../repositories/ItemRepository.js';
import { getItemBarcodeRepository } from '../repositories/ItemBarcodeRepository.js';
import { getUomMasterRepository } from '../repositories/UomMasterRepository.js';
import { ValidationError, ConflictError, BusinessLogicError, NotFoundError } from '@/lib/errors.js';

export class ItemService extends BaseService {
    constructor() {
        const itemRepository = getItemRepository();
        super(itemRepository);
        this.itemRepository = itemRepository;
        this.barcodeRepository = getItemBarcodeRepository();
        this.uomRepository = getUomMasterRepository();
    }

    /**
     * Get all items with pagination and filters
     */
    async getAllItems(tenantContext, options = {}) {
        try {
            const { limit = 50, offset = 0, search, filters = {}, sort = 'createdAt', order = 'desc' } = options;

            // Always use search method to include relations (Item Group, UOM names)
            const data = await this.itemRepository.search(search || '', filters, tenantContext, {
                limit,
                offset,
                orderBy: sort,
                orderDir: order
            });

            const total = await this.itemRepository.count({ ...filters, search }, tenantContext);

            return {
                data,
                pagination: {
                    total,
                    limit,
                    offset,
                    page: Math.floor(offset / limit) + 1,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            this.log('error', 'Failed to get all items', error);
            throw error;
        }
    }

    /**
     * Get item by ID with all relations
     */
    async getItemById(id, tenantContext) {
        try {
            const item = await this.itemRepository.findWithRelations(id, tenantContext);

            if (!item) {
                throw new NotFoundError('Item', id);
            }

            // Get related data
            const [barcodes] = await Promise.all([
                this.barcodeRepository.findByItemId(id, tenantContext)
            ]);

            return {
                ...item,
                barcodes
            };
        } catch (error) {
            this.log('error', `Failed to get item ${id}`, error);
            throw error;
        }
    }

    /**
     * Create new item
     */
    async createItem(itemData, tenantContext) {
        try {
            // Validation
            this.validateItemData(itemData);

            const { sku, name, itemType, baseUomId } = itemData;

            // Check if SKU already exists
            const skuExists = await this.itemRepository.skuExists(sku, tenantContext);
            if (skuExists) {
                throw new ConflictError(`SKU '${sku}' already exists`);
            }

            // Validate UOM exists if provided
            if (baseUomId) {
                const uom = await this.uomRepository.findById(baseUomId, tenantContext);
                if (!uom) {
                    throw new ValidationError('Invalid base UOM');
                }
            }

            // Create item
            const newItem = await this.itemRepository.create(itemData, tenantContext);

            this.log('info', `Item created: ${newItem.sku}`);

            return newItem;
        } catch (error) {
            this.log('error', 'Failed to create item', error);
            throw error;
        }
    }

    /**
     * Get item groups
     */
    async getItemGroups(tenantContext) {
        try {
            return await this.itemRepository.getItemGroups(tenantContext);
        } catch (error) {
            this.log('error', 'Failed to get item groups', error);
            throw error;
        }
    }

    /**
     * Update item
     */
    async updateItem(id, itemData, tenantContext) {
        try {
            // Check if item exists
            await this.itemRepository.findById(id, tenantContext);

            // Validate SKU if provided
            if (itemData.sku) {
                const skuExists = await this.itemRepository.skuExists(itemData.sku, tenantContext, id);
                if (skuExists) {
                    throw new ConflictError(`SKU '${itemData.sku}' already exists`);
                }
            }

            // Validate UOMs if provided
            if (itemData.baseUomId) {
                const uom = await this.uomRepository.findById(itemData.baseUomId, tenantContext);
                if (!uom) {
                    throw new ValidationError('Invalid base UOM');
                }
            }

            // Update item
            const updatedItem = await this.itemRepository.update(id, itemData, tenantContext);

            this.log('info', `Item updated: ${id}`);

            return updatedItem;
        } catch (error) {
            this.log('error', `Failed to update item ${id}`, error);
            throw error;
        }
    }

    /**
     * Delete item
     */
    async deleteItem(id, tenantContext) {
        try {
            // Check if item exists
            await this.itemRepository.findById(id, tenantContext);

            // TODO: Check if item is used in any transactions
            // For now, just delete (cascade will handle related records)

            await this.itemRepository.delete(id, tenantContext);

            this.log('info', `Item deleted: ${id}`);
            return true;
        } catch (error) {
            this.log('error', `Failed to delete item ${id}`, error);
            throw error;
        }
    }

    /**
     * Validate item data
     */
    validateItemData(itemData) {
        const errors = {};

        // SKU validation
        if (!itemData.sku || itemData.sku.trim() === '') {
            errors.sku = 'SKU is required';
        } else if (!/^[A-Z0-9-]+$/.test(itemData.sku)) {
            errors.sku = 'SKU must contain only uppercase letters, numbers, and hyphens';
        } else if (itemData.sku.length > 100) {
            errors.sku = 'SKU must not exceed 100 characters';
        }

        // Name validation
        if (!itemData.name || itemData.name.trim() === '') {
            errors.name = 'Name is required';
        } else if (itemData.name.length > 200) {
            errors.name = 'Name must not exceed 200 characters';
        }

        // Numeric validations
        if (itemData.minStock !== undefined && itemData.minStock < 0) {
            errors.minStock = 'Min stock must be >= 0';
        }
        if (itemData.maxStock !== undefined && itemData.minStock !== undefined && itemData.maxStock < itemData.minStock) {
            errors.maxStock = 'Max stock must be >= min stock';
        }
        if (itemData.reorderPoint !== undefined && itemData.reorderPoint < 0) {
            errors.reorderPoint = 'Reorder point must be >= 0';
        }
        if (itemData.reorderQty !== undefined && itemData.reorderQty < 0) {
            errors.reorderQty = 'Reorder quantity must be >= 0';
        }
        if (itemData.standardCost !== undefined && itemData.standardCost < 0) {
            errors.standardCost = 'Standard cost must be >= 0';
        }
        if (itemData.defaultSellingPrice !== undefined && itemData.defaultSellingPrice < 0) {
            errors.defaultSellingPrice = 'Default selling price must be >= 0';
        }

        if (Object.keys(errors).length > 0) {
            throw new ValidationError('Validation failed', errors);
        }

        return true;
    }

    /**
     * Lookup item by barcode
     */
    async lookupByBarcode(barcode, tenantContext) {
        try {
            const item = await this.itemRepository.findByBarcode(barcode, tenantContext);

            if (!item) {
                throw new NotFoundError('Item', `barcode: ${barcode}`);
            }

            return item;
        } catch (error) {
            this.log('error', `Failed to lookup item by barcode ${barcode}`, error);
            throw error;
        }
    }

    /**
     * Add barcode to item
     */
    async addBarcode(itemId, barcodeData, tenantContext) {
        try {
            // Check if item exists
            await this.itemRepository.findById(itemId, tenantContext);

            // Validate barcode
            if (!barcodeData.barcode || barcodeData.barcode.trim() === '') {
                throw new ValidationError('Barcode is required');
            }

            // Check if barcode already exists
            const exists = await this.barcodeRepository.barcodeExists(barcodeData.barcode, tenantContext);
            if (exists) {
                throw new ConflictError(`Barcode '${barcodeData.barcode}' already exists`);
            }

            // Create barcode
            const newBarcode = await this.barcodeRepository.create({
                ...barcodeData,
                itemId
            }, tenantContext);

            // If this is set as primary, update other barcodes
            if (barcodeData.isPrimary) {
                await this.barcodeRepository.setPrimary(newBarcode.id, itemId, tenantContext);
            }

            this.log('info', `Barcode added to item ${itemId}: ${barcodeData.barcode}`);

            return newBarcode;
        } catch (error) {
            this.log('error', `Failed to add barcode to item ${itemId}`, error);
            throw error;
        }
    }

    /**
     * Remove barcode from item
     */
    async removeBarcode(itemId, barcodeId, tenantContext) {
        try {
            // Check if barcode belongs to this item
            const barcode = await this.barcodeRepository.findById(barcodeId, tenantContext);
            if (barcode.itemId !== itemId) {
                throw new BusinessLogicError('Barcode does not belong to this item');
            }

            await this.barcodeRepository.delete(barcodeId, tenantContext);

            this.log('info', `Barcode removed from item ${itemId}`);
            return true;
        } catch (error) {
            this.log('error', `Failed to remove barcode from item ${itemId}`, error);
            throw error;
        }
    }

    /**
     * Get low stock items
     */
    async getLowStockItems(tenantContext, options = {}) {
        try {
            const { limit = 50, offset = 0 } = options;

            const data = await this.itemRepository.findLowStock(tenantContext, { limit, offset });
            const total = data.length; // Approximate, would need separate count query

            return {
                data,
                pagination: {
                    total,
                    limit,
                    offset,
                    page: Math.floor(offset / limit) + 1,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            this.log('error', 'Failed to get low stock items', error);
            throw error;
        }
    }

    /**
     * Get item statistics
     */
    async getItemStats(tenantContext) {
        try {
            return await this.itemRepository.getStats(tenantContext);
        } catch (error) {
            this.log('error', 'Failed to get item stats', error);
            throw error;
        }
    }
}

// Export singleton instance
let itemServiceInstance = null;

export function getItemService() {
    if (!itemServiceInstance) {
        itemServiceInstance = new ItemService();
    }
    return itemServiceInstance;
}

export default ItemService;
