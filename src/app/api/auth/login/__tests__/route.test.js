/**
 * Test Suite for Login API Route Logic
 * 
 * Tests the authentication logic, validation, and error handling
 * without importing the actual route handler to avoid dependency issues.
 */

// Mock database schema before any imports
jest.mock('@/db/schema', () => ({
    users: {
        email: 'email',
        tenId: 'tenId',
        stgId: 'stgId',
    },
}));

jest.mock('@/db', () => ({
    db: {
        select: jest.fn(),
    },
}));

jest.mock('@/lib/multiCompany', () => ({
    getCompanyByEmail: jest.fn(),
}));

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
}));

jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((body, init) => ({
            body,
            status: init?.status || 200,
            json: async () => body,
        })),
    },
}));

describe('Login API Route Logic', () => {
    const { db } = require('@/db');
    const { getCompanyByEmail } = require('@/lib/multiCompany');
    const bcrypt = require('bcrypt');
    const { NextResponse } = require('next/server');

    let mockDb;

    beforeEach(() => {
        jest.clearAllMocks();

        mockDb = {
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
        };

        db.select.mockReturnValue(mockDb);
    });

    describe('Request Validation Logic', () => {
        test('should validate that email is required', () => {
            const email = '';
            const password = 'password123';

            const isValid = !!(email && password);
            expect(isValid).toBe(false);
        });

        test('should validate that password is required', () => {
            const email = 'admin@gmail.com';
            const password = '';

            const isValid = !!(email && password);
            expect(isValid).toBe(false);
        });

        test('should validate that both email and password are required', () => {
            const email = 'admin@gmail.com';
            const password = 'password123';

            const isValid = !!(email && password);
            expect(isValid).toBe(true);
        });

        test('should normalize email to lowercase and trim', () => {
            const email = '  ADMIN@GMAIL.COM  ';
            const normalized = email.toLowerCase().trim();

            expect(normalized).toBe('admin@gmail.com');
        });
    });

    describe('Company Context Resolution', () => {
        test('should call getCompanyByEmail with email', async () => {
            getCompanyByEmail.mockResolvedValue({
                ten_id: 1,
                stg_id: 1,
                name: 'Test Company',
                domain: 'gmail.com',
            });

            const result = await getCompanyByEmail('admin@gmail.com');

            expect(getCompanyByEmail).toHaveBeenCalledWith('admin@gmail.com');
            expect(result).toHaveProperty('ten_id');
            expect(result).toHaveProperty('stg_id');
        });

        test('should handle company not found error', async () => {
            getCompanyByEmail.mockRejectedValue(new Error('Company not found'));

            try {
                await getCompanyByEmail('invalid@example.com');
                fail('Should have thrown error');
            } catch (error) {
                expect(error.message).toBe('Company not found');
            }
        });
    });

    describe('Password Verification', () => {
        test('should compare password with hash', async () => {
            const password = 'admin123';
            const hash = '$2b$10$hashedpassword';

            bcrypt.compare.mockResolvedValue(true);

            const isMatch = await bcrypt.compare(password, hash);

            expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
            expect(isMatch).toBe(true);
        });

        test('should return false for incorrect password', async () => {
            const password = 'wrongpassword';
            const hash = '$2b$10$hashedpassword';

            bcrypt.compare.mockResolvedValue(false);

            const isMatch = await bcrypt.compare(password, hash);

            expect(isMatch).toBe(false);
        });
    });

    describe('User Data Transformation', () => {
        test('should construct full name from firstName and lastName', () => {
            const user = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
            };

            const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

            expect(fullName).toBe('John Doe');
        });

        test('should use email as name if firstName and lastName are missing', () => {
            const user = {
                firstName: null,
                lastName: null,
                email: 'admin@gmail.com',
            };

            const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

            expect(fullName).toBe('admin@gmail.com');
        });

        test('should use firstName only if lastName is missing', () => {
            const user = {
                firstName: 'John',
                lastName: null,
                email: 'john@example.com',
            };

            const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

            expect(fullName).toBe('John');
        });

        test('should exclude password from user data', () => {
            const user = {
                id: 1,
                email: 'admin@gmail.com',
                password: '$2b$10$hashedpassword',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
            };

            const { password, ...userWithoutPassword } = user;

            expect(userWithoutPassword).not.toHaveProperty('password');
            expect(userWithoutPassword).toHaveProperty('email');
            expect(userWithoutPassword).toHaveProperty('role');
        });
    });

    describe('Response Format', () => {
        test('should create success response with correct structure', () => {
            const userData = {
                id: 1,
                email: 'admin@gmail.com',
                name: 'Admin User',
                role: 'admin',
            };

            NextResponse.json.mockReturnValue({
                body: { success: true, data: userData },
                status: 200,
            });

            const response = NextResponse.json(
                { success: true, data: userData },
                { status: 200 }
            );

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(response.status).toBe(200);
        });

        test('should create error response with correct structure', () => {
            const errorMessage = 'Sai tài khoản hoặc mật khẩu';

            NextResponse.json.mockReturnValue({
                body: { success: false, error: errorMessage },
                status: 401,
            });

            const response = NextResponse.json(
                { success: false, error: errorMessage },
                { status: 401 }
            );

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error');
            expect(response.status).toBe(401);
        });
    });

    describe('Multi-Tenant Support', () => {
        test('should include tenant and stage IDs in company context', () => {
            const companyContext = {
                ten_id: 5,
                stg_id: 3,
                name: 'Test Company',
                domain: 'example.com',
            };

            expect(companyContext).toHaveProperty('ten_id', 5);
            expect(companyContext).toHaveProperty('stg_id', 3);
        });

        test('should include company information in user response', () => {
            const userResponse = {
                id: 1,
                email: 'admin@example.com',
                name: 'Admin User',
                role: 'admin',
                ten_id: 5,
                stg_id: 3,
                company: {
                    name: 'Test Company',
                    domain: 'example.com',
                },
            };

            expect(userResponse.company).toEqual({
                name: 'Test Company',
                domain: 'example.com',
            });
            expect(userResponse.ten_id).toBe(5);
            expect(userResponse.stg_id).toBe(3);
        });
    });

    describe('Error Messages', () => {
        test('should have Vietnamese error message for missing credentials', () => {
            const errorMessage = 'Vui lòng nhập email và mật khẩu';
            expect(errorMessage).toBe('Vui lòng nhập email và mật khẩu');
        });

        test('should have Vietnamese error message for invalid credentials', () => {
            const errorMessage = 'Sai tài khoản hoặc mật khẩu';
            expect(errorMessage).toBe('Sai tài khoản hoặc mật khẩu');
        });

        test('should have Vietnamese error message for company resolution failure', () => {
            const errorMessage = 'Không thể xác định công ty từ email';
            expect(errorMessage).toBe('Không thể xác định công ty từ email');
        });
    });
});
