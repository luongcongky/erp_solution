'use client';

import PageTemplate from '@/components/PageTemplate';
import DataTable from '@/components/DataTable';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { SearchIcon } from '@/components/icons';

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [filters, setFilters] = useState({
        category: 'all',
        status: 'all',
        search: ''
    });
    const { t, loading: loadingTranslations } = useTranslations();

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        filterData();
    }, [suppliers, filters]);

    const fetchSuppliers = async () => {
        // Simulate API call
        setTimeout(() => {
            const mockSuppliers = [
                { id: 1, name: 'Tech Supplies Co.', category: 'electronics', contact: 'Sarah Johnson', email: 'sarah@techsupplies.com', phone: '+1-555-0201', rating: 4.8, status: 'active', totalOrders: 45, totalSpent: 125000 },
                { id: 2, name: 'Office Essentials Ltd', category: 'office_supplies', contact: 'Mike Chen', email: 'mike@officeessentials.com', phone: '+1-555-0202', rating: 4.5, status: 'active', totalOrders: 78, totalSpent: 89000 },
                { id: 3, name: 'Industrial Parts Inc', category: 'raw_materials', contact: 'David Lee', email: 'david@industrialparts.com', phone: '+1-555-0203', rating: 4.2, status: 'active', totalOrders: 23, totalSpent: 245000 },
                { id: 4, name: 'Global Logistics', category: 'services', contact: 'Emma Wilson', email: 'emma@globallogistics.com', phone: '+1-555-0204', rating: 4.9, status: 'active', totalOrders: 156, totalSpent: 67000 },
                { id: 5, name: 'Budget Supplies', category: 'office_supplies', contact: 'Tom Brown', email: 'tom@budgetsupplies.com', phone: '+1-555-0205', rating: 3.8, status: 'inactive', totalOrders: 12, totalSpent: 15000 },
            ];
            setSuppliers(mockSuppliers);
            setLoadingData(false);
        }, 500);
    };

    const filterData = () => {
        let result = [...suppliers];

        if (filters.category !== 'all') {
            result = result.filter(supplier => supplier.category === filters.category);
        }

        if (filters.status !== 'all') {
            result = result.filter(supplier => supplier.status === filters.status);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(supplier =>
                supplier.name.toLowerCase().includes(searchLower) ||
                supplier.contact.toLowerCase().includes(searchLower) ||
                supplier.email.toLowerCase().includes(searchLower)
            );
        }

        setFilteredSuppliers(result);
    };

    const handleSelectionChange = (ids) => {
        setSelectedIds(ids);
    };

    const columns = [
        {
            header: t('pages.suppliers.name', 'Supplier'),
            field: 'name',
            sortable: true,
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.category.replace('_', ' ')}</div>
                </div>
            )
        },
        {
            header: t('pages.suppliers.contact', 'Contact'),
            field: 'contact',
            render: (row) => (
                <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{row.contact}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</div>
                </div>
            )
        },
        {
            header: t('pages.suppliers.rating', 'Rating'),
            field: 'rating',
            sortable: true,
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1rem' }}>⭐</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.rating}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/5.0</span>
                </div>
            )
        },
        {
            header: t('pages.suppliers.status', 'Status'),
            field: 'status',
            sortable: true,
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: row.status === 'active' ? '#10b981' : '#ef4444'
                    }}></div>
                    <span style={{
                        fontSize: '0.875rem',
                        color: row.status === 'active' ? 'var(--text-primary)' : 'var(--text-muted)',
                        textTransform: 'capitalize'
                    }}>
                        {row.status}
                    </span>
                </div>
            )
        },
        {
            header: t('pages.suppliers.orders', 'Total Orders'),
            field: 'totalOrders',
            sortable: true,
            render: (row) => (
                <span style={{ fontWeight: 500 }}>{row.totalOrders}</span>
            )
        },
        {
            header: t('pages.suppliers.spent', 'Total Spent'),
            field: 'totalSpent',
            sortable: true,
            render: (row) => (
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                    ${row.totalSpent.toLocaleString()}
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
            title={t('pages.suppliers.title', 'Suppliers')}
            description={t('pages.suppliers.description', 'Manage supplier relationships and vendor information')}
            icon="🏭"
            breadcrumbs={[
                { label: t('modules.purchase', 'Purchase') },
                { label: t('pages.suppliers.title', 'Suppliers') },
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
                            {t('pages.suppliers.export', 'Export')} ({selectedIds.length})
                        </button>
                    )}
                    <button className="btn btn-primary">
                        + {t('pages.suppliers.addSupplier', 'Add Supplier')}
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
                            placeholder={t('common.search', 'Search suppliers...')}
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
                        <option value="office_supplies">Office Supplies</option>
                        <option value="raw_materials">Raw Materials</option>
                        <option value="services">Services</option>
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
                            minWidth: '120px'
                        }}
                    >
                        <option value="all">{t('common.allStatus', 'All Status')}</option>
                        <option value="active">{t('pages.suppliers.active', 'Active')}</option>
                        <option value="inactive">{t('pages.suppliers.inactive', 'Inactive')}</option>
                    </select>
                </>
            }
        >
            <DataTable
                columns={columns}
                data={filteredSuppliers}
                loading={loadingData}
                emptyMessage={t('common.noData', 'No suppliers found')}
                selectable={true}
                onSelectionChange={handleSelectionChange}
                selectedIds={selectedIds}
            />
        </PageTemplate>
    );
}
