'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { BellIcon, UserIcon, ChevronDownIcon, SearchIcon } from './icons';
import { useAuth } from '@/components/AuthProvider';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
    const pathname = usePathname();
    const { user, logout, activeRole, switchRole } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showUserMenu && !e.target.closest('.user-menu-container')) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showUserMenu]);

    // Parse available roles from user.role
    const availableRoles = user?.role ? user.role.split(',').map(r => r.trim()) : [];

    // Debug logging for roles
    useEffect(() => {
        if (user) {
            console.log('Header user role raw:', user.role);
            console.log('Header available roles:', availableRoles);
            console.log('Header active role:', activeRole);
        }
    }, [user, availableRoles, activeRole]);

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
                {mounted && user && (user.companyName || user.company) && (
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
                        <span style={{ color: 'var(--text-secondary)' }}>
                            {user.companyName || user.company?.name || 'Default Company'}
                        </span>
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

                {/* User Menu with Role Switcher */}
                {mounted && user && (
                    <div className="user-menu-container" style={{ position: 'relative' }}>
                        <div
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)',
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                background: showUserMenu ? 'rgba(37, 99, 235, 0.1)' : 'var(--surface-light)',
                                borderRadius: 'var(--radius-md)',
                                border: showUserMenu ? '1px solid var(--primary)' : '1px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                if (!showUserMenu) {
                                    e.currentTarget.style.background = 'var(--surface-hover)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!showUserMenu) {
                                    e.currentTarget.style.background = 'var(--surface-light)';
                                }
                            }}
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
                                    {activeRole || 'user'}
                                </span>
                            </div>
                            <ChevronDownIcon size={16} />
                        </div>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 8px)',
                                right: 0,
                                minWidth: '200px',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                padding: 'var(--spacing-sm)',
                                zIndex: 1000,
                            }}>
                                {/* Role Switcher Section */}
                                {availableRoles.length > 1 && (
                                    <>
                                        <div style={{
                                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                        }}>
                                            Switch Role
                                        </div>
                                        {availableRoles.map((role) => (
                                            <div
                                                key={role}
                                                onClick={() => {
                                                    switchRole(role);
                                                    setShowUserMenu(false);
                                                }}
                                                style={{
                                                    padding: 'var(--spacing-sm) var(--spacing-md)',
                                                    cursor: 'pointer',
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontSize: '0.875rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    background: activeRole?.toLowerCase() === role.toLowerCase() ? 'var(--primary)' : 'transparent',
                                                    color: activeRole?.toLowerCase() === role.toLowerCase() ? 'white' : 'var(--text-primary)',
                                                    fontWeight: activeRole?.toLowerCase() === role.toLowerCase() ? 600 : 400,
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (activeRole !== role) {
                                                        e.currentTarget.style.background = 'var(--surface-hover)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (activeRole !== role) {
                                                        e.currentTarget.style.background = 'transparent';
                                                    }
                                                }}
                                            >
                                                <span>{role}</span>
                                                {activeRole?.toLowerCase() === role.toLowerCase() && <span style={{ fontSize: '1rem' }}>✓</span>}
                                            </div>
                                        ))}
                                        <div style={{
                                            height: '1px',
                                            background: 'var(--border)',
                                            margin: 'var(--spacing-sm) 0',
                                        }}></div>
                                    </>
                                )}

                                {/* Logout Option */}
                                <div
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        logout();
                                    }}
                                    style={{
                                        padding: 'var(--spacing-sm) var(--spacing-md)',
                                        cursor: 'pointer',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.875rem',
                                        color: 'var(--error)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--surface-light)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    Logout
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
