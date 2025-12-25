/**
 * Warehouse Repository
 * Data access layer for warehouses and locations tables
 */

import { BaseRepository } from './BaseRepository.js';
import { warehouses, locations } from '@/db/schema/inventory';
import { eq, and, sql } from 'drizzle-orm';
import { DatabaseError } from '@/lib/errors.js';

export class WarehouseRepository extends BaseRepository {
    constructor() {
        super(warehouses, 'Warehouse');
    }

    /**
     * Find all warehouses with optional filtering
     */
    async findAll(tenantContext, filters = {}) {
        try {
            const { ten_id, stg_id } = tenantContext;
            const conditions = [
                eq(warehouses.tenId, ten_id),
                eq(warehouses.stgId, stg_id)
            ];

            // Add warehouse type filter if provided
            if (filters.warehouseType) {
                conditions.push(eq(warehouses.warehouseType, filters.warehouseType));
            }

            // Add active filter if provided
            if (filters.isActive !== undefined) {
                conditions.push(eq(warehouses.isActive, filters.isActive));
            }

            const results = await this.db
                .select()
                .from(warehouses)
                .where(and(...conditions))
                .orderBy(warehouses.name);

            return results;
        } catch (error) {
            throw new DatabaseError('Failed to fetch warehouses', error);
        }
    }

    /**
     * Find warehouse by ID with locations
     */
    async findByIdWithLocations(id, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;

            // Get warehouse
            const [warehouse] = await this.db
                .select()
                .from(warehouses)
                .where(and(
                    eq(warehouses.id, id),
                    eq(warehouses.tenId, ten_id),
                    eq(warehouses.stgId, stg_id)
                ))
                .limit(1);

            if (!warehouse) {
                return null;
            }

            // Get locations for this warehouse
            const warehouseLocations = await this.db
                .select()
                .from(locations)
                .where(and(
                    eq(locations.warehouseId, id),
                    eq(locations.tenId, ten_id),
                    eq(locations.stgId, stg_id)
                ))
                .orderBy(locations.path);

            return {
                ...warehouse,
                locations: warehouseLocations
            };
        } catch (error) {
            throw new DatabaseError('Failed to fetch warehouse with locations', error);
        }
    }

    /**
     * Check if warehouse code already exists
     */
    async codeExists(code, tenantContext, excludeId = null) {
        try {
            const conditions = [
                eq(warehouses.code, code),
                ...this.buildTenantFilter(tenantContext)
            ];

            if (excludeId) {
                conditions.push(sql`${warehouses.id} != ${excludeId}`);
            }

            const [existing] = await this.db
                .select({ id: warehouses.id })
                .from(warehouses)
                .where(and(...conditions))
                .limit(1);

            return !!existing;
        } catch (error) {
            throw new DatabaseError('Failed to check warehouse code existence', error);
        }
    }

    /**
     * Create warehouse
     */
    async create(data, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;
            const [newWarehouse] = await this.db.insert(warehouses).values({
                ...data,
                tenId: ten_id,
                stgId: stg_id
            }).returning();
            return newWarehouse;
        } catch (error) {
            throw new DatabaseError('Failed to create warehouse', error);
        }
    }

    /**
     * Update warehouse
     */
    async update(id, data, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;
            const [updated] = await this.db
                .update(warehouses)
                .set({
                    ...data,
                    updatedAt: new Date()
                })
                .where(and(
                    eq(warehouses.id, id),
                    eq(warehouses.tenId, ten_id),
                    eq(warehouses.stgId, stg_id)
                ))
                .returning();
            return updated;
        } catch (error) {
            throw new DatabaseError('Failed to update warehouse', error);
        }
    }

    /**
     * Get all locations for a warehouse
     */
    async getLocations(warehouseId, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;

            const results = await this.db
                .select()
                .from(locations)
                .where(and(
                    eq(locations.warehouseId, warehouseId),
                    eq(locations.tenId, ten_id),
                    eq(locations.stgId, stg_id)
                ))
                .orderBy(locations.path);

            return results;
        } catch (error) {
            throw new DatabaseError('Failed to fetch warehouse locations', error);
        }
    }

    /**
     * Create location
     */
    async createLocation(data, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;
            const [newLocation] = await this.db.insert(locations).values({
                ...data,
                tenId: ten_id,
                stgId: stg_id
            }).returning();
            return newLocation;
        } catch (error) {
            throw new DatabaseError('Failed to create location', error);
        }
    }

    /**
     * Update location
     */
    async updateLocation(id, data, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;
            const [updated] = await this.db
                .update(locations)
                .set({
                    ...data,
                    updatedAt: new Date()
                })
                .where(and(
                    eq(locations.id, id),
                    eq(locations.tenId, ten_id),
                    eq(locations.stgId, stg_id)
                ))
                .returning();
            return updated;
        } catch (error) {
            throw new DatabaseError('Failed to update location', error);
        }
    }

    /**
     * Check if location code exists within a warehouse
     */
    async locationCodeExists(warehouseId, code, tenantContext, excludeId = null) {
        try {
            const conditions = [
                eq(locations.warehouseId, warehouseId),
                eq(locations.code, code),
                ...this.buildTenantFilter(tenantContext, locations)
            ];

            if (excludeId) {
                conditions.push(sql`${locations.id} != ${excludeId}`);
            }

            const [existing] = await this.db
                .select({ id: locations.id })
                .from(locations)
                .where(and(...conditions))
                .limit(1);

            return !!existing;
        } catch (error) {
            throw new DatabaseError('Failed to check location code existence', error);
        }
    }

    /**
     * Build tenant filter for locations table
     */
    buildTenantFilter(tenantContext, table = warehouses) {
        const { ten_id, stg_id } = tenantContext;
        return [
            eq(table.tenId, ten_id),
            eq(table.stgId, stg_id)
        ];
    }
}

// Export singleton instance
let warehouseRepositoryInstance = null;

export function getWarehouseRepository() {
    if (!warehouseRepositoryInstance) {
        warehouseRepositoryInstance = new WarehouseRepository();
    }
    return warehouseRepositoryInstance;
}
