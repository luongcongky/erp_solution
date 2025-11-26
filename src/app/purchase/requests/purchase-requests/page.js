'use client';

import PageTemplate from '@/components/PageTemplate';
import DataTable from '@/components/DataTable';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { SearchIcon } from '@/components/icons';

export default function PurchaseRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        search: ''
    });
    const { t, loading: loadingTranslations } = useTranslations();

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        filterData();
    }, [requests, filters]);

    const fetchRequests = async () => {
        // Simulate API call
        setTimeout(() => {
            const mockRequests = [
                { id: 1, requestNumber: 'PR-2024-001', requestedBy: 'John Doe', department: 'IT', items: 5, totalAmount: 12500, priority: 'high', status: 'pending', requestDate: '2024-02-20', requiredBy: '2024-03-01' },
                { id: 2, requestNumber: 'PR-2024-002', requestedBy: 'Jane Smith', department: 'Marketing', items: 3, totalAmount: 8900, priority: 'medium', status: 'approved', requestDate: '2024-02-19', requiredBy: '2024-03-10' },
                { id: 3, requestNumber: 'PR-2024-003', requestedBy: 'Bob Wilson', department: 'Operations', items: 12, totalAmount: 45000, priority: 'high', status: 'in_rfq', requestDate: '2024-02-18', requiredBy: '2024-02-28' },
                { id: 4, requestNumber: 'PR-2024-004', requestedBy: 'Alice Brown', department: 'HR', items: 2, totalAmount: 3200, priority: 'low', status: 'pending', requestDate: '2024-02-21', requiredBy: '2024-03-15' },
                { id: 5, requestNumber: 'PR-2024-005', requestedBy: 'Charlie Davis', department: 'Finance', items: 8, totalAmount: 22000, priority: 'medium', status: 'rejected', requestDate: '2024-02-15', requiredBy: '2024-02-25' },
            ];
            setRequests(mockRequests);
            setLoadingData(false);
        }, 500);
    };

    const filterData = () => {
        let result = [...requests];

        if (filters.status !== 'all') {
            result = result.filter(req => req.status === filters.status);
        }

        if (filters.priority !== 'all') {
            result = result.filter(req => req.priority === filters.priority);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(req =>
                req.requestNumber.toLowerCase().includes(searchLower) ||
                req.requestedBy.toLowerCase().includes(searchLower) ||
                req.department.toLowerCase().includes(searchLower)
            );
        }

        setFilteredRequests(result);
    };

    const handleSelectionChange = (ids) => {
        setSelectedIds(ids);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
            approved: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
            in_rfq: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
            rejected: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }
        };
        return colors[status] || colors.pending;
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
            medium: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
            low: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }
        };
        return colors[priority] || colors.medium;
    };

    const columns = [
        {
            header: t('pages.purchaseRequests.number', 'PR Number'),
            field: 'requestNumber',
            sortable: true,
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.requestNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.requestDate}</div>
                </div>
            )
        },
        {
            header: t('pages.purchaseRequests.requestedBy', 'Requested By'),
            field: 'requestedBy',
            sortable: true,
            render: (row) => (
                <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{row.requestedBy}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.department}</div>
                </div>
            )
        },
        {
            header: t('pages.purchaseRequests.items', 'Items'),
            field: 'items',
            sortable: true,
            render: (row) => (
                <span style={{ fontWeight: 500 }}>{row.items} items</span>
            )
        },
        {
            header: t('pages.purchaseRequests.amount', 'Amount'),
            field: 'totalAmount',
            sortable: true,
            render: (row) => (
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                    ${row.totalAmount.toLocaleString()}
                </span>
            )
        },
        {
            header: t('pages.purchaseRequests.priority', 'Priority'),
            field: 'priority',
            sortable: true,
            render: (row) => {
                const priorityColor = getPriorityColor(row.priority);
                return (
                    <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: priorityColor.bg,
                        color: priorityColor.color,
                        textTransform: 'uppercase'
                    }}>
                        {row.priority}
                    </span>
                );
            }
        },
        {
            header: t('pages.purchaseRequests.status', 'Status'),
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
            header: t('pages.purchaseRequests.requiredBy', 'Required By'),
            field: 'requiredBy',
            sortable: true,
            render: (row) => (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {row.requiredBy}
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
            title={t('pages.purchaseRequests.title', 'Purchase Requests')}
            description={t('pages.purchaseRequests.description', 'Manage internal purchase requisitions and approvals')}
            icon="📝"
            breadcrumbs={[
                { label: t('modules.purchase', 'Purchase') },
                { label: t('pages.purchaseRequests.title', 'Purchase Requests') },
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
                            {t('pages.purchaseRequests.approve', 'Approve')} ({selectedIds.length})
                        </button>
                    )}
                    <button className="btn btn-primary">
                        + {t('pages.purchaseRequests.addRequest', 'New Request')}
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
                            placeholder={t('common.search', 'Search requests...')}
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
                        <option value="in_rfq">In RFQ</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    <select
                        value={filters.priority}
                        onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
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
                        <option value="all">{t('common.allPriority', 'All Priority')}</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </>
            }
        >
            <DataTable
                columns={columns}
                data={filteredRequests}
                loading={loadingData}
                emptyMessage={t('common.noData', 'No purchase requests found')}
                selectable={true}
                onSelectionChange={handleSelectionChange}
                selectedIds={selectedIds}
            />
        </PageTemplate>
    );
}
