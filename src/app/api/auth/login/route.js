export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import models, { initializeDatabase } from '@/models/sequelize/index.js';
import { getCompanyByEmail, addCompanyFilter } from '@/lib/multiCompany';

const { User } = models;

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: Authenticate user with email and password. Returns user information with company context.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: admin@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User password
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Missing credentials or invalid company
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingCredentials:
 *                 value:
 *                   success: false
 *                   error: Vui lòng nhập email và mật khẩu
 *               invalidCompany:
 *                 value:
 *                   success: false
 *                   error: Không thể xác định công ty từ email
 *       401:
 *         description: Unauthorized - Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Sai tài khoản hoặc mật khẩu
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST(request) {
    console.log('🔧 Login API invoked');

    try {
        // Get sequelize instance and setup associations (no sync)
        const { sequelize } = await import('@/models/sequelize/index.js');
        await sequelize.authenticate();
        console.log('✅ DB connected');

        const { email, password } = await request.json();
        console.log('📥 Received credentials:', { email, password: password ? '***' : null });

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Vui lòng nhập email và mật khẩu' },
                { status: 400 }
            );
        }

        // Get company information from email domain
        let companyContext;
        try {
            companyContext = await getCompanyByEmail(email);
            console.log('🏢 Company context:', companyContext);
        } catch (error) {
            console.error('❌ Error getting company:', error);
            return NextResponse.json(
                { success: false, error: 'Không thể xác định công ty từ email' },
                { status: 400 }
            );
        }

        // Build where clause with company filter
        const whereClause = {
            email: email.toLowerCase().trim(),
            ten_id: companyContext.ten_id,
            stg_id: companyContext.stg_id
        };

        console.log('🔍 Where clause:', whereClause);

        // Find user with Sequelize
        const user = await User.findOne({ where: whereClause });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Sai tài khoản hoặc mật khẩu' },
                { status: 401 }
            );
        }

        // Compare password using bcrypt
        const bcrypt = await import('bcrypt');
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return NextResponse.json(
                { success: false, error: 'Sai tài khoản hoặc mật khẩu' },
                { status: 401 }
            );
        }

        // Remove password from response and include company context
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
        const userWithoutPassword = {
            id: user.id,
            name: fullName,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            ten_id: user.ten_id,
            stg_id: user.stg_id,
            company: {
                name: companyContext.name,
                domain: companyContext.domain
            }
        };

        console.log('✅ Login successful for user:', userWithoutPassword.email);

        return NextResponse.json(
            { success: true, data: userWithoutPassword },
            { status: 200 }
        );
    } catch (error) {
        console.error('❗ Login API caught error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

