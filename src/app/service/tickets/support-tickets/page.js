'use client';

import PageTemplate from '@/components/PageTemplate';
import DataTable from '@/components/DataTable';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { SearchIcon } from '@/components/icons';

export default function SupportTicketsPage() {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        search: ''
    });
    const { t, loading: loadingTranslations } = useTranslations();

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        filterData();
    }, [tickets, filters]);

    const fetchTickets = async () => {
        // Simulate API call
        setTimeout(() => {
            const mockTickets = [
                { id: 1, ticketNumber: 'TKT-2024-001', customer: 'Tech Corp', subject: 'Cannot login to system', status: 'open', priority: 'high', assignee: 'John Support', createdDate: '2024-02-21 10:30', lastUpdate: '2024-02-21 14:15' },
                { id: 2, ticketNumber: 'TKT-2024-002', customer: 'Marketing Inc', subject: 'Feature request: Export to Excel', status: 'in_progress', priority: 'medium', assignee: 'Jane Developer', createdDate: '2024-02-20 09:00', lastUpdate: '2024-02-21 11:20' },
                { id: 3, ticketNumber: 'TKT-2024-003', customer: 'Design Studio', subject: 'Slow performance on reports page', status: 'resolved', priority: 'medium', assignee: 'Bob Engineer', createdDate: '2024-02-19 15:45', lastUpdate: '2024-02-20 16:30' },
                { id: 4, ticketNumber: 'TKT-2024-004', customer: 'Startup Labs', subject: 'Invoice not generated', status: 'open', priority: 'high', assignee: 'Alice Support', createdDate: '2024-02-21 08:15', lastUpdate: '2024-02-21 08:15' },
                { id: 5, ticketNumber: 'TKT-2024-005', customer: 'Enterprise Solutions', subject: 'How to setup custom fields?', status: 'closed', priority: 'low', assignee: 'Charlie Support', createdDate: '2024-02-18 11:00', lastUpdate: '2024-02-19 10:00' },
            ];
            setTickets(mockTickets);
            setLoadingData(false);
        }, 500);
    };

    const filterData = () => {
        let result = [...tickets];

        if (filters.status !== 'all') {
            result = result.filter(ticket => ticket.status === filters.status);
        }

        if (filters.priority !== 'all') {
            result = result.filter(ticket => ticket.priority === filters.priority);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(ticket =>
                ticket.ticketNumber.toLowerCase().includes(searchLower) ||
                ticket.customer.toLowerCase().includes(searchLower) ||
                ticket.subject.toLowerCase().includes(searchLower)
            );
        }

        setFilteredTickets(result);
    };

    const handleSelectionChange = (ids) => {
        setSelectedIds(ids);
    };

    const getStatusColor = (status) => {
        const colors = {
            open: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
            in_progress: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
            resolved: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
            closed: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }
        };
        return colors[status] || colors.open;
    };

    const columns = [
        {
            header: t('pages.supportTickets.number', 'Ticket #'),
            field: 'ticketNumber',
            sortable: true,
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{row.ticketNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.createdDate}</div>
                </div>
            )
        },
        {
            header: t('pages.supportTickets.customer', 'Customer'),
            field: 'customer',
            sortable: true,
            render: (row) => (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{row.customer}</span>
            )
        },
        {
            header: t('pages.supportTickets.subject', 'Subject'),
            field: 'subject',
            render: (row) => (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {row.subject}
                </span>
            )
        },
        {
            header: t('pages.supportTickets.status', 'Status'),
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
            header: t('pages.supportTickets.priority', 'Priority'),
            field: 'priority',
            sortable: true,
            render: (row) => {
                const priorityColors = {
                    high: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
                    medium: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
                    low: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }
                };
                const color = priorityColors[row.priority];

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
                        {row.priority}
                    </span>
                );
            }
        },
        {
            header: t('pages.supportTickets.assignee', 'Assignee'),
            field: 'assignee',
            render: (row) => (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {row.assignee}
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
            title={t('pages.supportTickets.title', 'Support Tickets')}
            description={t('pages.supportTickets.description', 'Manage customer support requests and issues')}
            icon="🎫"
            breadcrumbs={[
                { label: t('modules.service', 'Service') },
                { label: t('pages.supportTickets.title', 'Support Tickets') },
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
                            {t('pages.supportTickets.assign', 'Assign')} ({selectedIds.length})
                        </button>
                    )}
                    <button className="btn btn-primary">
                        + {t('pages.supportTickets.addTicket', 'New Ticket')}
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
                            placeholder={t('common.search', 'Search tickets...')}
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
                            minWidth: '140px'
                        }}
                    >
                        <option value="all">{t('common.allStatus', 'All Status')}</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
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
                data={filteredTickets}
                loading={loadingData}
                emptyMessage={t('common.noData', 'No support tickets found')}
                selectable={true}
                onSelectionChange={handleSelectionChange}
                selectedIds={selectedIds}
            />
        </PageTemplate>
    );
}
