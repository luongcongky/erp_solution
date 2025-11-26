'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { BellIcon, UserIcon, ChevronDownIcon, SearchIcon } from './icons';
import { useAuth } from '@/components/AuthProvider';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    // Don't show header on auth page
    if (pathname === '/auth') {
        return null;
    }

    return (
        <header style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 'var(--header-height)',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--spacing-xl)',
            zIndex: 50,
        }}>
            {/* Logo and Company */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)' }}>
                <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em',
                }}>
                    ERP System
                </div>

                {/* Company Selector */}
                {mounted && user && user.company && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        background: 'var(--surface-light)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                    }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{user.company.name}</span>
                        <ChevronDownIcon size={16} />
                    </div>
                )}
            </div>

            {/* Search Bar */}
            <div className="searchInputWrapper" style={{
                position: 'relative',
                width: '400px',
                flex: 'none',
            }}>
                <span className="searchIcon" style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748B',
                    pointerEvents: 'none',
                    height: '18px',
                    width: '18px',
                }}>
                    <SearchIcon size={18} />
                </span>
                <input
                    type="text"
                    className="searchInput"
                    placeholder="Search..."
                    style={{
                        width: '100%',
                        padding: '10px 12px 10px 40px',
                        borderRadius: '8px',
                        border: '1px solid #334155',
                        fontSize: '0.875rem',
                        outline: 'none',
                        background: '#0F172A',
                        color: '#E2E8F0',
                    }}
                />
            </div>


            {/* Right Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                {/* Language Switcher */}
                <LanguageSwitcher variant="dropdown" />

                {/* Notifications */}
                <button style={{
                    position: 'relative',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: 'var(--spacing-sm)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all 0.2s ease',
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--surface-light)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                    }}>
                    <BellIcon size={20} />
                    <span style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '8px',
                        height: '8px',
                        background: 'var(--error)',
                        borderRadius: '50%',
                    }}></span>
                </button>

                {/* User Menu */}
                {mounted && user && (
                    <div
                        onClick={logout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            background: 'var(--surface-light)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                        }}
                        title="Logout"
                    >
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                        }}>
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                {user.name}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {user.role}
                            </span>
                        </div>
                        <ChevronDownIcon size={16} />
                    </div>
                )}
            </div>
        </header>
    );
}
