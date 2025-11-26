'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from '@/hooks/useTranslations';

/**
 * Language Switcher Component
 * Allows users to switch between available languages
 * @param {string} variant - 'buttons' | 'dropdown'
 */
export default function LanguageSwitcher({ variant = 'buttons' }) {
    const { locale, changeLocale } = useTranslations();
    const [isOpen, setIsOpen] = useState(false);
    const [languages, setLanguages] = useState([]);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchLanguages();

        // Click outside handler
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchLanguages = async () => {
        try {
            const response = await fetch('/api/languages');
            const result = await response.json();
            if (result.success) {
                setLanguages(result.data);
            }
        } catch (error) {
            console.error('Error fetching languages:', error);
        }
    };

    const handleLanguageChange = (newLocale) => {
        console.log('Switching language to:', newLocale);
        changeLocale(newLocale);
        setIsOpen(false);
    };

    if (languages.length === 0) {
        return null;
    }

    const currentLang = languages.find(l => l.code === locale) || languages[0];

    if (variant === 'dropdown') {
        return (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: 'var(--surface-light)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        fontSize: '1.5rem',
                        minWidth: 'auto',
                        justifyContent: 'center',
                    }}
                >
                    <span>{currentLang.flagEmoji}</span>
                </button>

                {isOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '4px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 100,
                        minWidth: '150px',
                        overflow: 'hidden',
                    }}>
                        {languages.map((lang) => (
                            <div
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 16px',
                                    cursor: 'pointer',
                                    background: locale === lang.code ? 'var(--primary-light)' : 'transparent',
                                    color: locale === lang.code ? 'var(--primary)' : 'var(--text-primary)',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    if (locale !== lang.code) e.currentTarget.style.background = 'var(--surface-hover)';
                                }}
                                onMouseLeave={(e) => {
                                    if (locale !== lang.code) e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <span style={{ fontSize: '1.2rem' }}>{lang.flagEmoji}</span>
                                <span>{lang.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            gap: 'var(--spacing-xs)',
            padding: 'var(--spacing-sm)',
            background: 'var(--surface-light)',
            borderRadius: 'var(--radius-md)',
        }}>
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                        padding: 'var(--spacing-xs) var(--spacing-sm)',
                        border: locale === lang.code ? '2px solid var(--primary)' : '2px solid transparent',
                        background: locale === lang.code ? 'var(--primary-light)' : 'transparent',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: locale === lang.code ? 600 : 400,
                        color: locale === lang.code ? 'var(--primary)' : 'var(--text-secondary)',
                        transition: 'all 0.2s',
                    }}
                    className="lang-btn"
                    title={lang.nativeName}
                >
                    <span style={{ fontSize: '1.25rem' }}>{lang.flagEmoji}</span>
                    <span>{lang.code.toUpperCase()}</span>
                </button>
            ))}

            <style jsx>{`
                .lang-btn:hover {
                    background: var(--surface-hover);
                    transform: translateY(-1px);
                }
            `}</style>
        </div>
    );
}
