'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useTranslations } from '@/hooks/useTranslations';

export default function AuthPage() {
    const { login } = useAuth();
    const { t, loading: loadingTranslations } = useTranslations();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || t('pages.auth.loginFailed', 'Login failed'));
            }

            // Use login from AuthProvider
            login(data.data);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loadingTranslations) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--background)',
            }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            background: 'var(--background)',
            padding: 'var(--spacing-lg)',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '450px',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-md)',
            }}>
                <div className="card" style={{
                    width: '100%',
                    padding: 'var(--spacing-2xl)',
                }}>

                    {/* Logo */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: 'var(--spacing-2xl)',
                    }}>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: 'var(--spacing-sm)',
                        }}>
                            ERP System
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            {t('pages.auth.subtitle', 'Enterprise Resource Planning')}
                        </p>
                    </div>

                    <h2 style={{
                        textAlign: 'center',
                        marginBottom: 'var(--spacing-xl)',
                        fontSize: '1.5rem',
                    }}>
                        {t('pages.auth.title', 'Đăng nhập hệ thống')}
                    </h2>

                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid var(--error)',
                            color: 'var(--error)',
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--spacing-lg)',
                            textAlign: 'center',
                            fontSize: '0.875rem',
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--spacing-lg)',
                    }}>
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: 'var(--spacing-sm)',
                                color: 'var(--text-secondary)',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                            }}>
                                {t('pages.auth.emailLabel', 'Email')}
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="input"
                                placeholder={t('pages.auth.emailPlaceholder', 'admin@gmail.com')}
                            />
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: 'var(--spacing-sm)',
                                color: 'var(--text-secondary)',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                            }}>
                                {t('pages.auth.passwordLabel', 'Mật khẩu')}
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="input"
                                placeholder={t('pages.auth.passwordPlaceholder', '••••••••')}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{
                                marginTop: 'var(--spacing-md)',
                                opacity: loading ? 0.7 : 1,
                                width: '100%',
                            }}
                        >
                            {loading ? t('pages.auth.loggingIn', 'Đang đăng nhập...') : t('pages.auth.loginButton', 'Đăng nhập')}
                        </button>
                    </form>

                    <div style={{
                        marginTop: 'var(--spacing-xl)',
                        padding: 'var(--spacing-md)',
                        background: 'var(--surface-light)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                    }}>
                        <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-xs)', color: 'var(--text-secondary)' }}>
                            {t('pages.auth.demoAccount', 'Tài khoản demo:')}
                        </div>
                        <div>{t('pages.auth.demoEmail', 'Email: admin@gmail.com')}</div>
                        <div>{t('pages.auth.demoPassword', 'Password: admin123')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
