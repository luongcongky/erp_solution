'use client';

import PageTemplate from '@/components/PageTemplate';
import DataTable from '@/components/DataTable';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { SearchIcon } from '@/components/icons';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [filters, setFilters] = useState({
        category: 'all',
        status: 'all',
        search: ''
    });
    const { t, loading: loadingTranslations } = useTranslations();

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        filterData();
    }, [products, filters]);

    const fetchProducts = async () => {
        // Simulate API call
        setTimeout(() => {
            const mockProducts = [
                { id: 1, sku: 'PROD-001', name: 'Laptop Dell XPS 15', category: 'electronics', unitPrice: 1299, stockQty: 45, reorderLevel: 10, status: 'active', supplier: 'Tech Supplies Co.' },
                { id: 2, sku: 'PROD-002', name: 'Office Chair Ergonomic', category: 'furniture', unitPrice: 299, stockQty: 8, reorderLevel: 15, status: 'low_stock', supplier: 'Office Essentials Ltd' },
                { id: 3, sku: 'PROD-003', name: 'Printer Paper A4 (500 sheets)', category: 'office_supplies', unitPrice: 12, stockQty: 250, reorderLevel: 50, status: 'active', supplier: 'Office Essentials Ltd' },
                { id: 4, sku: 'PROD-004', name: 'Steel Rods 10mm x 6m', category: 'raw_materials', unitPrice: 45, stockQty: 0, reorderLevel: 20, status: 'out_of_stock', supplier: 'Industrial Parts Inc' },
                { id: 5, sku: 'PROD-005', name: 'Wireless Mouse Logitech', category: 'electronics', unitPrice: 35, stockQty: 120, reorderLevel: 30, status: 'active', supplier: 'Tech Supplies Co.' },
            ];
            setProducts(mockProducts);
            setLoadingData(false);
        }, 500);
    };

    const filterData = () => {
        let result = [...products];

        if (filters.category !== 'all') {
            result = result.filter(product => product.category === filters.category);
        }

        if (filters.status !== 'all') {
            result = result.filter(product => product.status === filters.status);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(product =>
                product.name.toLowerCase().includes(searchLower) ||
                product.sku.toLowerCase().includes(searchLower)
            );
        }

        setFilteredProducts(result);
    };

    const handleSelectionChange = (ids) => {
        setSelectedIds(ids);
    };

    const getStatusColor = (status) => {
        const colors = {
            active: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
            low_stock: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
            out_of_stock: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
            discontinued: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }
        };
        return colors[status] || colors.active;
    };

    const columns = [
        {
            header: t('pages.products.sku', 'SKU'),
            field: 'sku',
            sortable: true,
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{row.sku}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.category.replace('_', ' ')}</div>
                </div>
            )
        },
        {
            header: t('pages.products.name', 'Product Name'),
            field: 'name',
            sortable: true,
            render: (row) => (
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{row.name}</div>
            )
        },
        {
            header: t('pages.products.price', 'Unit Price'),
            field: 'unitPrice',
            sortable: true,
            render: (row) => (
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                    ${row.unitPrice.toLocaleString()}
                </span>
            )
        },
        {
            header: t('pages.products.stock', 'Stock'),
            field: 'stockQty',
            sortable: true,
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 600, color: row.stockQty === 0 ? '#ef4444' : row.stockQty <= row.reorderLevel ? '#f59e0b' : 'var(--text-primary)' }}>
                        {row.stockQty} units
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Reorder: {row.reorderLevel}
                    </div>
                </div>
            )
        },
        {
            header: t('pages.products.status', 'Status'),
            field: 'status',
            sortable: true,
            render: (row) => {
                const statusColor = getStatusColor(row.status);
                return (
                    <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: statusColor.bg,
                        color: statusColor.color,
                        textTransform: 'capitalize'
                    }}>
                        {row.status.replace('_', ' ')}
                    </span>
                );
            }
        },
        {
            header: t('pages.products.supplier', 'Supplier'),
            field: 'supplier',
            render: (row) => (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {row.supplier}
                </span>
            )
        },
        {
            header: t('common.action', 'Actions'),
            render: (row) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="btn btn-sm"
                        style={{
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            color: 'var(--text-primary)'
                        }}
                    >
                        {t('common.edit', 'Edit')}
                    </button>
                </div>
            ),
        },
    ];

    if (loadingTranslations) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <PageTemplate
            title={t('pages.products.title', 'Products')}
            description={t('pages.products.description', 'Manage product catalog and inventory items')}
            icon="📦"
            breadcrumbs={[
                { label: t('modules.inventory', 'Inventory') },
                { label: t('pages.products.title', 'Products') },
            ]}
            actions={
                <div style={{ display: 'flex', gap: '8px' }}>
                    {selectedIds.length > 0 && (
                        <button
                            className="btn"
                            style={{
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none'
                            }}
                        >
                            {t('pages.products.updatePrice', 'Update Price')} ({selectedIds.length})
                        </button>
                    )}
                    <button className="btn btn-primary">
                        + {t('pages.products.addProduct', 'Add Product')}
                    </button>
                </div>
            }
            filters={
                <>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <SearchIcon size={16} style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)'
                        }} />
                        <input
                            type="text"
                            placeholder={t('common.search', 'Search products...')}
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            style={{
                                width: '100%',
                                padding: '8px 12px 8px 36px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border)',
                                fontSize: '0.875rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <select
                        value={filters.category}
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        style={{
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            fontSize: '0.875rem',
                            outline: 'none',
                            background: 'var(--surface)',
                            minWidth: '150px'
                        }}
                    >
                        <option value="all">{t('common.allCategories', 'All Categories')}</option>
                        <option value="electronics">Electronics</option>
                        <option value="furniture">Furniture</option>
                        <option value="office_supplies">Office Supplies</option>
                        <option value="raw_materials">Raw Materials</option>
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        style={{
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            fontSize: '0.875rem',
                            outline: 'none',
                            background: 'var(--surface)',
                            minWidth: '140px'
                        }}
                    >
                        <option value="all">{t('common.allStatus', 'All Status')}</option>
                        <option value="active">Active</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="discontinued">Discontinued</option>
                    </select>
                </>
            }
        >
            <DataTable
                columns={columns}
                data={filteredProducts}
                loading={loadingData}
                emptyMessage={t('common.noData', 'No products found')}
                selectable={true}
                onSelectionChange={handleSelectionChange}
                selectedIds={selectedIds}
            />
        </PageTemplate>
    );
}
