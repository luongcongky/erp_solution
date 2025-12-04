/**
 * Integration Test Suite for Login Flow
 * 
 * Tests the complete end-to-end login workflow including
 * AuthProvider integration, session management, and redirects.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import AuthPage from '../page';
import { useTranslations } from '@/hooks/useTranslations';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    usePathname: jest.fn(),
}));

// Mock useTranslations
jest.mock('@/hooks/useTranslations', () => ({
    useTranslations: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Test component that uses AuthProvider
function TestComponent() {
    const { user, login, logout } = useAuth();

    return (
        <div>
            <div data-testid="user-status">
                {user ? `Logged in as ${user.email}` : 'Not logged in'}
            </div>
            <button onClick={() => login({ email: 'test@example.com', name: 'Test User' })}>
                Login
            </button>
            <button onClick={logout}>Logout</button>
        </div>
    );
}

describe('Login Integration Tests', () => {
    let mockRouter;
    let mockT;

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();

        mockRouter = { push: jest.fn() };
        mockT = jest.fn((key, defaultValue) => defaultValue || key);

        useRouter.mockReturnValue(mockRouter);
        usePathname.mockReturnValue('/auth');
        useTranslations.mockReturnValue({ t: mockT, loading: false });

        global.fetch.mockClear();
    });

    afterEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

    describe('Complete Login Flow', () => {
        test('should complete full login workflow from form submission to redirect', async () => {
            const mockUserData = {
                id: 1,
                email: 'admin@gmail.com',
                name: 'Admin User',
                role: 'admin',
                ten_id: 1,
                stg_id: 1,
                company: {
                    name: 'Test Company',
                    domain: 'gmail.com'
                }
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: mockUserData }),
            });

            render(
                <AuthProvider>
                    <AuthPage />
                </AuthProvider>
            );

            // Fill in login form
            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Mật khẩu');
            const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

            fireEvent.change(emailInput, { target: { value: 'admin@gmail.com' } });
            fireEvent.change(passwordInput, { target: { value: 'admin123' } });
            fireEvent.click(submitButton);

            // Wait for API call
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: 'admin@gmail.com',
                        password: 'admin123',
                    }),
                });
            });

            // Verify user data is stored in localStorage
            await waitFor(() => {
                const storedUser = localStorage.getItem('user');
                expect(storedUser).toBeTruthy();
                expect(JSON.parse(storedUser)).toEqual(mockUserData);
            });

            // Verify redirect to home page
            await waitFor(() => {
                expect(mockRouter.push).toHaveBeenCalledWith('/');
            });
        });

        test('should handle failed login and remain on auth page', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ success: false, error: 'Sai tài khoản hoặc mật khẩu' }),
            });

            render(
                <AuthProvider>
                    <AuthPage />
                </AuthProvider>
            );

            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Mật khẩu');
            const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

            fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
            fireEvent.click(submitButton);

            // Wait for error message
            await waitFor(() => {
                expect(screen.getByText('Sai tài khoản hoặc mật khẩu')).toBeInTheDocument();
            });

            // Verify no redirect occurred
            expect(mockRouter.push).not.toHaveBeenCalledWith('/');

            // Verify localStorage is empty
            expect(localStorage.getItem('user')).toBeNull();
        });
    });

    describe('Session Management', () => {
        test('should store user data in localStorage on successful login', async () => {
            const mockUserData = {
                id: 1,
                email: 'admin@gmail.com',
                name: 'Admin User',
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: mockUserData }),
            });

            render(
                <AuthProvider>
                    <AuthPage />
                </AuthProvider>
            );

            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Mật khẩu');
            const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

            fireEvent.change(emailInput, { target: { value: 'admin@gmail.com' } });
            fireEvent.change(passwordInput, { target: { value: 'admin123' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                const storedUser = localStorage.getItem('user');
                expect(storedUser).toBeTruthy();
                expect(JSON.parse(storedUser)).toEqual(mockUserData);
            });
        });

        test('should store lastActivity timestamp on login', async () => {
            const mockUserData = {
                id: 1,
                email: 'admin@gmail.com',
                name: 'Admin User',
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: mockUserData }),
            });

            const beforeLogin = Date.now();

            render(
                <AuthProvider>
                    <AuthPage />
                </AuthProvider>
            );

            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Mật khẩu');
            const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

            fireEvent.change(emailInput, { target: { value: 'admin@gmail.com' } });
            fireEvent.change(passwordInput, { target: { value: 'admin123' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                const lastActivity = localStorage.getItem('lastActivity');
                expect(lastActivity).toBeTruthy();
                const timestamp = parseInt(lastActivity);
                expect(timestamp).toBeGreaterThanOrEqual(beforeLogin);
                expect(timestamp).toBeLessThanOrEqual(Date.now());
            });
        });

        test('should clear localStorage on logout', async () => {
            // Set up initial logged-in state
            const mockUserData = {
                id: 1,
                email: 'admin@gmail.com',
                name: 'Admin User',
            };

            localStorage.setItem('user', JSON.stringify(mockUserData));
            localStorage.setItem('lastActivity', Date.now().toString());

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            // Verify user is logged in
            expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as admin@gmail.com');

            // Logout
            const logoutButton = screen.getByText('Logout');
            fireEvent.click(logoutButton);

            // Verify localStorage is cleared
            await waitFor(() => {
                expect(localStorage.getItem('user')).toBeNull();
                expect(localStorage.getItem('lastActivity')).toBeNull();
            });

            // Verify redirect to auth page
            expect(mockRouter.push).toHaveBeenCalledWith('/auth');
        });
    });

    describe('AuthProvider Integration', () => {
        test('should provide user context after login', async () => {
            const mockUserData = {
                id: 1,
                email: 'admin@gmail.com',
                name: 'Admin User',
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: mockUserData }),
            });

            render(
                <AuthProvider>
                    <AuthPage />
                </AuthProvider>
            );

            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Mật khẩu');
            const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

            fireEvent.change(emailInput, { target: { value: 'admin@gmail.com' } });
            fireEvent.change(passwordInput, { target: { value: 'admin123' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockRouter.push).toHaveBeenCalledWith('/');
            });
        });

        test('should restore user session from localStorage on mount', () => {
            const mockUserData = {
                id: 1,
                email: 'admin@gmail.com',
                name: 'Admin User',
            };

            localStorage.setItem('user', JSON.stringify(mockUserData));
            localStorage.setItem('lastActivity', Date.now().toString());

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as admin@gmail.com');
        });

        test('should not restore session if lastActivity is too old', () => {
            const mockUserData = {
                id: 1,
                email: 'admin@gmail.com',
                name: 'Admin User',
            };

            localStorage.setItem('user', JSON.stringify(mockUserData));
            // Set lastActivity to 2 hours ago (assuming 30 min timeout)
            localStorage.setItem('lastActivity', (Date.now() - 2 * 60 * 60 * 1000).toString());

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            // Should be logged out due to session timeout
            waitFor(() => {
                expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
            });
        });
    });

    describe('Redirect Behavior', () => {
        test('should redirect to home page after successful login', async () => {
            const mockUserData = {
                id: 1,
                email: 'admin@gmail.com',
                name: 'Admin User',
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: mockUserData }),
            });

            render(
                <AuthProvider>
                    <AuthPage />
                </AuthProvider>
            );

            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Mật khẩu');
            const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

            fireEvent.change(emailInput, { target: { value: 'admin@gmail.com' } });
            fireEvent.change(passwordInput, { target: { value: 'admin123' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockRouter.push).toHaveBeenCalledWith('/');
            });
        });

        test('should redirect logged-in user away from auth page', () => {
            const mockUserData = {
                id: 1,
                email: 'admin@gmail.com',
                name: 'Admin User',
            };

            localStorage.setItem('user', JSON.stringify(mockUserData));
            localStorage.setItem('lastActivity', Date.now().toString());

            // User is on auth page but already logged in
            usePathname.mockReturnValue('/auth');

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            // Should redirect to home
            waitFor(() => {
                expect(mockRouter.push).toHaveBeenCalledWith('/');
            });
        });

        test('should redirect non-authenticated user to auth page', () => {
            // User is on protected page but not logged in
            usePathname.mockReturnValue('/dashboard');

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            // Should redirect to auth
            waitFor(() => {
                expect(mockRouter.push).toHaveBeenCalledWith('/auth');
            });
        });
    });

    describe('Error Scenarios', () => {
        test('should handle network errors gracefully', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network request failed'));

            render(
                <AuthProvider>
                    <AuthPage />
                </AuthProvider>
            );

            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Mật khẩu');
            const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

            fireEvent.change(emailInput, { target: { value: 'admin@gmail.com' } });
            fireEvent.change(passwordInput, { target: { value: 'admin123' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Network request failed')).toBeInTheDocument();
            });

            // Should not redirect
            expect(mockRouter.push).not.toHaveBeenCalledWith('/');
        });

        test('should handle malformed API response', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => { throw new Error('Invalid JSON'); },
            });

            render(
                <AuthProvider>
                    <AuthPage />
                </AuthProvider>
            );

            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Mật khẩu');
            const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

            fireEvent.change(emailInput, { target: { value: 'admin@gmail.com' } });
            fireEvent.change(passwordInput, { target: { value: 'admin123' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Invalid JSON')).toBeInTheDocument();
            });
        });
    });
});
