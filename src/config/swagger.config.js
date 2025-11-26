/**
 * Swagger/OpenAPI Configuration
 * Base specification for API documentation
 */

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'ERP System API Documentation',
        version: '1.0.0',
        description: 'Comprehensive API documentation for the ERP System. This includes endpoints for authentication, user management, roles, permissions, menus, languages, translations, and more.',
        contact: {
            name: 'API Support',
            email: 'support@erp-system.com',
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT',
        },
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Development server',
        },
        {
            url: 'https://api.erp-system.com',
            description: 'Production server',
        },
    ],
    tags: [
        {
            name: 'Authentication',
            description: 'User authentication and authorization endpoints',
        },
        {
            name: 'Roles',
            description: 'Role management endpoints',
        },
        {
            name: 'Permissions',
            description: 'Permission management endpoints',
        },
        {
            name: 'Menus',
            description: 'Menu configuration endpoints',
        },
        {
            name: 'Languages',
            description: 'Language management endpoints',
        },
        {
            name: 'Translations',
            description: 'UI translation management endpoints',
        },
        {
            name: 'Partners',
            description: 'Partner/customer management endpoints',
        },
        {
            name: 'Projects',
            description: 'Project management endpoints',
        },
        {
            name: 'HR',
            description: 'Human resources management endpoints',
        },
        {
            name: 'Sales',
            description: 'Sales management endpoints',
        },
        {
            name: 'Purchase',
            description: 'Purchase order management endpoints',
        },
        {
            name: 'Inventory',
            description: 'Inventory and stock management endpoints',
        },
        {
            name: 'Manufacturing',
            description: 'Manufacturing and work order endpoints',
        },
        {
            name: 'Accounting',
            description: 'Accounting and invoice endpoints',
        },
        {
            name: 'System',
            description: 'System level endpoints',
        },
        {
            name: 'Menus (Admin)',
            description: 'Admin menu management',
        },
    ],
    components: {
        schemas: {
            // Common response schemas
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: false,
                    },
                    error: {
                        type: 'string',
                        description: 'Error message',
                        example: 'An error occurred',
                    },
                    message: {
                        type: 'string',
                        description: 'Detailed error message',
                        example: 'Database connection failed',
                    },
                },
            },
            SuccessResponse: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: true,
                    },
                    data: {
                        type: 'object',
                        description: 'Response data',
                    },
                },
            },
            // Tenant context
            TenantContext: {
                type: 'object',
                properties: {
                    ten_id: {
                        type: 'string',
                        description: 'Tenant ID',
                        example: '1000',
                    },
                    stg_id: {
                        type: 'string',
                        description: 'Stage ID',
                        example: 'DEV',
                    },
                },
            },
            // User schema
            User: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                        description: 'User ID',
                        example: 1,
                    },
                    name: {
                        type: 'string',
                        description: 'Full name',
                        example: 'John Doe',
                    },
                    firstName: {
                        type: 'string',
                        description: 'First name',
                        example: 'John',
                    },
                    lastName: {
                        type: 'string',
                        description: 'Last name',
                        example: 'Doe',
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        description: 'Email address',
                        example: 'admin@gmail.com',
                    },
                    role: {
                        type: 'string',
                        description: 'User role',
                        example: 'Admin',
                    },
                    ten_id: {
                        type: 'string',
                        example: '1000',
                    },
                    stg_id: {
                        type: 'string',
                        example: 'DEV',
                    },
                    company: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                example: 'Default Company',
                            },
                            domain: {
                                type: 'string',
                                example: 'gmail.com',
                            },
                        },
                    },
                },
            },
            // Role schema
            Role: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                        description: 'Role ID',
                        example: 1,
                    },
                    name: {
                        type: 'string',
                        description: 'Role name',
                        example: 'Admin',
                    },
                    description: {
                        type: 'string',
                        description: 'Role description',
                        example: 'Administrator with full access',
                    },
                    ten_id: {
                        type: 'string',
                        example: '1000',
                    },
                    stg_id: {
                        type: 'string',
                        example: 'DEV',
                    },
                    usersCount: {
                        type: 'integer',
                        description: 'Number of users with this role',
                        example: 5,
                    },
                },
            },
            // Language schema
            Language: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                        example: 1,
                    },
                    code: {
                        type: 'string',
                        description: 'Language code (ISO 639-1)',
                        example: 'en',
                    },
                    name: {
                        type: 'string',
                        description: 'Language name in English',
                        example: 'English',
                    },
                    nativeName: {
                        type: 'string',
                        description: 'Language name in native language',
                        example: 'English',
                    },
                    flagEmoji: {
                        type: 'string',
                        description: 'Flag emoji',
                        example: '🇺🇸',
                    },
                    isActive: {
                        type: 'boolean',
                        description: 'Whether the language is active',
                        example: true,
                    },
                    ten_id: {
                        type: 'string',
                        example: '1000',
                    },
                    stg_id: {
                        type: 'string',
                        example: 'DEV',
                    },
                },
            },
            // Menu schema
            Menu: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                        example: 1,
                    },
                    name: {
                        type: 'string',
                        example: 'Dashboard',
                    },
                    path: {
                        type: 'string',
                        example: '/dashboard',
                    },
                    icon: {
                        type: 'string',
                        example: 'HomeIcon',
                    },
                    parentId: {
                        type: 'integer',
                        nullable: true,
                        example: null,
                    },
                    order: {
                        type: 'integer',
                        example: 1,
                    },
                    isActive: {
                        type: 'boolean',
                        example: true,
                    },
                    ten_id: {
                        type: 'string',
                        example: '1000',
                    },
                    stg_id: {
                        type: 'string',
                        example: 'DEV',
                    },
                },
            },
        },
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter your JWT token',
            },
        },
    },
};

export default swaggerDefinition;
