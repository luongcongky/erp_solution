'use client';

import { useTranslationContext } from '@/contexts/TranslationContext';

/**
 * Custom hook for translations
 * Usage: const { t } = useTranslations();
 *        t('common.save') => 'Lưu' or 'Save' depending on locale
 */
export function useTranslations() {
    const context = useTranslationContext();

    if (!context) {
        throw new Error('useTranslations must be used within a TranslationProvider');
    }

    return context;
}

/**
 * Simple translation function for server components
 */
export async function getTranslation(key, locale = 'vi', fallback = null) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/translations/${locale}`, {
            cache: 'force-cache',
        });
        const result = await response.json();

        if (result.success) {
            const keys = key.split('.');
            let value = result.data;

            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    return fallback || key;
                }
            }

            return value || fallback || key;
        }
    } catch (error) {
        console.error('Translation error:', error);
    }

    return fallback || key;
}
