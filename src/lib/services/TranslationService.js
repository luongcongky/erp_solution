/**
 * Translation Service
 * Business logic layer for translation management
 */

import { BaseService } from './BaseService.js';
import { getTranslationRepository } from '../repositories/TranslationRepository.js';
import { ValidationError } from '@/lib/errors.js';
import { validateRequired } from '@/lib/validators.js';

export class TranslationService extends BaseService {
    constructor() {
        const translationRepository = getTranslationRepository();
        super(translationRepository);
        this.translationRepository = translationRepository;
    }

    /**
     * Get translations for a locale
     */
    async getTranslationsByLocale(locale, tenantContext, module = null) {
        try {
            const translationsMap = await this.translationRepository.getTranslationsMap(
                locale,
                tenantContext,
                module
            );

            return { translations: translationsMap };
        } catch (error) {
            this.log('error', `Failed to get translations for locale ${locale}`, error);
            throw error;
        }
    }

    /**
     * Get translation by key and locale
     */
    async getTranslation(key, locale, tenantContext) {
        try {
            const translation = await this.translationRepository.findByKeyAndLocale(
                key,
                locale,
                tenantContext
            );

            return translation;
        } catch (error) {
            this.log('error', `Failed to get translation ${key}:${locale}`, error);
            throw error;
        }
    }

    /**
     * Create or update translation
     */
    async upsertTranslation(translationData, tenantContext) {
        try {
            const { key, locale, value, module } = translationData;

            // Validation
            validateRequired(['key', 'locale', 'value'], translationData);

            // Check if exists
            const existing = await this.translationRepository.findByKeyAndLocale(
                key,
                locale,
                tenantContext
            );

            let result;
            if (existing) {
                // Update
                result = await this.translationRepository.update(
                    existing.id,
                    { value, module },
                    tenantContext
                );
                this.log('info', `Translation updated: ${key}:${locale}`);
            } else {
                // Create
                result = await this.translationRepository.create(
                    { key, locale, value, module: module || null },
                    tenantContext
                );
                this.log('info', `Translation created: ${key}:${locale}`);
            }

            return result;
        } catch (error) {
            this.log('error', 'Failed to upsert translation', error);
            throw error;
        }
    }

    /**
     * Bulk upsert translations
     */
    async bulkUpsertTranslations(translationsData, tenantContext) {
        try {
            // Validation
            if (!Array.isArray(translationsData)) {
                throw new ValidationError('Translations data must be an array');
            }

            // Validate each translation
            for (const item of translationsData) {
                validateRequired(['key', 'locale', 'value'], item);
            }

            // Bulk upsert
            const results = await this.translationRepository.bulkUpsert(
                translationsData,
                tenantContext
            );

            this.log('info', `Bulk upserted ${results.length} translations`);
            return { count: results.length, data: results };
        } catch (error) {
            this.log('error', 'Failed to bulk upsert translations', error);
            throw error;
        }
    }

    /**
     * Delete translation
     */
    async deleteTranslation(id, tenantContext) {
        try {
            await this.translationRepository.delete(id, tenantContext);
            this.log('info', `Translation deleted: ${id}`);
            return true;
        } catch (error) {
            this.log('error', `Failed to delete translation ${id}`, error);
            throw error;
        }
    }

    /**
     * Get available modules
     */
    async getModules(tenantContext) {
        try {
            const modules = await this.translationRepository.getModules(tenantContext);
            return { modules };
        } catch (error) {
            this.log('error', 'Failed to get modules', error);
            throw error;
        }
    }
}

// Export singleton instance
let translationServiceInstance = null;

export function getTranslationService() {
    if (!translationServiceInstance) {
        translationServiceInstance = new TranslationService();
    }
    return translationServiceInstance;
}

export default TranslationService;
