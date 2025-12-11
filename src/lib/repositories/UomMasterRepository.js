/**
 * UOM Master Repository
 * Data access layer for uom_master table
 */

import { BaseRepository } from './BaseRepository.js';
import { uomMaster } from '@/db/schema/inventory';
import { eq, and, sql } from 'drizzle-orm';
import { DatabaseError } from '@/lib/errors.js';

export class UomMasterRepository extends BaseRepository {
    constructor() {
        super(uomMaster, 'UomMaster');
    }

    /**
     * Find UOM by code
     */
    async findByCode(code, tenantContext) {
        try {
            const conditions = [
                eq(uomMaster.code, code),
                ...this.buildTenantFilter(tenantContext)
            ];

            const [uom] = await this.db
                .select()
                .from(uomMaster)
                .where(and(...conditions))
                .limit(1);

            return uom || null;
        } catch (error) {
            throw new DatabaseError('Failed to find UOM by code', error);
        }
    }

    /**
     * Find UOMs by type
     */
    async findByType(uomType, tenantContext) {
        try {
            const conditions = [
                eq(uomMaster.uomType, uomType),
                eq(uomMaster.isActive, true),
                ...this.buildTenantFilter(tenantContext)
            ];

            const uoms = await this.db
                .select()
                .from(uomMaster)
                .where(and(...conditions))
                .orderBy(uomMaster.name);

            return uoms;
        } catch (error) {
            throw new DatabaseError('Failed to find UOMs by type', error);
        }
    }

    /**
     * Check if UOM code already exists
     */
    async codeExists(code, tenantContext, excludeId = null) {
        try {
            const conditions = [
                eq(uomMaster.code, code),
                ...this.buildTenantFilter(tenantContext)
            ];

            if (excludeId) {
                conditions.push(sql`${uomMaster.id} != ${excludeId}`);
            }

            const [existing] = await this.db
                .select({ id: uomMaster.id })
                .from(uomMaster)
                .where(and(...conditions))
                .limit(1);

            return !!existing;
        } catch (error) {
            throw new DatabaseError('Failed to check UOM code existence', error);
        }
    }

    /**
     * Get all active UOMs grouped by type
     */
    async getAllGroupedByType(tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;

            const result = await this.db.execute(sql`
                SELECT 
                    uom_type as "uomType",
                    json_agg(
                        json_build_object(
                            'id', id,
                            'code', code,
                            'name', name,
                            'symbol', symbol
                        ) ORDER BY name
                    ) as uoms
                FROM inventory.uom_master
                WHERE is_active = true
                  AND ten_id = ${ten_id}
                  AND stg_id = ${stg_id}
                GROUP BY uom_type
                ORDER BY uom_type
            `);

            return result.rows || [];
        } catch (error) {
            throw new DatabaseError('Failed to fetch UOMs grouped by type', error);
        }
    }
}

// Export singleton instance
let uomMasterRepositoryInstance = null;

export function getUomMasterRepository() {
    if (!uomMasterRepositoryInstance) {
        uomMasterRepositoryInstance = new UomMasterRepository();
    }
    return uomMasterRepositoryInstance;
}

export default UomMasterRepository;
