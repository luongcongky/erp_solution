'use client';

import PageTemplate from '@/components/PageTemplate';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useEventTracking } from '@/hooks/useEventTracking';
import { ACTION_TYPES } from '@/config/action.config';
import appConfig from '@/config/app.config';
import '@/styles/datatable-common.css';
import './roles.css';

export default function RolesPage() {
    const [roles, setRoles] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(appConfig.pagination.defaultPageSize);
    const [filters, setFilters] = useState({
        userCount: 'all',
        type: 'all'
    });
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedRoleUsers, setSelectedRoleUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [selectedRoleName, setSelectedRoleName] = useState('');
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const { t, loading: loadingTranslations } = useTranslations();
    const { trackEvent } = useEventTracking();
    const MODULE_NAME = 'ROLES';

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/roles');
            const data = await response.json();
            if (data.success) {
                setRoles(data.data);
            }
            setLoadingData(false);
        } catch (error) {
            console.error('Error fetching roles:', error);
            setLoadingData(false);
        }
    };

    const handleUserCountClick = async (role) => {
        if (role.usersCount === 0) return;

        setSelectedRoleId(role.id);
        setSelectedRoleName(role.name);
        setShowUserModal(true);
        setLoadingUsers(true);
        setSelectedRoleUsers([]); // Clear previous data

        try {
            const response = await fetch(`/api/roles/${role.id}/users`);
            const result = await response.json();
            if (result.success) {
                setSelectedRoleUsers(result.data);
            }
        } catch (error) {
            console.error('Error fetching role users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleRemoveUser = async (user) => {
        if (!confirm(`Are you sure you want to remove ${user.firstName || user.email} from this role?`)) return;

        try {
            const response = await fetch(`/api/roles/${selectedRoleId}/users/${user.id}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (result.success) {
                // Update modal list
                setSelectedRoleUsers(prev => prev.filter(u => u.id !== user.id));

                // Update roles list count
                setRoles(prev => prev.map(r => {
                    if (r.id === selectedRoleId) {
                        return { ...r, usersCount: Math.max(0, r.usersCount - 1) };
                    }
                    return r;
                }));

                trackEvent({
                    action: ACTION_TYPES.UPDATE,
                    module: MODULE_NAME,
                    object_id: selectedRoleId,
                    object_type: 'Role',
                    details: `Removed user ${user.email} from role ${selectedRoleName}`,
                    changes: { removed_user_id: user.id }
                });
            }
        } catch (error) {
            console.error('Error removing user from role:', error);
        }
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
            details: `Sorted roles by ${column} ${newDirection}`,
            changes: { column, direction: newDirection }
        });
    };

    // Filter data
    let filteredData = [...roles];

    // Text search
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(role =>
            role.name.toLowerCase().includes(searchLower) ||
            role.description.toLowerCase().includes(searchLower)
        );
    }

    // User count filter
    if (filters.userCount !== 'all') {
        filteredData = filteredData.filter(role => {
            const count = role.usersCount;
            switch (filters.userCount) {
                case 'empty': return count === 0;
                case 'small': return count >= 1 && count <= 5;
                case 'medium': return count >= 6 && count <= 20;
                case 'large': return count > 20;
                default: return true;
            }
        });
    }

    // Type filter
    if (filters.type !== 'all') {
        filteredData = filteredData.filter(role =>
            filters.type === 'system' ? role.isSystem : !role.isSystem
        );
    }

    // Sort data
    let sortedData = [...filteredData];
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
        <>
            <PageTemplate
                title={t('pages.roles.title', 'Roles & Permissions')}
                breadcrumbs={[
                    { label: t('modules.core', 'Core') },
                    { label: t('pages.roles.title', 'Roles') },
                ]}
                actions={
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            trackEvent({
                                action: ACTION_TYPES.CREATE,
                                module: MODULE_NAME,
                                object_type: 'Role',
                                details: 'Clicked Add Role button'
                            });
                        }}
                    >
                        + {t('pages.roles.addRole', 'Add Role')}
                    </button>
                }
                filters={
                    <div className="filterBar">
                        <div className="searchInputWrapper">
                            <span className="searchIcon">🔍</span>
                            <input
                                type="text"
                                placeholder={t('common.search', 'Search roles...')}
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="searchInput"
                            />
                        </div>

                        <select
                            value={filters.userCount}
                            onChange={(e) => setFilters(prev => ({ ...prev, userCount: e.target.value }))}
                            className="filterSelect"
                        >
                            <option value="all">{t('common.allUserCounts', 'All User Counts')}</option>
                            <option value="empty">{t('common.emptyUsers', 'Empty (0 users)')}</option>
                            <option value="small">{t('common.smallUsers', 'Small (1-5 users)')}</option>
                            <option value="medium">{t('common.mediumUsers', 'Medium (6-20 users)')}</option>
                            <option value="large">{t('common.largeUsers', 'Large (>20 users)')}</option>
                        </select>

                        <select
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                            className="filterSelect"
                        >
                            <option value="all">{t('common.allTypes', 'All Types')}</option>
                            <option value="system">{t('common.systemRoles', 'System Roles')}</option>
                            <option value="custom">{t('common.customRoles', 'Custom Roles')}</option>
                        </select>

                        {(filters.search || filters.userCount !== 'all' || filters.type !== 'all') && (
                            <button
                                onClick={() => {
                                    setFilters({ search: '', userCount: 'all', type: 'all' });
                                    trackEvent({
                                        action: ACTION_TYPES.FILTER,
                                        module: MODULE_NAME,
                                        details: 'Cleared all filters'
                                    });
                                }}
                                className="clearFiltersBtn"
                            >
                                {t('pages.roles.clearFilters', 'Clear Filters')}
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
                                    <th className="tableHeaderCell" onClick={() => handleSort('name')}>
                                        <div className="tableHeaderContent">
                                            {t('pages.roles.table.name', 'ROLE NAME')}
                                            {sortColumn === 'name' && (
                                                <span style={{ fontSize: '0.75rem' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="tableHeaderCell" onClick={() => handleSort('description')}>
                                        <div className="tableHeaderContent">
                                            {t('pages.roles.table.description', 'DESCRIPTION')}
                                            {sortColumn === 'description' && (
                                                <span style={{ fontSize: '0.75rem' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="tableHeaderCell" onClick={() => handleSort('usersCount')}>
                                        <div className="tableHeaderContent">
                                            {t('pages.roles.table.usersCount', 'USERS')}
                                            {sortColumn === 'usersCount' && (
                                                <span style={{ fontSize: '0.75rem' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="tableHeaderCell noSort">
                                        {t('pages.roles.table.actions', 'ACTIONS')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((role, index) => (
                                    <tr
                                        key={role.id}
                                        className={`tableRow ${index % 2 === 0 ? 'even' : 'odd'}`}
                                    >
                                        <td className="tableCell">
                                            <div className="roleNameCell">
                                                <div className="avatar">
                                                    {role.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className={`roleBadge ${role.name.toLowerCase()}`}>
                                                    {role.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="tableCell roleDescription">
                                            {role.description}
                                        </td>
                                        <td className="tableCell">
                                            <div
                                                className={`usersCount ${role.usersCount > 0 ? 'clickable' : ''}`}
                                                onClick={() => handleUserCountClick(role)}
                                                style={{ cursor: role.usersCount > 0 ? 'pointer' : 'default' }}
                                            >
                                                <span style={{ fontSize: '1rem' }}>👥</span>
                                                <span className="usersCountNumber">{role.usersCount}</span>
                                            </div>
                                        </td>
                                        <td className="tableCell">
                                            <div className="actionButtons">
                                                <button
                                                    className="editButton"
                                                    onClick={() => {
                                                        trackEvent({
                                                            action: ACTION_TYPES.UPDATE,
                                                            module: MODULE_NAME,
                                                            object_id: role.id,
                                                            object_type: 'Role',
                                                            details: `Clicked edit for role: ${role.name}`
                                                        });
                                                    }}
                                                >
                                                    {t('common.edit', 'Edit')}
                                                </button>
                                                {!role.isSystem && (
                                                    <button
                                                        className="deleteButton"
                                                        onClick={() => {
                                                            trackEvent({
                                                                action: ACTION_TYPES.DELETE,
                                                                module: MODULE_NAME,
                                                                object_id: role.id,
                                                                object_type: 'Role',
                                                                details: `Clicked delete for role: ${role.name}`
                                                            });
                                                        }}
                                                    >
                                                        {t('common.delete', 'Delete')}
                                                    </button>
                                                )}
                                            </div>
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

            {/* Users List Modal */}
            {
                showUserModal && (
                    <div className="modalOverlay" onClick={() => setShowUserModal(false)}>
                        <div className="modalContent userListModal" onClick={(e) => e.stopPropagation()}>
                            <div className="modalHeader">
                                <h3>Users with role: {selectedRoleName}</h3>
                                <button className="modalClose" onClick={() => setShowUserModal(false)}>×</button>
                            </div>
                            <div className="modalBody">
                                {loadingUsers ? (
                                    <div className="loadingState">Loading users...</div>
                                ) : selectedRoleUsers.length === 0 ? (
                                    <div className="emptyState">No users found with this role.</div>
                                ) : (
                                    <div className="userList">
                                        <table className="userListTable">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedRoleUsers.map(user => (
                                                    <tr key={user.id}>
                                                        <td>
                                                            <div className="userInfo">
                                                                <div className="userAvatar">
                                                                    {(user.firstName || user.email).charAt(0).toUpperCase()}
                                                                </div>
                                                                <span>{user.firstName} {user.lastName}</span>
                                                            </div>
                                                        </td>
                                                        <td>{user.email}</td>
                                                        <td>
                                                            <span className={`statusBadge ${user.isActive ? 'active' : 'inactive'}`}>
                                                                {user.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn-icon delete"
                                                                onClick={() => handleRemoveUser(user)}
                                                                title="Remove from role"
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    color: '#ef4444',
                                                                    padding: '4px',
                                                                    borderRadius: '4px'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                                                                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                                            >
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            <div className="modalFooter">
                                <button className="btn secondary" onClick={() => setShowUserModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}
