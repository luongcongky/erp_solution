/**
 * Warehouse Service
 * Business logic layer for warehouse and location management
 */

import { getWarehouseRepository } from '@/lib/repositories/WarehouseRepository.js';
import { ValidationError, NotFoundError } from '@/lib/errors.js';

export class WarehouseService {
    constructor() {
        this.repository = getWarehouseRepository();
    }

    /**
     * Get all warehouses
     */
    async getAllWarehouses(tenantContext, filters = {}) {
        return await this.repository.findAll(tenantContext, filters);
    }

    /**
     * Get warehouse by ID with locations
     */
    async getWarehouseById(id, tenantContext) {
        const warehouse = await this.repository.findByIdWithLocations(id, tenantContext);
        if (!warehouse) {
            throw new NotFoundError('Warehouse not found');
        }
        return warehouse;
    }

    /**
     * Create new warehouse
     */
    async createWarehouse(data, tenantContext) {
        // Validate required fields
        if (!data.code || !data.name) {
            throw new ValidationError('Warehouse code and name are required');
        }

        // Validate warehouse type
        const validTypes = ['RM', 'FG', 'WIP', 'QUARANTINE'];
        if (data.warehouseType && !validTypes.includes(data.warehouseType)) {
            throw new ValidationError(`Invalid warehouse type. Must be one of: ${validTypes.join(', ')}`);
        }

        // Check if code already exists
        const codeExists = await this.repository.codeExists(data.code, tenantContext);
        if (codeExists) {
            throw new ValidationError(`Warehouse code '${data.code}' already exists`);
        }

        // Create warehouse
        return await this.repository.create(data, tenantContext);
    }

    /**
     * Update warehouse
     */
    async updateWarehouse(id, data, tenantContext) {
        // Check if warehouse exists
        const existing = await this.repository.findById(id, tenantContext);
        if (!existing) {
            throw new NotFoundError('Warehouse not found');
        }

        // Validate warehouse type if provided
        if (data.warehouseType) {
            const validTypes = ['RM', 'FG', 'WIP', 'QUARANTINE'];
            if (!validTypes.includes(data.warehouseType)) {
                throw new ValidationError(`Invalid warehouse type. Must be one of: ${validTypes.join(', ')}`);
            }
        }

        // Check if code already exists (if code is being changed)
        if (data.code && data.code !== existing.code) {
            const codeExists = await this.repository.codeExists(data.code, tenantContext, id);
            if (codeExists) {
                throw new ValidationError(`Warehouse code '${data.code}' already exists`);
            }
        }

        // Update warehouse
        return await this.repository.update(id, data, tenantContext);
    }

    /**
     * Delete warehouse
     */
    async deleteWarehouse(id, tenantContext) {
        // Check if warehouse exists
        const existing = await this.repository.findById(id, tenantContext);
        if (!existing) {
            throw new NotFoundError('Warehouse not found');
        }

        // Soft delete by setting isActive to false
        return await this.repository.update(id, { isActive: false }, tenantContext);
    }

    /**
     * Get all locations for a warehouse
     */
    async getWarehouseLocations(warehouseId, tenantContext) {
        // Verify warehouse exists
        const warehouse = await this.repository.findById(warehouseId, tenantContext);
        if (!warehouse) {
            throw new NotFoundError('Warehouse not found');
        }

        return await this.repository.getLocations(warehouseId, tenantContext);
    }

    /**
     * Create new location
     */
    async createLocation(data, tenantContext) {
        // Validate required fields
        if (!data.warehouseId || !data.code || !data.name) {
            throw new ValidationError('Warehouse ID, location code and name are required');
        }

        // Verify warehouse exists
        const warehouse = await this.repository.findById(data.warehouseId, tenantContext);
        if (!warehouse) {
            throw new NotFoundError('Warehouse not found');
        }

        // Check if location code already exists in this warehouse
        const codeExists = await this.repository.locationCodeExists(
            data.warehouseId,
            data.code,
            tenantContext
        );
        if (codeExists) {
            throw new ValidationError(`Location code '${data.code}' already exists in this warehouse`);
        }

        // Build path if parent location is provided
        if (data.parentLocationId) {
            const parentLocation = await this.repository.db
                .select()
                .from(this.repository.locations)
                .where(eq(this.repository.locations.id, data.parentLocationId))
                .limit(1);

            if (parentLocation.length > 0) {
                data.path = parentLocation[0].path
                    ? `${parentLocation[0].path}/${data.code}`
                    : data.code;
            }
        } else {
            data.path = data.code;
        }

        // Create location
        return await this.repository.createLocation(data, tenantContext);
    }

    /**
     * Update location
     */
    async updateLocation(id, data, tenantContext) {
        // Validate location exists
        const existing = await this.repository.db
            .select()
            .from(this.repository.locations)
            .where(eq(this.repository.locations.id, id))
            .limit(1);

        if (existing.length === 0) {
            throw new NotFoundError('Location not found');
        }

        // Check if code already exists (if code is being changed)
        if (data.code && data.code !== existing[0].code) {
            const codeExists = await this.repository.locationCodeExists(
                existing[0].warehouseId,
                data.code,
                tenantContext,
                id
            );
            if (codeExists) {
                throw new ValidationError(`Location code '${data.code}' already exists in this warehouse`);
            }
        }

        // Update location
        return await this.repository.updateLocation(id, data, tenantContext);
    }

    /**
     * Get warehouse statistics
     */
    async getWarehouseStats(tenantContext) {
        const warehouses = await this.repository.findAll(tenantContext);

        const stats = {
            total: warehouses.length,
            byType: {
                RM: warehouses.filter(w => w.warehouseType === 'RM').length,
                FG: warehouses.filter(w => w.warehouseType === 'FG').length,
                WIP: warehouses.filter(w => w.warehouseType === 'WIP').length,
                QUARANTINE: warehouses.filter(w => w.warehouseType === 'QUARANTINE').length,
            },
            active: warehouses.filter(w => w.isActive).length,
            inactive: warehouses.filter(w => !w.isActive).length,
        };

        return stats;
    }
}

// Export singleton instance
let warehouseServiceInstance = null;

export function getWarehouseService() {
    if (!warehouseServiceInstance) {
        warehouseServiceInstance = new WarehouseService();
    }
    return warehouseServiceInstance;
}
