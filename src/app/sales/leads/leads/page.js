'use client';

import PageTemplate from '@/components/PageTemplate';
import DataTable from '@/components/DataTable';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { SearchIcon } from '@/components/icons';

export default function LeadsPage() {
    const [leads, setLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [filters, setFilters] = useState({
        status: 'all',
        source: 'all',
        search: ''
    });
    const { t, loading: loadingTranslations } = useTranslations();

    useEffect(() => {
        fetchLeads();
    }, []);

    useEffect(() => {
        filterData();
    }, [leads, filters]);

    const fetchLeads = async () => {
        // Simulate API call
        setTimeout(() => {
            const mockLeads = [
                { id: 1, name: 'John Smith', company: 'Tech Corp', email: 'john@techcorp.com', phone: '+1-555-0101', status: 'new', source: 'website', value: 50000, assignedTo: 'Sales Manager', createdAt: '2024-02-20' },
                { id: 2, name: 'Jane Doe', company: 'Marketing Inc', email: 'jane@marketing.com', phone: '+1-555-0102', status: 'contacted', source: 'referral', value: 75000, assignedTo: 'Sales Rep 1', createdAt: '2024-02-19' },
                { id: 3, name: 'Bob Wilson', company: 'Design Studio', email: 'bob@design.com', phone: '+1-555-0103', status: 'qualified', source: 'linkedin', value: 120000, assignedTo: 'Sales Manager', createdAt: '2024-02-18' },
                { id: 4, name: 'Alice Brown', company: 'Startup Labs', email: 'alice@startup.com', phone: '+1-555-0104', status: 'new', source: 'website', value: 30000, assignedTo: 'Sales Rep 2', createdAt: '2024-02-21' },
                { id: 5, name: 'Charlie Davis', company: 'Enterprise Solutions', email: 'charlie@enterprise.com', phone: '+1-555-0105', status: 'lost', source: 'cold_call', value: 200000, assignedTo: 'Sales Manager', createdAt: '2024-02-15' },
            ];
            setLeads(mockLeads);
            setLoadingData(false);
        }, 500);
    };

    const filterData = () => {
        let result = [...leads];

        if (filters.status !== 'all') {
            result = result.filter(lead => lead.status === filters.status);
        }

        if (filters.source !== 'all') {
            result = result.filter(lead => lead.source === filters.source);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(lead =>
                lead.name.toLowerCase().includes(searchLower) ||
                lead.company.toLowerCase().includes(searchLower) ||
                lead.email.toLowerCase().includes(searchLower)
            );
        }

        setFilteredLeads(result);
    };

    const handleSelectionChange = (ids) => {
        setSelectedIds(ids);
    };

    const getStatusColor = (status) => {
        const colors = {
            new: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
            contacted: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
            qualified: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
            lost: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }
        };
        return colors[status] || colors.new;
    };

    const columns = [
        {
            header: t('pages.leads.name', 'Lead Name'),
            field: 'name',
            sortable: true,
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.company}</div>
                </div>
            )
        },
        {
            header: t('pages.leads.contact', 'Contact'),
            field: 'email',
            render: (row) => (
                <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{row.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.phone}</div>
                </div>
            )
        },
        {
            header: t('pages.leads.status', 'Status'),
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
            header: t('pages.leads.source', 'Source'),
            field: 'source',
            sortable: true,
            render: (row) => (
                <span style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    textTransform: 'capitalize'
                }}>
                    {row.source.replace('_', ' ')}
                </span>
            )
        },
        {
            header: t('pages.leads.value', 'Est. Value'),
            field: 'value',
            sortable: true,
            render: (row) => (
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    ${row.value.toLocaleString()}
                </span>
            )
        },
        {
            header: t('pages.leads.assignedTo', 'Assigned To'),
            field: 'assignedTo',
            render: (row) => (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {row.assignedTo}
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
            title={t('pages.leads.title', 'Leads Management')}
            description={t('pages.leads.description', 'Track and manage sales leads and opportunities')}
            icon="🎯"
            breadcrumbs={[
                { label: t('modules.sales', 'Sales & CRM') },
                { label: t('pages.leads.title', 'Leads') },
            ]}
            actions={
                <div style={{ display: 'flex', gap: '8px' }}>
                    {selectedIds.length > 0 && (
                        <>
                            <button
                                className="btn"
                                style={{
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                {t('pages.leads.assignBulk', 'Assign')} ({selectedIds.length})
                            </button>
                            <button
                                className="btn"
                                style={{
                                    background: 'var(--error)',
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                {t('common.delete', 'Delete')} ({selectedIds.length})
                            </button>
                        </>
                    )}
                    <button className="btn btn-primary">
                        + {t('pages.leads.addLead', 'Add Lead')}
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
                            placeholder={t('common.search', 'Search leads...')}
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
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="lost">Lost</option>
                    </select>

                    <select
                        value={filters.source}
                        onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
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
                        <option value="all">{t('common.allSources', 'All Sources')}</option>
                        <option value="website">Website</option>
                        <option value="referral">Referral</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="cold_call">Cold Call</option>
                    </select>
                </>
            }
        >
            <DataTable
                columns={columns}
                data={filteredLeads}
                loading={loadingData}
                emptyMessage={t('common.noData', 'No leads found')}
                selectable={true}
                onSelectionChange={handleSelectionChange}
                selectedIds={selectedIds}
            />
        </PageTemplate>
    );
}
