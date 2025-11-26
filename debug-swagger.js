import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Test',
            version: '1.0.0',
        },
    },
    apis: [
        './src/app/api/**/route.js',
        './src/app/api/**/*.js',
    ],
};

console.log('Current working directory:', process.cwd());
console.log('Options apis:', options.apis);

try {
    const spec = swaggerJsdoc(options);
    console.log('Paths found:', Object.keys(spec.paths).length);
    console.log('Paths:', Object.keys(spec.paths));
} catch (error) {
    console.error('Error:', error);
}
