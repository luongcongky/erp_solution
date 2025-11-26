'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import appConfig from '@/config/app.config';

const AuthContext = createContext();

// Session timeout from configuration
const SESSION_TIMEOUT = appConfig.session.timeoutMinutes * 60 * 1000;

export function AuthProvider({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('lastActivity');
        setUser(null);
        router.push('/auth');
    }, [router]);

    const checkSession = useCallback(() => {
        const lastActivity = localStorage.getItem('lastActivity');
        if (lastActivity) {
            const now = Date.now();
            if (now - parseInt(lastActivity) > SESSION_TIMEOUT) {
                logout();
                return false;
            }
        }
        return true;
    }, [logout]);

    const updateActivity = useCallback(() => {
        localStorage.setItem('lastActivity', Date.now().toString());
    }, []);

    // Initialize auth state
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (checkSession()) {
                setUser(JSON.parse(userData));
                updateActivity();
            }
        }
        setLoading(false);
    }, [checkSession, updateActivity]);

    // Handle activity monitoring
    useEffect(() => {
        if (!user) return;

        const events = ['mousedown', 'keydown', 'scroll', 'mousemove', 'click'];

        const handleActivity = () => {
            if (checkSession()) {
                updateActivity();
            }
        };

        // Throttle activity updates to avoid excessive localStorage writes
        let timeoutId;
        const throttledHandler = () => {
            if (!timeoutId) {
                timeoutId = setTimeout(() => {
                    handleActivity();
                    timeoutId = null;
                }, 1000);
            }
        };

        events.forEach(event => {
            window.addEventListener(event, throttledHandler);
        });

        // Check session periodically
        const intervalId = setInterval(() => {
            checkSession();
        }, 60000); // Check every minute

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, throttledHandler);
            });
            clearInterval(intervalId);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [user, checkSession, updateActivity]);

    // Handle redirects
    useEffect(() => {
        if (loading) return;

        const isAuthPage = pathname === '/auth';
        const isPublicPage = pathname === '/api-docs' || pathname.startsWith('/api-docs');

        if (!user && !isAuthPage && !isPublicPage) {
            router.push('/auth');
        } else if (user && isAuthPage) {
            router.push('/');
        }
    }, [user, loading, pathname, router]);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        updateActivity();
        setUser(userData);
        router.push('/');
    };

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--background)'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
