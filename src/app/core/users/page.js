'use client';

import PageTemplate from '@/components/PageTemplate';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import appConfig from '@/config/app.config';
import '@/styles/datatable-common.css';
import './users.css';
import { useEventTracking } from '@/hooks/useEventTracking';
import { ACTION_TYPES } from '@/config/action.config';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(appConfig.pagination.defaultPageSize);
    const [filters, setFilters] = useState({
        role: 'all',
        status: 'all',
        search: ''
    });
    const { t, loading: loadingTranslations } = useTranslations();
    const { trackEvent } = useEventTracking();
    const MODULE_NAME = 'USERS';

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterData();
    }, [users, filters]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users');
            const result = await response.json();

            if (result.success) {
                setUsers(result.data);
            } else {
                console.error('Error fetching users:', result.error);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const filterData = () => {
        let result = [...users];

        if (filters.role !== 'all') {
            result = result.filter(user => user.role.toLowerCase() === filters.role.toLowerCase());
        }

        if (filters.status !== 'all') {
            result = result.filter(user => user.status === filters.status);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(user =>
                user.name.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower)
            );
        }

        setFilteredUsers(result);
    };

    const handleSort = (column) => {
        let newDirection = 'asc';
        if (sortColumn === column) {
            newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            setSortDirection(newDirection);
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }

        trackEvent({
            action: ACTION_TYPES.SORT,
            module: MODULE_NAME,
            details: `Sorted users by ${column} ${newDirection}`,
            changes: { column, direction: newDirection }
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(filteredUsers.map(user => user.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Sort data
    let sortedData = [...filteredUsers];
    if (sortColumn) {
        sortedData.sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Paginate
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

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
            breadcrumbs={[
                { label: t('modules.core', 'Core') },
                { label: t('pages.users.title', 'Users') },
            ]}
            actions={
                <div style={{ display: 'flex', gap: '8px' }}>
                    {selectedIds.length > 0 && (
                        <button
                            className="btn"
                            style={{
                                background: '#EF4444',
                                color: 'white',
                                border: 'none'
                            }}
                        >
                            {t('common.delete', 'Delete')} ({selectedIds.length})
                        </button>
                    )}
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            trackEvent({
                                action: ACTION_TYPES.CREATE,
                                module: MODULE_NAME,
                                object_type: 'User',
                                details: 'Clicked Add User button'
                            });
                        }}
                    >
                        + {t('pages.users.addUser', 'Add User')}
                    </button>
                </div>
            }
            filters={
                <div className="filterBar">
                    <div className="searchInputWrapper">
                        <span className="searchIcon">🔍</span>
                        <input
                            type="text"
                            placeholder={t('common.search', 'Search users...')}
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="searchInput"
                        />
                    </div>

                    <select
                        value={filters.role}
                        onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                        className="filterSelect"
                    >
                        <option value="all">{t('common.allRoles', 'All Roles')}</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="filterSelect"
                    >
                        <option value="all">{t('common.allStatus', 'All Status')}</option>
                        <option value="active">{t('pages.users.active', 'Active')}</option>
                        <option value="inactive">{t('pages.users.inactive', 'Inactive')}</option>
                    </select>

                    {(filters.search || filters.role !== 'all' || filters.status !== 'all') && (
                        <button
                            onClick={() => {
                                setFilters({ search: '', role: 'all', status: 'all' });
                                trackEvent({
                                    action: ACTION_TYPES.FILTER,
                                    module: MODULE_NAME,
                                    details: 'Cleared all filters'
                                });
                            }}
                            className="clearFiltersBtn"
                        >
                            {t('pages.users.clearFilters', 'Clear Filters')}
                        </button>
                    )}
                </div>
            }
        >
            {/* Custom DataTable */}
            <div className="tableContainer">
                <div style={{ overflowX: 'auto' }}>
                    <table className="dataTable">
                        <thead className="tableHeader">
                            <tr>
                                <th className="checkboxCell">
                                    <input
                                        type="checkbox"
                                        checked={filteredUsers.length > 0 && selectedIds.length === filteredUsers.length}
                                        onChange={handleSelectAll}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </th>
                                <th className="tableHeaderCell" onClick={() => handleSort('name')}>
                                    <div className="tableHeaderContent">
                                        {t('pages.users.table.name', 'NAME')}
                                        {sortColumn === 'name' && (
                                            <span style={{ fontSize: '0.75rem' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="tableHeaderCell" onClick={() => handleSort('email')}>
                                    <div className="tableHeaderContent">
                                        {t('pages.users.table.email', 'EMAIL')}
                                        {sortColumn === 'email' && (
                                            <span style={{ fontSize: '0.75rem' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="tableHeaderCell" onClick={() => handleSort('role')}>
                                    <div className="tableHeaderContent">
                                        {t('pages.users.table.role', 'ROLE')}
                                        {sortColumn === 'role' && (
                                            <span style={{ fontSize: '0.75rem' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="tableHeaderCell" onClick={() => handleSort('status')}>
                                    <div className="tableHeaderContent">
                                        {t('pages.users.table.status', 'STATUS')}
                                        {sortColumn === 'status' && (
                                            <span style={{ fontSize: '0.75rem' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="tableHeaderCell" onClick={() => handleSort('lastLogin')}>
                                    <div className="tableHeaderContent">
                                        {t('pages.users.table.lastLogin', 'LAST LOGIN')}
                                        {sortColumn === 'lastLogin' && (
                                            <span style={{ fontSize: '0.75rem' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="tableHeaderCell noSort">
                                    {t('pages.users.table.actions', 'ACTIONS')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((user, index) => (
                                <tr
                                    key={user.id}
                                    className={`tableRow ${selectedIds.includes(user.id) ? 'selected' : (index % 2 === 0 ? 'even' : 'odd')}`}
                                >
                                    <td className="checkboxCell">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(user.id)}
                                            onChange={() => handleSelectRow(user.id)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </td>
                                    <td className="tableCell">
                                        <div className="userNameCell">
                                            <div className="avatar">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="userName">{user.name}</div>
                                        </div>
                                    </td>
                                    <td className="tableCell userEmail">
                                        {user.email}
                                    </td>
                                    <td className="tableCell">
                                        <span className={`roleBadge ${user.role.toLowerCase().replace(/\s+/g, '-')}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="tableCell">
                                        <div className="statusPill">
                                            <div className={`statusDot ${user.status}`}></div>
                                            <span className={`statusText ${user.status}`}>
                                                {user.status === 'active' ? t('pages.users.active', 'Active') : t('pages.users.inactive', 'Inactive')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="tableCell lastLogin">
                                        {user.lastLogin}
                                    </td>
                                    <td className="tableCell">
                                        <button
                                            className="editButton"
                                            onClick={() => {
                                                trackEvent({
                                                    action: ACTION_TYPES.UPDATE,
                                                    module: MODULE_NAME,
                                                    object_id: user.id,
                                                    object_type: 'User',
                                                    details: `Clicked edit for user: ${user.name}`
                                                });
                                            }}
                                        >
                                            {t('pages.users.edit', 'Edit')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="paginationContainer">
                    <div className="paginationInfo">
                        {t('common.pagination.showing', 'Showing')} {startIndex + 1} {t('common.pagination.to', 'to')} {Math.min(startIndex + pageSize, sortedData.length)} {t('common.pagination.of', 'of')} {sortedData.length} {t('common.pagination.results', 'results')}
                    </div>
                    <div className="paginationControls">
                        <button
                            onClick={() => {
                                setCurrentPage(p => Math.max(1, p - 1));
                                trackEvent({
                                    action: ACTION_TYPES.NAVIGATE,
                                    module: MODULE_NAME,
                                    details: 'Navigated to previous page'
                                });
                            }}
                            disabled={currentPage === 1}
                            className="paginationButton"
                        >
                            {t('common.pagination.previous', 'Previous')}
                        </button>
                        <div className="paginationNumbers">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum = i + 1;
                                if (totalPages > 5 && currentPage > 3) {
                                    pageNum = currentPage - 2 + i;
                                }
                                if (pageNum > totalPages) return null;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => {
                                            setCurrentPage(pageNum);
                                            trackEvent({
                                                action: ACTION_TYPES.NAVIGATE,
                                                module: MODULE_NAME,
                                                details: `Navigated to page ${pageNum}`
                                            });
                                        }}
                                        className={`pageNumber ${pageNum === currentPage ? 'active' : ''}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => {
                                setCurrentPage(p => Math.min(totalPages, p + 1));
                                trackEvent({
                                    action: ACTION_TYPES.NAVIGATE,
                                    module: MODULE_NAME,
                                    details: 'Navigated to next page'
                                });
                            }}
                            disabled={currentPage === totalPages}
                            className="paginationButton"
                        >
                            {t('common.pagination.next', 'Next')}
                        </button>
                    </div>
                </div>
            </div>
        </PageTemplate>
    );
}
