/**
 * Item Barcode Repository
 * Data access layer for item_barcodes table
 */

import { BaseRepository } from './BaseRepository.js';
import { itemBarcodes, items, uomMaster } from '@/db/schema/inventory';
import { eq, and, sql } from 'drizzle-orm';
import { DatabaseError } from '@/lib/errors.js';

export class ItemBarcodeRepository extends BaseRepository {
    constructor() {
        super(itemBarcodes, 'ItemBarcode');
    }

    /**
     * Find barcode by barcode string
     */
    async findByBarcode(barcode, tenantContext) {
        try {
            const conditions = [
                eq(itemBarcodes.barcode, barcode),
                ...this.buildTenantFilter(tenantContext)
            ];

            const [record] = await this.db
                .select()
                .from(itemBarcodes)
                .where(and(...conditions))
                .limit(1);

            return record || null;
        } catch (error) {
            throw new DatabaseError('Failed to find barcode', error);
        }
    }

    /**
     * Find all barcodes for an item
     */
    async findByItemId(itemId, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;

            const result = await this.db.execute(sql`
                SELECT 
                    b.id, b.barcode, b.barcode_type as "barcodeType",
                    b.is_primary as "isPrimary",
                    b.created_at as "createdAt",
                    u.id as "uom.id",
                    u.code as "uom.code",
                    u.name as "uom.name",
                    u.symbol as "uom.symbol"
                FROM inventory.item_barcodes b
                LEFT JOIN inventory.uom_master u ON b.uom_id = u.id
                WHERE b.item_id = ${itemId}
                  AND b.ten_id = ${ten_id}
                  AND b.stg_id = ${stg_id}
                ORDER BY b.is_primary DESC, b.created_at ASC
            `);

            return (result.rows || []).map(row => this.transformRow(row));
        } catch (error) {
            throw new DatabaseError('Failed to fetch item barcodes', error);
        }
    }

    /**
     * Check if barcode already exists
     */
    async barcodeExists(barcode, tenantContext, excludeId = null) {
        try {
            const conditions = [
                eq(itemBarcodes.barcode, barcode),
                ...this.buildTenantFilter(tenantContext)
            ];

            if (excludeId) {
                conditions.push(sql`${itemBarcodes.id} != ${excludeId}`);
            }

            const [existing] = await this.db
                .select({ id: itemBarcodes.id })
                .from(itemBarcodes)
                .where(and(...conditions))
                .limit(1);

            return !!existing;
        } catch (error) {
            throw new DatabaseError('Failed to check barcode existence', error);
        }
    }

    /**
     * Set a barcode as primary (unset others for the same item)
     */
    async setPrimary(barcodeId, itemId, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;

            // First, unset all primary flags for this item
            await this.db.execute(sql`
                UPDATE inventory.item_barcodes
                SET is_primary = false, updated_at = NOW()
                WHERE item_id = ${itemId}
                  AND ten_id = ${ten_id}
                  AND stg_id = ${stg_id}
            `);

            // Then set the specified barcode as primary
            const [updated] = await this.db
                .update(itemBarcodes)
                .set({ isPrimary: true, updatedAt: new Date() })
                .where(
                    and(
                        eq(itemBarcodes.id, barcodeId),
                        eq(itemBarcodes.tenId, ten_id),
                        eq(itemBarcodes.stgId, stg_id)
                    )
                )
                .returning();

            return updated;
        } catch (error) {
            throw new DatabaseError('Failed to set primary barcode', error);
        }
    }

    /**
     * Transform flat row to nested object
     */
    transformRow(row) {
        const barcode = {};
        const uom = {};

        for (const [key, value] of Object.entries(row)) {
            if (key.startsWith('uom.')) {
                const field = key.replace('uom.', '');
                if (value !== null) {
                    uom[field] = value;
                }
            } else {
                barcode[key] = value;
            }
        }

        if (Object.keys(uom).length > 0) {
            barcode.uom = uom;
        }

        return barcode;
    }
}

// Export singleton instance
let itemBarcodeRepositoryInstance = null;

export function getItemBarcodeRepository() {
    if (!itemBarcodeRepositoryInstance) {
        itemBarcodeRepositoryInstance = new ItemBarcodeRepository();
    }
    return itemBarcodeRepositoryInstance;
}

export default ItemBarcodeRepository;
