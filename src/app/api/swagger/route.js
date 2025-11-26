import { NextResponse } from 'next/server';
import { getSwaggerSpec } from '@/lib/swagger.js';

/**
 * GET /api/swagger
 * Returns the OpenAPI specification
 */
export async function GET() {
    try {
        const spec = getSwaggerSpec();
        return NextResponse.json(spec);
    } catch (error) {
        console.error('Error generating Swagger spec:', error);
        return NextResponse.json(
            { error: 'Failed to generate API specification' },
            { status: 500 }
        );
    }
}
