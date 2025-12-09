/**
 * Language Repository
 * Data access layer for languages table
 */

import { BaseRepository } from './BaseRepository.js';
import { languages } from '@/db/schema/core';
import { eq, and, sql } from 'drizzle-orm';
import { DatabaseError } from '@/lib/errors.js';

export class LanguageRepository extends BaseRepository {
    constructor() {
        super(languages, 'Language');
    }

    /**
     * Find language by code
     */
    async findByCode(code, tenantContext) {
        try {
            const conditions = [
                eq(languages.code, code),
                ...this.buildTenantFilter(tenantContext)
            ];

            const [language] = await this.db
                .select()
                .from(languages)
                .where(and(...conditions))
                .limit(1);

            return language || null;
        } catch (error) {
            throw new DatabaseError('Failed to find language by code', error);
        }
    }

    /**
     * Check if code already exists
     */
    async codeExists(code, tenantContext, excludeLanguageId = null) {
        const conditions = [
            eq(languages.code, code),
            ...this.buildTenantFilter(tenantContext)
        ];

        if (excludeLanguageId) {
            conditions.push(sql`${languages.id} != ${excludeLanguageId}`);
        }

        const [existing] = await this.db
            .select({ id: languages.id })
            .from(languages)
            .where(and(...conditions))
            .limit(1);

        return !!existing;
    }

    /**
     * Get default language
     */
    async getDefaultLanguage(tenantContext) {
        try {
            const conditions = [
                eq(languages.isDefault, true),
                eq(languages.isActive, true),
                ...this.buildTenantFilter(tenantContext)
            ];

            const [defaultLang] = await this.db
                .select()
                .from(languages)
                .where(and(...conditions))
                .limit(1);

            return defaultLang || null;
        } catch (error) {
            throw new DatabaseError('Failed to get default language', error);
        }
    }

    /**
     * Get active languages ordered by order
     */
    async getActiveLanguages(tenantContext) {
        try {
            const conditions = [
                eq(languages.isActive, true),
                ...this.buildTenantFilter(tenantContext)
            ];

            const results = await this.db
                .select()
                .from(languages)
                .where(and(...conditions))
                .orderBy(languages.order, languages.name);

            return results;
        } catch (error) {
            throw new DatabaseError('Failed to get active languages', error);
        }
    }

    /**
     * Set language as default (and unset others)
     */
    async setAsDefault(languageId, tenantContext) {
        try {
            const { ten_id, stg_id } = tenantContext;

            // First, unset all defaults
            await this.db
                .update(languages)
                .set({ isDefault: false, updatedAt: new Date() })
                .where(
                    and(
                        eq(languages.tenId, ten_id),
                        eq(languages.stgId, stg_id)
                    )
                );

            // Then set the specified language as default
            const [updated] = await this.db
                .update(languages)
                .set({ isDefault: true, updatedAt: new Date() })
                .where(
                    and(
                        eq(languages.id, languageId),
                        eq(languages.tenId, ten_id),
                        eq(languages.stgId, stg_id)
                    )
                )
                .returning();

            return updated;
        } catch (error) {
            throw new DatabaseError('Failed to set default language', error);
        }
    }
}

// Export singleton instance
let languageRepositoryInstance = null;

export function getLanguageRepository() {
    if (!languageRepositoryInstance) {
        languageRepositoryInstance = new LanguageRepository();
    }
    return languageRepositoryInstance;
}

export default LanguageRepository;
