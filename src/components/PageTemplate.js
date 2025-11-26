'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * Base Page Template Component
 * Reusable template for all module pages
 */
export default function PageTemplate({
    children,
    actions,
    filters,
    breadcrumbs,
}) {
    return (
        <div style={{ padding: 'var(--spacing-xl)', maxWidth: '1600px', margin: '0 auto' }}>
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <div style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {breadcrumbs.map((crumb, index) => (
                        <span key={index}>
                            {crumb.href ? (
                                <Link href={crumb.href} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span>{crumb.label}</span>
                            )}
                            {index < breadcrumbs.length - 1 && <span style={{ margin: '0 var(--spacing-xs)' }}>/</span>}
                        </span>
                    ))}
                </div>
            )}

            {/* Filters */}
            {filters && (
                <div style={{
                    marginBottom: 'var(--spacing-lg)',
                    padding: 'var(--spacing-md)',
                    background: 'var(--surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                }}>
                    {filters}
                </div>
            )}

            {/* Actions - New Position (between filters and content) */}
            {actions && (
                <div style={{
                    marginBottom: 'var(--spacing-lg)',
                    display: 'flex',
                    gap: 'var(--spacing-md)',
                    justifyContent: 'flex-end',
                }}>
                    {actions}
                </div>
            )}

            {/* Page Content */}
            <div>
                {children}
            </div>
        </div>
    );
}

/**
 * Coming Soon Component
 */
export function ComingSoon({ moduleName }) {
    return (
        <div className="card" style={{ padding: 'var(--spacing-3xl)', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)' }}>🚧</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
                Đang phát triển
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-lg)' }}>
                Module <strong>{moduleName}</strong> đang được phát triển và sẽ sớm ra mắt.
            </p>
            <Link href="/dashboard" className="btn btn-primary">
                ← Quay lại Dashboard
            </Link>
        </div>
    );
}
