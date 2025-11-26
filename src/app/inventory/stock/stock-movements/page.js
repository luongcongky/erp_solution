'use client';

import PageTemplate from '@/components/PageTemplate';
import DataTable from '@/components/DataTable';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { SearchIcon } from '@/components/icons';

export default function StockMovementsPage() {
    const [movements, setMovements] = useState([]);
    const [filteredMovements, setFilteredMovements] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [filters, setFilters] = useState({
        type: 'all',
        search: ''
    });
    const { t, loading: loadingTranslations } = useTranslations();

    useEffect(() => {
        fetchMovements();
    }, []);

    useEffect(() => {
        filterData();
    }, [movements, filters]);

    const fetchMovements = async () => {
        // Simulate API call
        setTimeout(() => {
            const mockMovements = [
                { id: 1, date: '2024-02-21 10:30', product: 'Laptop Dell XPS 15', sku: 'PROD-001', type: 'in', quantity: 20, reference: 'PO-2024-045', warehouse: 'Main Warehouse', user: 'John Doe', notes: 'Received from supplier' },
                { id: 2, date: '2024-02-21 14:15', product: 'Office Chair Ergonomic', sku: 'PROD-002', type: 'out', quantity: 5, reference: 'SO-2024-123', warehouse: 'Main Warehouse', user: 'Jane Smith', notes: 'Shipped to customer' },
                { id: 3, date: '2024-02-20 09:00', product: 'Printer Paper A4', sku: 'PROD-003', type: 'in', quantity: 100, reference: 'PO-2024-044', warehouse: 'Main Warehouse', user: 'Bob Wilson', notes: 'Stock replenishment' },
                { id: 4, date: '2024-02-20 16:45', product: 'Wireless Mouse Logitech', sku: 'PROD-005', type: 'adjustment', quantity: -3, reference: 'ADJ-2024-012', warehouse: 'Main Warehouse', user: 'Alice Brown', notes: 'Damaged items write-off' },
                { id: 5, date: '2024-02-19 11:20', product: 'Steel Rods 10mm x 6m', sku: 'PROD-004', type: 'out', quantity: 50, reference: 'WO-2024-089', warehouse: 'Production Floor', user: 'Charlie Davis', notes: 'Used in manufacturing' },
            ];
            setMovements(mockMovements);
            setLoadingData(false);
        }, 500);
    };

    const filterData = () => {
        let result = [...movements];

        if (filters.type !== 'all') {
            result = result.filter(movement => movement.type === filters.type);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(movement =>
                movement.product.toLowerCase().includes(searchLower) ||
                movement.sku.toLowerCase().includes(searchLower) ||
                movement.reference.toLowerCase().includes(searchLower)
            );
        }

        setFilteredMovements(result);
    };

    const getTypeColor = (type) => {
        const colors = {
            in: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', icon: '📥' },
            out: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', icon: '📤' },
            adjustment: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', icon: '⚙️' },
            transfer: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', icon: '🔄' }
        };
        return colors[type] || colors.in;
    };

    const columns = [
        {
            header: t('pages.stockMovements.date', 'Date & Time'),
            field: 'date',
            sortable: true,
            render: (row) => (
                <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {row.date}
                </span>
            )
        },
        {
            header: t('pages.stockMovements.product', 'Product'),
            field: 'product',
            sortable: true,
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{row.product}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{row.sku}</div>
                </div>
            )
        },
        {
            header: t('pages.stockMovements.type', 'Type'),
            field: 'type',
            sortable: true,
            render: (row) => {
                const typeColor = getTypeColor(row.type);
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{typeColor.icon}</span>
                        <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: typeColor.bg,
                            color: typeColor.color,
                            textTransform: 'capitalize'
                        }}>
                            {row.type}
                        </span>
                    </div>
                );
            }
        },
        {
            header: t('pages.stockMovements.quantity', 'Quantity'),
            field: 'quantity',
            sortable: true,
            render: (row) => (
                <span style={{
                    fontWeight: 600,
                    color: row.quantity > 0 ? '#10b981' : '#ef4444',
                    fontSize: '0.875rem'
                }}>
                    {row.quantity > 0 ? '+' : ''}{row.quantity}
                </span>
            )
        },
        {
            header: t('pages.stockMovements.reference', 'Reference'),
            field: 'reference',
            render: (row) => (
                <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {row.reference}
                </span>
            )
        },
        {
            header: t('pages.stockMovements.warehouse', 'Warehouse'),
            field: 'warehouse',
            render: (row) => (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {row.warehouse}
                </span>
            )
        },
        {
            header: t('pages.stockMovements.user', 'User'),
            field: 'user',
            render: (row) => (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {row.user}
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
                        {t('common.view', 'View')}
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
            title={t('pages.stockMovements.title', 'Stock Movements')}
            description={t('pages.stockMovements.description', 'Track all inventory transactions and stock changes')}
            icon="📊"
            breadcrumbs={[
                { label: t('modules.inventory', 'Inventory') },
                { label: t('pages.stockMovements.title', 'Stock Movements') },
            ]}
            actions={
                <button className="btn btn-primary">
                    + {t('pages.stockMovements.addAdjustment', 'Stock Adjustment')}
                </button>
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
                            placeholder={t('common.search', 'Search movements...')}
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
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
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
                        <option value="all">{t('common.allTypes', 'All Types')}</option>
                        <option value="in">Stock In</option>
                        <option value="out">Stock Out</option>
                        <option value="adjustment">Adjustment</option>
                        <option value="transfer">Transfer</option>
                    </select>
                </>
            }
        >
            <DataTable
                columns={columns}
                data={filteredMovements}
                loading={loadingData}
                emptyMessage={t('common.noData', 'No stock movements found')}
            />
        </PageTemplate>
    );
}
