'use client';

import PageTemplate from '@/components/PageTemplate';
import DataTable from '@/components/DataTable';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { SearchIcon } from '@/components/icons';

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [filters, setFilters] = useState({
        department: 'all',
        status: 'all',
        search: ''
    });
    const { t, loading: loadingTranslations } = useTranslations();

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        filterData();
    }, [employees, filters]);

    const fetchEmployees = async () => {
        // Simulate API call
        setTimeout(() => {
            const mockEmployees = [
                { id: 1, employeeId: 'EMP-001', name: 'John Doe', email: 'john.doe@company.com', phone: '+1-555-0101', department: 'IT', position: 'Senior Developer', status: 'active', hireDate: '2020-03-15', salary: 85000 },
                { id: 2, employeeId: 'EMP-002', name: 'Jane Smith', email: 'jane.smith@company.com', phone: '+1-555-0102', department: 'Sales', position: 'Sales Manager', status: 'active', hireDate: '2019-06-01', salary: 75000 },
                { id: 3, employeeId: 'EMP-003', name: 'Bob Wilson', email: 'bob.wilson@company.com', phone: '+1-555-0103', department: 'Operations', position: 'Operations Lead', status: 'active', hireDate: '2021-01-10', salary: 70000 },
                { id: 4, employeeId: 'EMP-004', name: 'Alice Brown', email: 'alice.brown@company.com', phone: '+1-555-0104', department: 'HR', position: 'HR Specialist', status: 'on_leave', hireDate: '2022-04-20', salary: 55000 },
                { id: 5, employeeId: 'EMP-005', name: 'Charlie Davis', email: 'charlie.davis@company.com', phone: '+1-555-0105', department: 'Finance', position: 'Accountant', status: 'terminated', hireDate: '2018-09-12', salary: 60000 },
            ];
            setEmployees(mockEmployees);
            setLoadingData(false);
        }, 500);
    };

    const filterData = () => {
        let result = [...employees];

        if (filters.department !== 'all') {
            result = result.filter(emp => emp.department === filters.department);
        }

        if (filters.status !== 'all') {
            result = result.filter(emp => emp.status === filters.status);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(emp =>
                emp.name.toLowerCase().includes(searchLower) ||
                emp.employeeId.toLowerCase().includes(searchLower) ||
                emp.email.toLowerCase().includes(searchLower)
            );
        }

        setFilteredEmployees(result);
    };

    const handleSelectionChange = (ids) => {
        setSelectedIds(ids);
    };

    const getStatusColor = (status) => {
        const colors = {
            active: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
            on_leave: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
            terminated: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }
        };
        return colors[status] || colors.active;
    };

    const columns = [
        {
            header: t('pages.employees.id', 'Employee ID'),
            field: 'employeeId',
            sortable: true,
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{row.employeeId}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.hireDate}</div>
                </div>
            )
        },
        {
            header: t('pages.employees.name', 'Name'),
            field: 'name',
            sortable: true,
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{row.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</div>
                </div>
            )
        },
        {
            header: t('pages.employees.department', 'Department'),
            field: 'department',
            sortable: true,
            render: (row) => (
                <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{row.department}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.position}</div>
                </div>
            )
        },
        {
            header: t('pages.employees.status', 'Status'),
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
            header: t('pages.employees.phone', 'Phone'),
            field: 'phone',
            render: (row) => (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {row.phone}
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
            title={t('pages.employees.title', 'Employees')}
            description={t('pages.employees.description', 'Manage employee records and information')}
            icon="👥"
            breadcrumbs={[
                { label: t('modules.hr', 'HR') },
                { label: t('pages.employees.title', 'Employees') },
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
                            {t('pages.employees.export', 'Export')} ({selectedIds.length})
                        </button>
                    )}
                    <button className="btn btn-primary">
                        + {t('pages.employees.addEmployee', 'Add Employee')}
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
                            placeholder={t('common.search', 'Search employees...')}
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
                        value={filters.department}
                        onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
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
                        <option value="all">{t('common.allDepartments', 'All Departments')}</option>
                        <option value="IT">IT</option>
                        <option value="Sales">Sales</option>
                        <option value="Operations">Operations</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
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
                        <option value="active">Active</option>
                        <option value="on_leave">On Leave</option>
                        <option value="terminated">Terminated</option>
                    </select>
                </>
            }
        >
            <DataTable
                columns={columns}
                data={filteredEmployees}
                loading={loadingData}
                emptyMessage={t('common.noData', 'No employees found')}
                selectable={true}
                onSelectionChange={handleSelectionChange}
                selectedIds={selectedIds}
            />
        </PageTemplate>
    );
}
