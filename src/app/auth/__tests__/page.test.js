/**
 * Test Suite for Login Page UI Component
 * 
 * Tests the login page rendering, user interactions, form validation,
 * error handling, and integration with AuthProvider and translations.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import AuthPage from '../page';
import { useAuth } from '@/components/AuthProvider';
import { useTranslations } from '@/hooks/useTranslations';

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock AuthProvider
jest.mock('@/components/AuthProvider', () => ({
    useAuth: jest.fn(),
}));

// Mock useTranslations hook
jest.mock('@/hooks/useTranslations', () => ({
    useTranslations: jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn();

describe('Login Page UI Component', () => {
    let mockLogin;
    let mockRouter;
    let mockT;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup mock functions
        mockLogin = jest.fn();
        mockRouter = { push: jest.fn() };
        mockT = jest.fn((key, defaultValue) => defaultValue || key);

        // Setup mock implementations
        useAuth.mockReturnValue({ login: mockLogin });
        useRouter.mockReturnValue(mockRouter);
        useTranslations.mockReturnValue({
            t: mockT,
            loading: false
        });

        // Reset fetch mock
        global.fetch.mockClear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Component Rendering', () => {
        test('should render login form with all elements', () => {
            render(<AuthPage />);

            // Check for main heading
            expect(screen.getByText('Đăng nhập hệ thống')).toBeInTheDocument();

            // Check for form inputs
            expect(screen.getByLabelText('Email')).toBeInTheDocument();
            expect(screen.getByLabelText('Mật khẩu')).toBeInTheDocument();

            // Check for submit button
            expect(screen.getByRole('button', { name: /đăng nhập/i })).toBeInTheDocument();

            // Check for demo account info
            expect(screen.getByText('Tài khoản demo:')).toBeInTheDocument();
            expect(screen.getByText('Email: admin@gmail.com')).toBeInTheDocument();
            expect(screen.getByText('Password: admin123')).toBeInTheDocument();
        });

        test('should render logo and subtitle', () => {
            render(<AuthPage />);

            expect(screen.getByText('ERP System')).toBeInTheDocument();
            expect(screen.getByText('Enterprise Resource Planning')).toBeInTheDocument();
        });

        test('should render email input with correct attributes', () => {
            render(<AuthPage />);

            const emailInput = screen.getByLabelText('Email');
            expect(emailInput).toHaveAttribute('type', 'email');
            expect(emailInput).toHaveAttribute('placeholder', 'admin@gmail.com');
            expect(emailInput).toBeRequired();
        });

        test('should render password input with correct attributes', () => {
            render(<AuthPage />);

            const passwordInput = screen.getByLabelText('Mật khẩu');
            expect(passwordInput).toHaveAttribute('type', 'password');
            expect(passwordInput).toHaveAttribute('placeholder', '••••••••');
            expect(passwordInput).toBeRequired();
        });

        test('should show loading spinner when translations are loading', () => {
            useTranslations.mockReturnValue({
                t: mockT,
                loading: true
            });

            const { container } = render(<AuthPage />);
            expect(container.querySelector('.spinner')).toBeInTheDocument();
        });
    });

    describe('Form Interactions', () => {
        test('should update email input value on change', () => {
            render(<AuthPage />);

            const emailInput = screen.getByLabelText('Email');
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

            expect(emailInput.value).toBe('test@example.com');
        });

        test('should update password input value on change', () => {
            render(<AuthPage />);

            const passwordInput = screen.getByLabelText('Mật khẩu');
            fireEvent.change(passwordInput, { target: { value: 'password123' } });

            expect(passwordInput.value).toBe('password123');
        });

        test('should not submit form with empty fields due to HTML5 validation', () => {
            render(<AuthPage />);

            const submitButton = screen.getByRole('button', { name: /đăng nhập/i });
            fireEvent.click(submitButton);

            // Fetch should not be called if HTML5 validation prevents submission
            expect(global.fetch).not.toHaveBeenCalled();
        });
    });

    describe('Successful Login Flow', () => {
        test('should call login API with correct credentials', async () => {
            const mockResponse = {
                success: true,
                data: {
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
                }
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            render(<AuthPage />);

            // Fill in the form
            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Mật khẩu');
            const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

            fireEvent.change(emailInput, { target: { value: 'admin@gmail.com' } });
            fireEvent.change(passwordInput, { target: { value: 'admin123' } });
            fireEvent.click(submitButton);

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
        });

        test('should call AuthProvider login on successful authentication', async () => {
            const mockUserData = {
                id: 1,
                email: 'admin@gmail.com',
                name: 'Admin User',
                role: 'admin',
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: mockUserData }),
            });

            render(<AuthPage />);

            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Mật khẩu');
            const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

            fireEvent.change(emailInput, { target: { value: 'admin@gmail.com' } });
            fireEvent.change(passwordInput, { target: { value: 'admin123' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith(mockUserData);
            });
        });

        test('should show loading state during login', async () => {
            global.fetch.mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve({
                    ok: true,
                    json: async () => ({ success: true, data: {} }),
                }), 100))
            );

            render(<AuthPage />);

            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Mật khẩu');
            const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

            fireEvent.change(emailInput, { target: { value: 'admin@gmail.com' } });
            fireEvent.change(passwordInput, { target: { value: 'admin123' } });
            fireEvent.click(submitButton);

            // Check loading state
            await waitFor(() => {
                expect(screen.getByText('Đang đăng nhập...')).toBeInTheDocument();
            });
        });

        test('should disable submit button during login', async () => {
            global.fetch.mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve({
                    ok: true,
                    json: async () => ({ success: true, data: {} }),
                }), 100))
            );

            render(<AuthPage />);

            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Mật khẩu');
            const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

            fireEvent.change(emailInput, { target: { value: 'admin@gmail.com' } });
            fireEvent.change(passwordInput, { target: { value: 'admin123' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(submitButton).toBeDisabled();
            });
        });
    });

    describe('Error Handling', () => {
        test('should display error message on failed login', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ success: false, error: 'Sai tài khoản hoặc mật khẩu' }),
            });

            render(<AuthPage />);

            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Mật khẩu');
            const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

            fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Sai tài khoản hoặc mật khẩu')).toBeInTheDocument();
            });
        });

        test('should display network error message', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));

            render(<AuthPage />);

            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Mật khẩu');
            const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

            fireEvent.change(emailInput, { target: { value: 'admin@gmail.com' } });
            fireEvent.change(passwordInput, { target: { value: 'admin123' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Network error')).toBeInTheDocument();
            });
        });

        test('should clear error message on new submission', async () => {
            // First submission - error
            global.fetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ success: false, error: 'Sai tài khoản hoặc mật khẩu' }),
            });

            render(<AuthPage />);

            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Mật khẩu');
            const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

            fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
            fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Sai tài khoản hoặc mật khẩu')).toBeInTheDocument();
            });

            // Second submission - should clear error
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: {} }),
            });

            fireEvent.change(emailInput, { target: { value: 'admin@gmail.com' } });
            fireEvent.change(passwordInput, { target: { value: 'admin123' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.queryByText('Sai tài khoản hoặc mật khẩu')).not.toBeInTheDocument();
            });
        });

        test('should re-enable submit button after error', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ success: false, error: 'Login failed' }),
            });

            render(<AuthPage />);

            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Mật khẩu');
            const submitButton = screen.getByRole('button', { name: /đăng nhập/i });

            fireEvent.change(emailInput, { target: { value: 'admin@gmail.com' } });
            fireEvent.change(passwordInput, { target: { value: 'admin123' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(submitButton).not.toBeDisabled();
            });
        });
    });

    describe('Translation Integration', () => {
        test('should use translations for all text content', () => {
            const customT = jest.fn((key, defaultValue) => {
                const translations = {
                    'pages.auth.title': 'Login to System',
                    'pages.auth.subtitle': 'ERP Solution',
                    'pages.auth.emailLabel': 'Email Address',
                    'pages.auth.passwordLabel': 'Password',
                    'pages.auth.loginButton': 'Sign In',
                    'pages.auth.demoAccount': 'Demo Account:',
                };
                return translations[key] || defaultValue;
            });

            useTranslations.mockReturnValue({
                t: customT,
                loading: false
            });

            render(<AuthPage />);

            expect(customT).toHaveBeenCalledWith('pages.auth.title', 'Đăng nhập hệ thống');
            expect(customT).toHaveBeenCalledWith('pages.auth.subtitle', 'Enterprise Resource Planning');
            expect(customT).toHaveBeenCalledWith('pages.auth.emailLabel', 'Email');
            expect(customT).toHaveBeenCalledWith('pages.auth.passwordLabel', 'Mật khẩu');
        });
    });
});
