/**
 * Translation Repository
 * Data access layer for UI translations table
 */

import { BaseRepository } from './BaseRepository.js';
import { uiTranslations } from '@/db/schema/core';
import { eq, and, sql } from 'drizzle-orm';
import { DatabaseError } from '@/lib/errors.js';

export class TranslationRepository extends BaseRepository {
    constructor() {
        super(uiTranslations, 'Translation');
    }

    /**
     * Find translation by key and locale
     */
    async findByKeyAndLocale(key, locale, tenantContext) {
        try {
            const conditions = [
                eq(uiTranslations.key, key),
                eq(uiTranslations.locale, locale),
                ...this.buildTenantFilter(tenantContext)
            ];

            const [translation] = await this.db
                .select()
                .from(uiTranslations)
                .where(and(...conditions))
                .limit(1);

            return translation || null;
        } catch (error) {
            throw new DatabaseError('Failed to find translation', error);
        }
    }

    /**
     * Get all translations for a locale
     */
    async findByLocale(locale, tenantContext, module = null) {
        try {
            const conditions = [
                eq(uiTranslations.locale, locale),
                ...this.buildTenantFilter(tenantContext)
            ];

            if (module) {
                conditions.push(eq(uiTranslations.module, module));
            }

            const results = await this.db
                .select()
                .from(uiTranslations)
                .where(and(...conditions))
                .orderBy(uiTranslations.key);

            return results;
        } catch (error) {
            throw new DatabaseError('Failed to find translations by locale', error);
        }
    }

    /**
     * Get translations as key-value map
     */
    async getTranslationsMap(locale, tenantContext, module = null) {
        try {
            const translations = await this.findByLocale(locale, tenantContext, module);

            const translationsMap = {};
            translations.forEach(t => {
                translationsMap[t.key] = t.value;
            });

            return translationsMap;
        } catch (error) {
            throw new DatabaseError('Failed to get translations map', error);
        }
    }

    /**
     * Bulk upsert translations
     */
    async bulkUpsert(translationsData, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;

            // For each translation, check if exists and update or insert
            const results = [];

            for (const item of translationsData) {
                const existing = await this.findByKeyAndLocale(
                    item.key,
                    item.locale,
                    tenantContext
                );

                if (existing) {
                    // Update
                    const [updated] = await this.db
                        .update(uiTranslations)
                        .set({
                            value: item.value,
                            module: item.module || existing.module,
                            updatedAt: new Date()
                        })
                        .where(eq(uiTranslations.id, existing.id))
                        .returning();
                    results.push(updated);
                } else {
                    // Insert
                    const [inserted] = await this.db
                        .insert(uiTranslations)
                        .values({
                            key: item.key,
                            locale: item.locale,
                            value: item.value,
                            module: item.module || null,
                            tenId: ten_id,
                            stgId: stg_id,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        })
                        .returning();
                    results.push(inserted);
                }
            }

            return results;
        } catch (error) {
            throw new DatabaseError('Failed to bulk upsert translations', error);
        }
    }

    /**
     * Get available modules
     */
    async getModules(tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;

            const results = await this.db.execute(sql`
                SELECT DISTINCT module
                FROM "core"."ui_translations"
                WHERE ten_id = ${ten_id} AND stg_id = ${stg_id}
                  AND module IS NOT NULL
                ORDER BY module
            `);

            return results.rows.map(r => r.module);
        } catch (error) {
            throw new DatabaseError('Failed to get modules', error);
        }
    }
}

// Export singleton instance
let translationRepositoryInstance = null;

export function getTranslationRepository() {
    if (!translationRepositoryInstance) {
        translationRepositoryInstance = new TranslationRepository();
    }
    return translationRepositoryInstance;
}

export default TranslationRepository;
