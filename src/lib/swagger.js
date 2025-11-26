import swaggerJsdoc from 'swagger-jsdoc';
import swaggerDefinition from '@/config/swagger.config.js';

/**
 * Swagger JSDoc configuration options
 */
const options = {
    definition: swaggerDefinition,
    // Path to the API routes
    apis: [
        './src/app/api/**/route.js',
        './src/app/api/**/*.js',
    ],
};

/**
 * Generate OpenAPI specification
 */
/**
 * Get Swagger specification as JSON
 */
export function getSwaggerSpec() {
    return swaggerJsdoc(options);
}
