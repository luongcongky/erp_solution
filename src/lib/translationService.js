/**
 * Translation Service
 * Handles translation loading, caching, and fallback logic
 */

import models from '../models/sequelize/index.js';

class TranslationService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get all active languages
     */
    async getLanguages(ten_id = '1000', stg_id = 'DEV') {
        const cacheKey = `languages_${ten_id}_${stg_id}`;

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const languages = await models.Language.findAll({
            where: {
                ten_id,
                stg_id,
                isActive: true,
            },
            order: [['order', 'ASC']],
        });

        this.cache.set(cacheKey, languages);
        setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);

        return languages;
    }

    /**
     * Get default language
     */
    async getDefaultLanguage(ten_id = '1000', stg_id = 'DEV') {
        const languages = await this.getLanguages(ten_id, stg_id);
        return languages.find(lang => lang.isDefault) || languages[0];
    }

    /**
     * Get all translations for a locale
     */
    async getTranslations(locale, module = null, ten_id = '1000', stg_id = 'DEV') {
        const cacheKey = `translations_${locale}_${module || 'all'}_${ten_id}_${stg_id}`;

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const where = {
            languageCode: locale,
            ten_id,
            stg_id,
        };

        if (module) {
            where.module = module;
        }

        const translations = await models.UITranslation.findAll({ where });

        // Convert to nested object
        const result = {};
        translations.forEach(t => {
            this.setNestedValue(result, t.key, t.value);
        });

        this.cache.set(cacheKey, result);
        setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);

        return result;
    }

    /**
     * Translate a single key with fallback
     */
    async translate(key, locale, fallback = null, ten_id = '1000', stg_id = 'DEV') {
        try {
            const translation = await models.UITranslation.findOne({
                where: {
                    key,
                    languageCode: locale,
                    ten_id,
                    stg_id,
                },
            });

            return translation?.value || fallback || key;
        } catch (error) {
            console.error('Translation error:', error);
            return fallback || key;
        }
    }

    /**
     * Clear cache for a specific locale or all
     */
    clearCache(locale = null) {
        if (locale) {
            for (const key of this.cache.keys()) {
                if (key.includes(`_${locale}_`)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }

    /**
     * Helper to set nested value in object
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key]) {
                current[key] = {};
            }
            current = current[key];
        }

        current[keys[keys.length - 1]] = value;
    }

    /**
     * Get nested value from object
     */
    getNestedValue(obj, path, fallback = null) {
        const keys = path.split('.');
        let current = obj;

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return fallback;
            }
        }

        return current;
    }
}

// Export singleton instance
const translationService = new TranslationService();
export default translationService;
