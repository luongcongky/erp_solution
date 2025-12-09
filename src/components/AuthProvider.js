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

    const [activeRole, setActiveRole] = useState(null);

    // Initialize auth state
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (checkSession()) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);

                // Initialize active role
                if (parsedUser.role) {
                    const roles = parsedUser.role.split(',').map(r => r.trim());
                    // Prioritize admin role
                    const preferredRole = roles.find(r => r.toLowerCase() === 'admin') || roles[0];
                    console.log('Initial active role:', preferredRole, 'Current roles:', roles);
                    setActiveRole(preferredRole);
                } else {
                    setActiveRole('user');
                }

                updateActivity();

                // Fetch latest user profile to get roles
                if (parsedUser.id) {
                    const headers = {};
                    if (parsedUser.company || parsedUser.ten_id) {
                        headers['x-tenant-id'] = parsedUser.ten_id || parsedUser.company?.ten_id || '1000';
                        headers['x-stage-id'] = parsedUser.stg_id || parsedUser.company?.stg_id || 'DEV';
                    }

                    console.log('Fetching user profile with headers:', headers);

                    fetch(`/api/users/${parsedUser.id}`, {
                        headers,
                        cache: 'no-store'
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success && data.data) {
                                const updatedUser = { ...parsedUser, ...data.data };
                                // Ensure role is set correctly
                                if (data.data.role) {
                                    updatedUser.role = data.data.role;
                                    // Update active role if not set or if current active role is not in new roles
                                    const newRoles = data.data.role.split(',').map(r => r.trim());
                                    console.log('Fetched roles:', newRoles);
                                    setActiveRole(prev => {
                                        // Case-insensitive check if current role exists in new roles
                                        const prevExists = prev && newRoles.some(r => r.toLowerCase() === prev.toLowerCase());

                                        if (!prev || !prevExists) {
                                            const adminRole = newRoles.find(r => r.toLowerCase() === 'admin');
                                            console.log('Switching role to:', adminRole || newRoles[0]);
                                            return adminRole || newRoles[0];
                                        }
                                        return prev;
                                    });
                                }
                                setUser(updatedUser);
                                localStorage.setItem('user', JSON.stringify(updatedUser));
                            }
                        })
                        .catch(err => console.error('Failed to fetch user profile:', err));
                }
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
        // Exclude all API routes from authentication checks
        const isApiRoute = pathname.startsWith('/api/');

        if (!user && !isAuthPage && !isPublicPage && !isApiRoute) {
            router.push('/auth');
        } else if (user && isAuthPage) {
            router.push('/');
        }
    }, [user, loading, pathname, router]);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        updateActivity();
        setUser(userData);

        // Initialize active role on login
        if (userData.role) {
            const roles = userData.role.split(',').map(r => r.trim());
            // Prioritize admin role
            const preferredRole = roles.find(r => r.toLowerCase() === 'admin') || roles[0];
            setActiveRole(preferredRole);
        } else {
            setActiveRole('user');
        }

        router.push('/');
    };

    const switchRole = (newRole) => {
        setActiveRole(newRole);
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
        <AuthContext.Provider value={{ user, login, logout, loading, activeRole, switchRole }}>
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
