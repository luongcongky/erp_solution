'use client';

import PageTemplate from '@/components/PageTemplate';
import DataTable from '@/components/DataTable';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { SearchIcon } from '@/components/icons';

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        search: ''
    });
    const { t, loading: loadingTranslations } = useTranslations();

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        filterData();
    }, [tasks, filters]);

    const fetchTasks = async () => {
        // Simulate API call
        setTimeout(() => {
            const mockTasks = [
                { id: 1, title: 'Design homepage mockup', project: 'Website Redesign', assignee: 'Sarah Designer', status: 'in_progress', priority: 'high', dueDate: '2024-02-25', estimatedHours: 8, actualHours: 5 },
                { id: 2, title: 'Implement user authentication', project: 'Mobile App Development', assignee: 'Mike Developer', status: 'in_progress', priority: 'high', dueDate: '2024-02-28', estimatedHours: 16, actualHours: 12 },
                { id: 3, title: 'Write API documentation', project: 'Mobile App Development', assignee: 'John Writer', status: 'todo', priority: 'medium', dueDate: '2024-03-05', estimatedHours: 12, actualHours: 0 },
                { id: 4, title: 'Database schema design', project: 'ERP Implementation', assignee: 'Bob Architect', status: 'completed', priority: 'high', dueDate: '2024-02-20', estimatedHours: 20, actualHours: 22 },
                { id: 5, title: 'Paint office walls', project: 'Office Renovation', assignee: 'Charlie Painter', status: 'completed', priority: 'low', dueDate: '2024-01-30', estimatedHours: 24, actualHours: 20 },
                { id: 6, title: 'Create social media content', project: 'Marketing Campaign Q1', assignee: 'Diana Marketer', status: 'blocked', priority: 'medium', dueDate: '2024-02-22', estimatedHours: 6, actualHours: 2 },
            ];
            setTasks(mockTasks);
            setLoadingData(false);
        }, 500);
    };

    const filterData = () => {
        let result = [...tasks];

        if (filters.status !== 'all') {
            result = result.filter(task => task.status === filters.status);
        }

        if (filters.priority !== 'all') {
            result = result.filter(task => task.priority === filters.priority);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(task =>
                task.title.toLowerCase().includes(searchLower) ||
                task.project.toLowerCase().includes(searchLower) ||
                task.assignee.toLowerCase().includes(searchLower)
            );
        }

        setFilteredTasks(result);
    };

    const handleSelectionChange = (ids) => {
        setSelectedIds(ids);
    };

    const getStatusColor = (status) => {
        const colors = {
            todo: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' },
            in_progress: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
            blocked: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
            completed: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }
        };
        return colors[status] || colors.todo;
    };

    const columns = [
        {
            header: t('pages.tasks.title', 'Task'),
            field: 'title',
            sortable: true,
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.project}</div>
                </div>
            )
        },
        {
            header: t('pages.tasks.assignee', 'Assignee'),
            field: 'assignee',
            sortable: true,
            render: (row) => (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{row.assignee}</span>
            )
        },
        {
            header: t('pages.tasks.status', 'Status'),
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
            header: t('pages.tasks.priority', 'Priority'),
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
            header: t('pages.tasks.dueDate', 'Due Date'),
            field: 'dueDate',
            sortable: true,
            render: (row) => {
                const isOverdue = new Date(row.dueDate) < new Date() && row.status !== 'completed';
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
            header: t('pages.tasks.hours', 'Hours'),
            field: 'actualHours',
            sortable: true,
            render: (row) => (
                <div style={{ fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: 600, color: row.actualHours > row.estimatedHours ? '#ef4444' : 'var(--text-primary)' }}>
                        {row.actualHours}h
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}> / {row.estimatedHours}h</span>
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
                        {t('common.edit', 'Edit')}
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
            title={t('pages.tasks.title', 'Tasks')}
            description={t('pages.tasks.description', 'Manage project tasks and track team workload')}
            icon="✅"
            breadcrumbs={[
                { label: t('modules.projects', 'Projects') },
                { label: t('pages.tasks.title', 'Tasks') },
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
                            {t('pages.tasks.updateStatus', 'Update Status')} ({selectedIds.length})
                        </button>
                    )}
                    <button className="btn btn-primary">
                        + {t('pages.tasks.addTask', 'New Task')}
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
                            placeholder={t('common.search', 'Search tasks...')}
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
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="blocked">Blocked</option>
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
                data={filteredTasks}
                loading={loadingData}
                emptyMessage={t('common.noData', 'No tasks found')}
                selectable={true}
                onSelectionChange={handleSelectionChange}
                selectedIds={selectedIds}
            />
        </PageTemplate>
    );
}
