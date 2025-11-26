'use client';

import PageTemplate from '@/components/PageTemplate';
import DataTable from '@/components/DataTable';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { SearchIcon } from '@/components/icons';

export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        search: ''
    });
    const { t, loading: loadingTranslations } = useTranslations();

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        filterData();
    }, [projects, filters]);

    const fetchProjects = async () => {
        // Simulate API call
        setTimeout(() => {
            const mockProjects = [
                { id: 1, name: 'Website Redesign', client: 'Tech Corp', manager: 'John Doe', status: 'in_progress', priority: 'high', progress: 65, budget: 50000, spent: 32500, startDate: '2024-01-15', endDate: '2024-03-30', tasks: 24, completedTasks: 16 },
                { id: 2, name: 'Mobile App Development', client: 'Marketing Inc', manager: 'Jane Smith', status: 'in_progress', priority: 'high', progress: 40, budget: 120000, spent: 48000, startDate: '2024-02-01', endDate: '2024-06-15', tasks: 45, completedTasks: 18 },
                { id: 3, name: 'ERP Implementation', client: 'Enterprise Solutions', manager: 'Bob Wilson', status: 'planning', priority: 'medium', progress: 10, budget: 250000, spent: 25000, startDate: '2024-03-01', endDate: '2024-12-31', tasks: 120, completedTasks: 12 },
                { id: 4, name: 'Office Renovation', client: 'Internal', manager: 'Alice Brown', status: 'completed', priority: 'low', progress: 100, budget: 80000, spent: 78500, startDate: '2023-11-01', endDate: '2024-01-31', tasks: 32, completedTasks: 32 },
                { id: 5, name: 'Marketing Campaign Q1', client: 'Startup Labs', manager: 'Charlie Davis', status: 'on_hold', priority: 'medium', progress: 25, budget: 35000, spent: 8750, startDate: '2024-01-01', endDate: '2024-03-31', tasks: 18, completedTasks: 5 },
            ];
            setProjects(mockProjects);
            setLoadingData(false);
        }, 500);
    };

    const filterData = () => {
        let result = [...projects];

        if (filters.status !== 'all') {
            result = result.filter(project => project.status === filters.status);
        }

        if (filters.priority !== 'all') {
            result = result.filter(project => project.priority === filters.priority);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(project =>
                project.name.toLowerCase().includes(searchLower) ||
                project.client.toLowerCase().includes(searchLower) ||
                project.manager.toLowerCase().includes(searchLower)
            );
        }

        setFilteredProjects(result);
    };

    const handleSelectionChange = (ids) => {
        setSelectedIds(ids);
    };

    const getStatusColor = (status) => {
        const colors = {
            planning: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
            in_progress: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
            on_hold: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
            completed: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }
        };
        return colors[status] || colors.planning;
    };

    const columns = [
        {
            header: t('pages.projects.name', 'Project'),
            field: 'name',
            sortable: true,
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.client}</div>
                </div>
            )
        },
        {
            header: t('pages.projects.manager', 'Manager'),
            field: 'manager',
            sortable: true,
            render: (row) => (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{row.manager}</span>
            )
        },
        {
            header: t('pages.projects.status', 'Status'),
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
            header: t('pages.projects.progress', 'Progress'),
            field: 'progress',
            sortable: true,
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '80px',
                        height: '6px',
                        background: 'var(--surface-hover)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${row.progress}%`,
                            height: '100%',
                            background: row.progress === 100 ? '#10b981' : row.progress >= 50 ? '#f59e0b' : '#3b82f6',
                            transition: 'width 0.3s'
                        }}></div>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{row.progress}%</span>
                </div>
            )
        },
        {
            header: t('pages.projects.tasks', 'Tasks'),
            field: 'tasks',
            sortable: true,
            render: (row) => (
                <div style={{ fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.completedTasks}</span>
                    <span style={{ color: 'var(--text-muted)' }}> / {row.tasks}</span>
                </div>
            )
        },
        {
            header: t('pages.projects.budget', 'Budget'),
            field: 'budget',
            sortable: true,
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                        ${row.budget.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: row.spent > row.budget ? '#ef4444' : 'var(--text-muted)' }}>
                        Spent: ${row.spent.toLocaleString()}
                    </div>
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
            title={t('pages.projects.title', 'Projects')}
            description={t('pages.projects.description', 'Manage projects, track progress, and monitor budgets')}
            icon="📋"
            breadcrumbs={[
                { label: t('modules.projects', 'Projects') },
                { label: t('pages.projects.title', 'Projects') },
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
                            {t('pages.projects.updateStatus', 'Update Status')} ({selectedIds.length})
                        </button>
                    )}
                    <button className="btn btn-primary">
                        + {t('pages.projects.addProject', 'New Project')}
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
                            placeholder={t('common.search', 'Search projects...')}
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
                        <option value="planning">Planning</option>
                        <option value="in_progress">In Progress</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
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
                data={filteredProjects}
                loading={loadingData}
                emptyMessage={t('common.noData', 'No projects found')}
                selectable={true}
                onSelectionChange={handleSelectionChange}
                selectedIds={selectedIds}
            />
        </PageTemplate>
    );
}
