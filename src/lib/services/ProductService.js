/**
 * Product Service (Inventory Items)
 * Business logic layer for product management
 */

import { BaseService } from './BaseService.js';
import { getProductRepository } from '../repositories/ProductRepository.js';
import { ValidationError, ConflictError } from '@/lib/errors.js';
import { validateRequired } from '@/lib/validators.js';

export class ProductService extends BaseService {
    constructor() {
        const productRepository = getProductRepository();
        super(productRepository);
        this.productRepository = productRepository;
    }

    /**
     * Get all products with pagination
     */
    async getAllProducts(tenantContext, options = {}) {
        try {
            const { limit = 100, offset = 0, filters = {}, orderBy = null } = options;

            const [data, total] = await Promise.all([
                this.productRepository.findAll(filters, tenantContext, { limit, offset, orderBy }),
                this.productRepository.count(filters, tenantContext)
            ]);

            return {
                data,
                pagination: {
                    total,
                    limit,
                    offset,
                    page: Math.floor(offset / limit) + 1,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            this.log('error', 'Failed to get all products', error);
            throw error;
        }
    }

    /**
     * Search products
     */
    async searchProducts(searchTerm, tenantContext, options = {}) {
        try {
            const data = await this.productRepository.search(searchTerm, tenantContext, options);
            return { data };
        } catch (error) {
            this.log('error', 'Failed to search products', error);
            throw error;
        }
    }

    /**
     * Get product by ID
     */
    async getProductById(id, tenantContext) {
        try {
            return await this.productRepository.findById(id, tenantContext);
        } catch (error) {
            this.log('error', `Failed to get product ${id}`, error);
            throw error;
        }
    }

    /**
     * Create new product
     */
    async createProduct(productData, tenantContext) {
        try {
            const { sku, name, itemType, baseUom, tracking, minStock, maxStock } = productData;

            // Validation
            validateRequired(['sku', 'name'], productData);

            // Check if SKU already exists
            const skuExists = await this.productRepository.skuExists(sku, tenantContext);
            if (skuExists) {
                throw new ConflictError('Product SKU already exists');
            }

            // Create product
            const newProduct = await this.productRepository.create(
                {
                    sku,
                    name,
                    description: productData.description || null,
                    itemType: itemType || 'finished',
                    baseUom: baseUom || 'pcs',
                    tracking: tracking || 'none',
                    expiryControl: productData.expiryControl || false,
                    minStock: minStock || '0',
                    maxStock: maxStock || '0',
                    isActive: productData.isActive !== undefined ? productData.isActive : true,
                    attributes: productData.attributes || {}
                },
                tenantContext
            );

            this.log('info', `Product created: ${newProduct.sku}`);
            return newProduct;
        } catch (error) {
            this.log('error', 'Failed to create product', error);
            throw error;
        }
    }

    /**
     * Update product
     */
    async updateProduct(id, productData, tenantContext) {
        try {
            // Check if product exists
            await this.productRepository.findById(id, tenantContext);

            // Validate SKU if provided
            if (productData.sku) {
                const skuExists = await this.productRepository.skuExists(
                    productData.sku,
                    tenantContext,
                    id
                );
                if (skuExists) {
                    throw new ConflictError('Product SKU already exists');
                }
            }

            // Update product
            const updatedProduct = await this.productRepository.update(id, productData, tenantContext);

            this.log('info', `Product updated: ${id}`);
            return updatedProduct;
        } catch (error) {
            this.log('error', `Failed to update product ${id}`, error);
            throw error;
        }
    }

    /**
     * Delete product
     */
    async deleteProduct(id, tenantContext) {
        try {
            // Check if product exists
            await this.productRepository.findById(id, tenantContext);

            // TODO: Check if product has stock or transactions before deleting

            // Delete product
            await this.productRepository.delete(id, tenantContext);

            this.log('info', `Product deleted: ${id}`);
            return true;
        } catch (error) {
            this.log('error', `Failed to delete product ${id}`, error);
            throw error;
        }
    }

    /**
     * Get low stock products
     */
    async getLowStockProducts(tenantContext, options = {}) {
        try {
            const data = await this.productRepository.findLowStock(tenantContext, options);
            return { data };
        } catch (error) {
            this.log('error', 'Failed to get low stock products', error);
            throw error;
        }
    }
}

// Export singleton instance
let productServiceInstance = null;

export function getProductService() {
    if (!productServiceInstance) {
        productServiceInstance = new ProductService();
    }
    return productServiceInstance;
}

export default ProductService;
