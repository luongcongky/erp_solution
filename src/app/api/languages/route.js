import { getLanguageService } from '@/lib/services/LanguageService';
import { extractTenantContext, extractPagination } from '@/lib/tenantContext';
import * as apiResponse from '@/lib/apiResponse';

/**
 * @swagger
 * /api/languages:
 *   get:
 *     tags:
 *       - Languages
 *     summary: Get all active languages
 *     description: Retrieve all active languages ordered by display order
 */
export async function GET(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('activeOnly') !== 'false'; // Default true

        const languageService = getLanguageService();
        const result = await languageService.getAllLanguages(tenantContext, { activeOnly });

        return apiResponse.success(result.data);
    } catch (error) {
        console.error('[API] /api/languages GET error:', error);
        return apiResponse.error(error);
    }
}

/**
 * @swagger
 * /api/languages:
 *   post:
 *     tags:
 *       - Languages
 *     summary: Create new language
 */
export async function POST(request) {
    try {
        const tenantContext = extractTenantContext(request);
        const body = await request.json();

        const languageService = getLanguageService();
        const newLanguage = await languageService.createLanguage(body, tenantContext);

        return apiResponse.created(newLanguage);
    } catch (error) {
        console.error('[API] /api/languages POST error:', error);
        return apiResponse.error(error);
    }
}
