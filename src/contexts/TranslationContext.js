'use client';

import { createContext, useState, useEffect, useCallback, useContext } from 'react';

const TranslationContext = createContext();

export function TranslationProvider({ children }) {
    const [translations, setTranslations] = useState({});
    // Initialize locale from localStorage immediately (not in useEffect)
    const [locale, setLocale] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('locale') || 'vi';
        }
        return 'vi';
    });
    const [loading, setLoading] = useState(true);

    // Fetch translations when locale changes
    useEffect(() => {
        const loadTranslations = async () => {
            setLoading(true);
            try {
                console.log('[TranslationContext] Fetching translations for:', locale);
                const response = await fetch(`/api/translations/${locale}`, {
                    cache: 'no-store',
                    headers: {
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    }
                });
                const result = await response.json();

                if (result.success) {
                    console.log('[TranslationContext] Loaded translations:', Object.keys(result.data).length, 'keys');
                    setTranslations(result.data);
                }
            } catch (error) {
                console.error('[TranslationContext] Error loading translations:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTranslations();
    }, [locale]);

    const changeLocale = (newLocale) => {
        localStorage.setItem('locale', newLocale);
        setLocale(newLocale);
    };

    const t = useCallback((key, fallback = null) => {
        const keys = key.split('.');
        let value = translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return fallback || key;
            }
        }

        return value || fallback || key;
    }, [translations]);

    return (
        <TranslationContext.Provider value={{ t, locale, changeLocale, loading, translations }}>
            {children}
        </TranslationContext.Provider>
    );
}

export function useTranslationContext() {
    return useContext(TranslationContext);
}
