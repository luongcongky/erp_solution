'use client';

import PageTemplate from '@/components/PageTemplate';
import DataTable from '@/components/DataTable';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { SearchIcon } from '@/components/icons';

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all',
        search: ''
    });
    const { t, loading: loadingTranslations } = useTranslations();

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        filterData();
    }, [customers, filters]);

    const fetchCustomers = async () => {
        // Simulate API call
        setTimeout(() => {
            const mockCustomers = [
                { id: 1, name: 'Tech Corp', type: 'enterprise', contact: 'John Smith', email: 'john@techcorp.com', phone: '+1-555-0101', status: 'active', totalRevenue: 850000, openOpportunities: 2 },
                { id: 2, name: 'Marketing Inc', type: 'smb', contact: 'Jane Doe', email: 'jane@marketing.com', phone: '+1-555-0102', status: 'active', totalRevenue: 320000, openOpportunities: 1 },
                { id: 3, name: 'Design Studio', type: 'smb', contact: 'Bob Wilson', email: 'bob@design.com', phone: '+1-555-0103', status: 'active', totalRevenue: 180000, openOpportunities: 1 },
                { id: 4, name: 'Startup Labs', type: 'startup', contact: 'Alice Brown', email: 'alice@startup.com', phone: '+1-555-0104', status: 'active', totalRevenue: 95000, openOpportunities: 0 },
                { id: 5, name: 'Enterprise Solutions', type: 'enterprise', contact: 'Charlie Davis', email: 'charlie@enterprise.com', phone: '+1-555-0105', status: 'inactive', totalRevenue: 1200000, openOpportunities: 0 },
                { id: 6, name: 'Consulting Group', type: 'smb', contact: 'Diana Prince', email: 'diana@consulting.com', phone: '+1-555-0106', status: 'active', totalRevenue: 450000, openOpportunities: 3 },
            ];
            setCustomers(mockCustomers);
            setLoadingData(false);
        }, 500);
    };

    const filterData = () => {
        let result = [...customers];

        if (filters.type !== 'all') {
            result = result.filter(customer => customer.type === filters.type);
        }

        if (filters.status !== 'all') {
            result = result.filter(customer => customer.status === filters.status);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(customer =>
                customer.name.toLowerCase().includes(searchLower) ||
                customer.contact.toLowerCase().includes(searchLower) ||
                customer.email.toLowerCase().includes(searchLower)
            );
        }

        setFilteredCustomers(result);
    };

    const handleSelectionChange = (ids) => {
        setSelectedIds(ids);
    };

    const columns = [
        {
            header: t('pages.customers.name', 'Customer'),
            field: 'name',
            sortable: true,
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.contact}</div>
                </div>
            )
        },
        {
            header: t('pages.customers.contact', 'Contact Info'),
            field: 'email',
            render: (row) => (
                <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{row.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.phone}</div>
                </div>
            )
        },
        {
            header: t('pages.customers.type', 'Type'),
            field: 'type',
            sortable: true,
            render: (row) => {
                const typeColors = {
                    enterprise: { bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' },
                    smb: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
                    startup: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }
                };
                const color = typeColors[row.type] || typeColors.smb;

                return (
                    <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: color.bg,
                        color: color.color,
                        textTransform: 'uppercase'
                    }}>
                        {row.type}
                    </span>
                );
            }
        },
        {
            header: t('pages.customers.status', 'Status'),
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
            header: t('pages.customers.revenue', 'Total Revenue'),
            field: 'totalRevenue',
            sortable: true,
            render: (row) => (
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                    ${row.totalRevenue.toLocaleString()}
                </span>
            )
        },
        {
            header: t('pages.customers.opportunities', 'Open Opps'),
            field: 'openOpportunities',
            sortable: true,
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1rem' }}>💼</span>
                    <span style={{ fontWeight: 500 }}>{row.openOpportunities}</span>
                </div>
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
            title={t('pages.customers.title', 'Customers')}
            description={t('pages.customers.description', 'Manage customer accounts and relationships')}
            icon="🏢"
            breadcrumbs={[
                { label: t('modules.sales', 'Sales & CRM') },
                { label: t('pages.customers.title', 'Customers') },
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
                            {t('pages.customers.export', 'Export')} ({selectedIds.length})
                        </button>
                    )}
                    <button className="btn btn-primary">
                        + {t('pages.customers.addCustomer', 'Add Customer')}
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
                            placeholder={t('common.search', 'Search customers...')}
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
                            minWidth: '120px'
                        }}
                    >
                        <option value="all">{t('common.allTypes', 'All Types')}</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="smb">SMB</option>
                        <option value="startup">Startup</option>
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
                        <option value="active">{t('pages.customers.active', 'Active')}</option>
                        <option value="inactive">{t('pages.customers.inactive', 'Inactive')}</option>
                    </select>
                </>
            }
        >
            <DataTable
                columns={columns}
                data={filteredCustomers}
                loading={loadingData}
                emptyMessage={t('common.noData', 'No customers found')}
                selectable={true}
                onSelectionChange={handleSelectionChange}
                selectedIds={selectedIds}
            />
        </PageTemplate>
    );
}
