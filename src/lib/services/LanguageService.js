/**
 * Language Service
 * Business logic layer for language management
 */

import { BaseService } from './BaseService.js';
import { getLanguageRepository } from '../repositories/LanguageRepository.js';
import { ValidationError, ConflictError, BusinessLogicError } from '@/lib/errors.js';
import { validateRequired } from '@/lib/validators.js';

export class LanguageService extends BaseService {
    constructor() {
        const languageRepository = getLanguageRepository();
        super(languageRepository);
        this.languageRepository = languageRepository;
    }

    /**
     * Get all languages
     */
    async getAllLanguages(tenantContext, options = {}) {
        try {
            const { limit = 100, offset = 0, activeOnly = false } = options;

            let data, total;

            if (activeOnly) {
                data = await this.languageRepository.getActiveLanguages(tenantContext);
                total = data.length;
            } else {
                [data, total] = await Promise.all([
                    this.languageRepository.findAll({}, tenantContext, {
                        limit,
                        offset,
                        orderBy: [{ order: 'asc' }, { name: 'asc' }]
                    }),
                    this.languageRepository.count({}, tenantContext)
                ]);
            }

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
            this.log('error', 'Failed to get all languages', error);
            throw error;
        }
    }

    /**
     * Get language by ID
     */
    async getLanguageById(id, tenantContext) {
        try {
            return await this.languageRepository.findById(id, tenantContext);
        } catch (error) {
            this.log('error', `Failed to get language ${id}`, error);
            throw error;
        }
    }

    /**
     * Get default language
     */
    async getDefaultLanguage(tenantContext) {
        try {
            return await this.languageRepository.getDefaultLanguage(tenantContext);
        } catch (error) {
            this.log('error', 'Failed to get default language', error);
            throw error;
        }
    }

    /**
     * Create new language
     */
    async createLanguage(languageData, tenantContext) {
        try {
            const { code, name, nativeName, isDefault = false } = languageData;

            // Validation
            validateRequired(['code', 'name'], languageData);

            // Check if code already exists
            const codeExists = await this.languageRepository.codeExists(code, tenantContext);
            if (codeExists) {
                throw new ConflictError('Language code already exists');
            }

            // Create language
            const newLanguage = await this.languageRepository.create(
                {
                    code,
                    name,
                    nativeName: nativeName || name,
                    flagEmoji: languageData.flagEmoji || null,
                    isDefault,
                    isActive: languageData.isActive !== undefined ? languageData.isActive : true,
                    direction: languageData.direction || 'ltr',
                    order: languageData.order || 0
                },
                tenantContext
            );

            // If this is set as default, update other languages
            if (isDefault) {
                await this.languageRepository.setAsDefault(newLanguage.id, tenantContext);
            }

            this.log('info', `Language created: ${newLanguage.code}`);
            return newLanguage;
        } catch (error) {
            this.log('error', 'Failed to create language', error);
            throw error;
        }
    }

    /**
     * Update language
     */
    async updateLanguage(id, languageData, tenantContext) {
        try {
            // Check if language exists
            await this.languageRepository.findById(id, tenantContext);

            // Validate code if provided
            if (languageData.code) {
                const codeExists = await this.languageRepository.codeExists(
                    languageData.code,
                    tenantContext,
                    id
                );
                if (codeExists) {
                    throw new ConflictError('Language code already exists');
                }
            }

            // Update language
            const updatedLanguage = await this.languageRepository.update(id, languageData, tenantContext);

            // If setting as default, update other languages
            if (languageData.isDefault === true) {
                await this.languageRepository.setAsDefault(id, tenantContext);
            }

            this.log('info', `Language updated: ${id}`);
            return updatedLanguage;
        } catch (error) {
            this.log('error', `Failed to update language ${id}`, error);
            throw error;
        }
    }

    /**
     * Delete language
     */
    async deleteLanguage(id, tenantContext) {
        try {
            // Check if language exists
            const language = await this.languageRepository.findById(id, tenantContext);

            // Don't allow deleting default language
            if (language.isDefault) {
                throw new BusinessLogicError(
                    'Cannot delete default language. Please set another language as default first.'
                );
            }

            // Delete language
            await this.languageRepository.delete(id, tenantContext);

            this.log('info', `Language deleted: ${id}`);
            return true;
        } catch (error) {
            this.log('error', `Failed to delete language ${id}`, error);
            throw error;
        }
    }

    /**
     * Set language as default
     */
    async setAsDefault(id, tenantContext) {
        try {
            // Check if language exists and is active
            const language = await this.languageRepository.findById(id, tenantContext);

            if (!language.isActive) {
                throw new BusinessLogicError('Cannot set inactive language as default');
            }

            // Set as default
            const updated = await this.languageRepository.setAsDefault(id, tenantContext);

            this.log('info', `Language set as default: ${id}`);
            return updated;
        } catch (error) {
            this.log('error', `Failed to set language ${id} as default`, error);
            throw error;
        }
    }
}

// Export singleton instance
let languageServiceInstance = null;

export function getLanguageService() {
    if (!languageServiceInstance) {
        languageServiceInstance = new LanguageService();
    }
    return languageServiceInstance;
}

export default LanguageService;
