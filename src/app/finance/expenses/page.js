'use client';

import PageTemplate from '@/components/PageTemplate';
import DataTable from '@/components/DataTable';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { SearchIcon } from '@/components/icons';

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [filters, setFilters] = useState({
        status: 'all',
        category: 'all',
        search: ''
    });
    const { t, loading: loadingTranslations } = useTranslations();

    const fetchExpenses = async () => {
        // Simulate API call
        setTimeout(() => {
            const mockExpenses = [
                { id: 1, expenseId: 'EXP-2024-001', employee: 'John Doe', category: 'travel', description: 'Flight to client meeting', amount: 850, date: '2024-02-15', status: 'approved', approver: 'Jane Manager' },
                { id: 2, expenseId: 'EXP-2024-002', employee: 'Jane Smith', category: 'meals', description: 'Team lunch with client', amount: 120, date: '2024-02-18', status: 'pending', approver: null },
                { id: 3, expenseId: 'EXP-2024-003', employee: 'Bob Wilson', category: 'supplies', description: 'Office supplies for project', amount: 45, date: '2024-02-20', status: 'approved', approver: 'Alice Lead' },
                { id: 4, expenseId: 'EXP-2024-004', employee: 'Alice Brown', category: 'travel', description: 'Hotel accommodation', amount: 320, date: '2024-02-17', status: 'rejected', approver: 'Charlie Boss' },
                { id: 5, expenseId: 'EXP-2024-005', employee: 'Charlie Davis', category: 'training', description: 'Online course subscription', amount: 299, date: '2024-02-19', status: 'pending', approver: null },
            ];
            setExpenses(mockExpenses);
            setLoadingData(false);
        }, 500);
    };

    const filterData = () => {
        let result = [...expenses];

        if (filters.status !== 'all') {
            result = result.filter(exp => exp.status === filters.status);
        }

        if (filters.category !== 'all') {
            result = result.filter(exp => exp.category === filters.category);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(exp =>
                exp.expenseId.toLowerCase().includes(searchLower) ||
                exp.employee.toLowerCase().includes(searchLower) ||
                exp.description.toLowerCase().includes(searchLower)
            );
        }

        setFilteredExpenses(result);
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    useEffect(() => {
        filterData();
    }, [expenses, filters]);

    const handleSelectionChange = (ids) => {
        setSelectedIds(ids);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
            approved: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
            rejected: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }
        };
        return colors[status] || colors.pending;
    };

    const columns = [
        {
            header: t('pages.expenses.id', 'Expense ID'),
            field: 'expenseId',
            sortable: true,
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{row.expenseId}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.date}</div>
                </div>
            )
        },
        {
            header: t('pages.expenses.employee', 'Employee'),
            field: 'employee',
            sortable: true,
            render: (row) => (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{row.employee}</span>
            )
        },
        {
            header: t('pages.expenses.category', 'Category'),
            field: 'category',
            sortable: true,
            render: (row) => (
                <span style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    textTransform: 'capitalize'
                }}>
                    {row.category}
                </span>
            )
        },
        {
            header: t('pages.expenses.description', 'Description'),
            field: 'description',
            render: (row) => (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {row.description}
                </span>
            )
        },
        {
            header: t('pages.expenses.amount', 'Amount'),
            field: 'amount',
            sortable: true,
            render: (row) => (
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                    ${row.amount.toLocaleString()}
                </span>
            )
        },
        {
            header: t('pages.expenses.status', 'Status'),
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
            title={t('pages.expenses.title', 'Expenses')}
            description={t('pages.expenses.description', 'Track and approve employee expense claims')}
            icon="💳"
            breadcrumbs={[
                { label: t('modules.finance', 'Finance') },
                { label: t('pages.expenses.title', 'Expenses') },
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
                            {t('pages.expenses.approve', 'Approve')} ({selectedIds.length})
                        </button>
                    )}
                    <button className="btn btn-primary">
                        + {t('pages.expenses.addExpense', 'New Expense')}
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
                            placeholder={t('common.search', 'Search expenses...')}
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
                            minWidth: '140px'
                        }}
                    >
                        <option value="all">{t('common.allCategories', 'All Categories')}</option>
                        <option value="travel">Travel</option>
                        <option value="meals">Meals</option>
                        <option value="supplies">Supplies</option>
                        <option value="training">Training</option>
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
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </>
            }
        >
            <DataTable
                columns={columns}
                data={filteredExpenses}
                loading={loadingData}
                emptyMessage={t('common.noData', 'No expenses found')}
                selectable={true}
                onSelectionChange={handleSelectionChange}
                selectedIds={selectedIds}
            />
        </PageTemplate>
    );
}
