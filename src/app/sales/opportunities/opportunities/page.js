'use client';

import PageTemplate from '@/components/PageTemplate';
import DataTable from '@/components/DataTable';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { SearchIcon } from '@/components/icons';

export default function OpportunitiesPage() {
    const [opportunities, setOpportunities] = useState([]);
    const [filteredOpportunities, setFilteredOpportunities] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [filters, setFilters] = useState({
        stage: 'all',
        search: ''
    });
    const { t, loading: loadingTranslations } = useTranslations();

    useEffect(() => {
        fetchOpportunities();
    }, []);

    useEffect(() => {
        filterData();
    }, [opportunities, filters]);

    const fetchOpportunities = async () => {
        // Simulate API call
        setTimeout(() => {
            const mockOpportunities = [
                { id: 1, name: 'Enterprise Software Deal', account: 'Tech Corp', stage: 'proposal', value: 250000, probability: 60, expectedClose: '2024-03-15', owner: 'Sales Manager' },
                { id: 2, name: 'Marketing Automation Project', account: 'Marketing Inc', stage: 'negotiation', value: 180000, probability: 80, expectedClose: '2024-03-01', owner: 'Sales Rep 1' },
                { id: 3, name: 'Design Services Contract', account: 'Design Studio', stage: 'qualification', value: 95000, probability: 40, expectedClose: '2024-04-10', owner: 'Sales Manager' },
                { id: 4, name: 'Startup Package', account: 'Startup Labs', stage: 'proposal', value: 45000, probability: 50, expectedClose: '2024-03-20', owner: 'Sales Rep 2' },
                { id: 5, name: 'Enterprise Integration', account: 'Enterprise Solutions', stage: 'closed_won', value: 500000, probability: 100, expectedClose: '2024-02-15', owner: 'Sales Manager' },
                { id: 6, name: 'Consulting Services', account: 'Consulting Group', stage: 'closed_lost', value: 120000, probability: 0, expectedClose: '2024-02-10', owner: 'Sales Rep 1' },
            ];
            setOpportunities(mockOpportunities);
            setLoadingData(false);
        }, 500);
    };

    const filterData = () => {
        let result = [...opportunities];

        if (filters.stage !== 'all') {
            result = result.filter(opp => opp.stage === filters.stage);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(opp =>
                opp.name.toLowerCase().includes(searchLower) ||
                opp.account.toLowerCase().includes(searchLower)
            );
        }

        setFilteredOpportunities(result);
    };

    const handleSelectionChange = (ids) => {
        setSelectedIds(ids);
    };

    const getStageColor = (stage) => {
        const colors = {
            qualification: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
            proposal: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
            negotiation: { bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' },
            closed_won: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
            closed_lost: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }
        };
        return colors[stage] || colors.qualification;
    };

    const columns = [
        {
            header: t('pages.opportunities.name', 'Opportunity'),
            field: 'name',
            sortable: true,
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.account}</div>
                </div>
            )
        },
        {
            header: t('pages.opportunities.stage', 'Stage'),
            field: 'stage',
            sortable: true,
            render: (row) => {
                const stageColor = getStageColor(row.stage);
                return (
                    <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: stageColor.bg,
                        color: stageColor.color,
                        textTransform: 'capitalize'
                    }}>
                        {row.stage.replace('_', ' ')}
                    </span>
                );
            }
        },
        {
            header: t('pages.opportunities.value', 'Value'),
            field: 'value',
            sortable: true,
            render: (row) => (
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                    ${row.value.toLocaleString()}
                </span>
            )
        },
        {
            header: t('pages.opportunities.probability', 'Probability'),
            field: 'probability',
            sortable: true,
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '60px',
                        height: '6px',
                        background: 'var(--surface-hover)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${row.probability}%`,
                            height: '100%',
                            background: row.probability >= 70 ? '#10b981' : row.probability >= 40 ? '#f59e0b' : '#ef4444',
                            transition: 'width 0.3s'
                        }}></div>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{row.probability}%</span>
                </div>
            )
        },
        {
            header: t('pages.opportunities.expectedClose', 'Expected Close'),
            field: 'expectedClose',
            sortable: true,
            render: (row) => (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {row.expectedClose}
                </span>
            )
        },
        {
            header: t('pages.opportunities.owner', 'Owner'),
            field: 'owner',
            render: (row) => (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {row.owner}
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
            title={t('pages.opportunities.title', 'Opportunities')}
            description={t('pages.opportunities.description', 'Manage sales pipeline and track deal progress')}
            icon="💼"
            breadcrumbs={[
                { label: t('modules.sales', 'Sales & CRM') },
                { label: t('pages.opportunities.title', 'Opportunities') },
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
                            {t('pages.opportunities.updateStage', 'Update Stage')} ({selectedIds.length})
                        </button>
                    )}
                    <button className="btn btn-primary">
                        + {t('pages.opportunities.addOpportunity', 'Add Opportunity')}
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
                            placeholder={t('common.search', 'Search opportunities...')}
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
                        value={filters.stage}
                        onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value }))}
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
                        <option value="all">{t('common.allStages', 'All Stages')}</option>
                        <option value="qualification">Qualification</option>
                        <option value="proposal">Proposal</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="closed_won">Closed Won</option>
                        <option value="closed_lost">Closed Lost</option>
                    </select>
                </>
            }
        >
            <DataTable
                columns={columns}
                data={filteredOpportunities}
                loading={loadingData}
                emptyMessage={t('common.noData', 'No opportunities found')}
                selectable={true}
                onSelectionChange={handleSelectionChange}
                selectedIds={selectedIds}
            />
        </PageTemplate>
    );
}
