'use client';

import PageTemplate from '@/components/PageTemplate';
import DataTable from '@/components/DataTable';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { SearchIcon } from '@/components/icons';

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [filters, setFilters] = useState({
        status: 'all',
        type: 'all',
        search: ''
    });
    const { t, loading: loadingTranslations } = useTranslations();

    useEffect(() => {
        fetchInvoices();
    }, []);

    useEffect(() => {
        filterData();
    }, [invoices, filters]);

    const fetchInvoices = async () => {
        // Simulate API call
        setTimeout(() => {
            const mockInvoices = [
                { id: 1, invoiceNumber: 'INV-2024-001', customer: 'Tech Corp', type: 'sales', amount: 12500, status: 'paid', issueDate: '2024-02-15', dueDate: '2024-03-15', paidDate: '2024-03-10' },
                { id: 2, invoiceNumber: 'INV-2024-002', customer: 'Marketing Inc', type: 'sales', amount: 8900, status: 'overdue', issueDate: '2024-01-20', dueDate: '2024-02-20', paidDate: null },
                { id: 3, invoiceNumber: 'BILL-2024-001', customer: 'Tech Supplies Co.', type: 'purchase', amount: 5400, status: 'pending', issueDate: '2024-02-18', dueDate: '2024-03-18', paidDate: null },
                { id: 4, invoiceNumber: 'INV-2024-003', customer: 'Design Studio', type: 'sales', amount: 15000, status: 'pending', issueDate: '2024-02-20', dueDate: '2024-03-20', paidDate: null },
                { id: 5, invoiceNumber: 'BILL-2024-002', customer: 'Office Essentials Ltd', type: 'purchase', amount: 2200, status: 'paid', issueDate: '2024-02-10', dueDate: '2024-03-10', paidDate: '2024-03-08' },
            ];
            setInvoices(mockInvoices);
            setLoadingData(false);
        }, 500);
    };

    const filterData = () => {
        let result = [...invoices];

        if (filters.status !== 'all') {
            result = result.filter(invoice => invoice.status === filters.status);
        }

        if (filters.type !== 'all') {
            result = result.filter(invoice => invoice.type === filters.type);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(invoice =>
                invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
                invoice.customer.toLowerCase().includes(searchLower)
            );
        }

        setFilteredInvoices(result);
    };

    const handleSelectionChange = (ids) => {
        setSelectedIds(ids);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
            paid: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
            overdue: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
            cancelled: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }
        };
        return colors[status] || colors.pending;
    };

    const columns = [
        {
            header: t('pages.invoices.number', 'Invoice #'),
            field: 'invoiceNumber',
            sortable: true,
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{row.invoiceNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.issueDate}</div>
                </div>
            )
        },
        {
            header: t('pages.invoices.customer', 'Customer/Vendor'),
            field: 'customer',
            sortable: true,
            render: (row) => (
                <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{row.customer}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {row.type === 'sales' ? '📤 Sales' : '📥 Purchase'}
                    </div>
                </div>
            )
        },
        {
            header: t('pages.invoices.amount', 'Amount'),
            field: 'amount',
            sortable: true,
            render: (row) => (
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                    ${row.amount.toLocaleString()}
                </span>
            )
        },
        {
            header: t('pages.invoices.status', 'Status'),
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
                        {row.status}
                    </span>
                );
            }
        },
        {
            header: t('pages.invoices.dueDate', 'Due Date'),
            field: 'dueDate',
            sortable: true,
            render: (row) => {
                const isOverdue = new Date(row.dueDate) < new Date() && row.status === 'pending';
                return (
                    <span style={{
                        fontSize: '0.875rem',
                        color: isOverdue ? '#ef4444' : 'var(--text-secondary)',
                        fontWeight: isOverdue ? 600 : 400
                    }}>
                        {row.dueDate}
                    </span>
                );
            }
        },
        {
            header: t('pages.invoices.paidDate', 'Paid Date'),
            field: 'paidDate',
            render: (row) => (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {row.paidDate || '-'}
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
            title={t('pages.invoices.title', 'Invoices')}
            description={t('pages.invoices.description', 'Manage sales and purchase invoices')}
            icon="💰"
            breadcrumbs={[
                { label: t('modules.finance', 'Finance') },
                { label: t('pages.invoices.title', 'Invoices') },
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
                            {t('pages.invoices.markPaid', 'Mark as Paid')} ({selectedIds.length})
                        </button>
                    )}
                    <button className="btn btn-primary">
                        + {t('pages.invoices.addInvoice', 'New Invoice')}
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
                            placeholder={t('common.search', 'Search invoices...')}
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
                        <option value="sales">Sales</option>
                        <option value="purchase">Purchase</option>
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
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </>
            }
        >
            <DataTable
                columns={columns}
                data={filteredInvoices}
                loading={loadingData}
                emptyMessage={t('common.noData', 'No invoices found')}
                selectable={true}
                onSelectionChange={handleSelectionChange}
                selectedIds={selectedIds}
            />
        </PageTemplate>
    );
}
