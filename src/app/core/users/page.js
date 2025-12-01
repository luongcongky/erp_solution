'use client';

import PageTemplate from '@/components/PageTemplate';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import appConfig from '@/config/app.config';
import '@/styles/datatable-common.css';
import './users.css';
import { useEventTracking } from '@/hooks/useEventTracking';
import { ACTION_TYPES } from '@/config/action.config';
import Modal from '@/components/Modal';

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
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        roleIds: [],
        isActive: true
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const { t, loading: loadingTranslations } = useTranslations();
    const { trackEvent } = useEventTracking();
    const MODULE_NAME = 'USERS';

    useEffect(() => {
        fetchUsers();
        fetchRoles();
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

    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/roles');
            const result = await response.json();
            if (result.success) {
                setAvailableRoles(result.data);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const handleAddUser = () => {
        setEditingUser(null);
        setFormData({
            email: '',
            firstName: '',
            lastName: '',
            password: '',
            roleIds: [],
            isActive: true
        });
        setFormErrors({});
        setShowPassword(false);
        setShowUserModal(true);

        trackEvent({
            action: ACTION_TYPES.CREATE,
            module: MODULE_NAME,
            object_type: 'User',
            details: 'Opened Add User modal'
        });
    };

    const handleEditUser = async (user) => {
        setEditingUser(user);

        // Fetch user's current roles
        try {
            const response = await fetch(`/api/users/${user.id}/roles`);
            const result = await response.json();
            const userRoleIds = result.success ? result.data.map(r => r.id) : [];

            setFormData({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName || '',
                password: '',
                roleIds: userRoleIds,
                isActive: user.isActive
            });
        } catch (error) {
            setFormData({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName || '',
                password: '',
                roleIds: [],
                isActive: user.isActive
            });
        }

        setFormErrors({});
        setShowPassword(false);
        setShowUserModal(true);

        trackEvent({
            action: ACTION_TYPES.UPDATE,
            module: MODULE_NAME,
            object_id: user.id,
            object_type: 'User',
            details: `Opened Edit User modal for ${user.email}`
        });
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.email || formData.email.trim() === '') {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format';
        }

        if (!formData.firstName || formData.firstName.trim() === '') {
            errors.firstName = 'First name is required';
        }

        if (!editingUser && (!formData.password || formData.password.trim() === '')) {
            errors.password = 'Password is required for new users';
        } else if (formData.password && formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitUser = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
            const method = editingUser ? 'PUT' : 'POST';

            const payload = {
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                roleIds: formData.roleIds,
                isActive: formData.isActive
            };

            // Only include password if it's provided
            if (formData.password) {
                payload.password = formData.password;
            }

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                await fetchUsers();
                setShowUserModal(false);

                trackEvent({
                    action: editingUser ? ACTION_TYPES.UPDATE : ACTION_TYPES.CREATE,
                    module: MODULE_NAME,
                    object_id: result.data.id,
                    object_type: 'User',
                    details: editingUser
                        ? `Updated user: ${formData.email}`
                        : `Created user: ${formData.email}`
                });
            } else {
                setFormErrors({ submit: result.error || 'Failed to save user' });
            }
        } catch (error) {
            console.error('Error saving user:', error);
            setFormErrors({ submit: 'An error occurred while saving the user' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleRoleToggle = (roleId) => {
        setFormData(prev => {
            const roleIds = prev.roleIds.includes(roleId)
                ? prev.roleIds.filter(id => id !== roleId)
                : [...prev.roleIds, roleId];
            return { ...prev, roleIds };
        });
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
        <>
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
                            onClick={handleAddUser}
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
                                            <div className="roleContainer">
                                                {user.role.split(', ').map((role, idx) => (
                                                    <span key={idx} className={`roleBadge ${role.toLowerCase().replace(/\s+/g, '-')}`}>
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
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
                                                onClick={() => handleEditUser(user)}
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

            {/* Add/Edit User Modal */}
            {/* Add/Edit User Modal */}
            <Modal
                isOpen={showUserModal}
                onClose={() => setShowUserModal(false)}
                title={editingUser ? 'Edit User' : 'Add New User'}
                maxWidth="650px"
                footer={
                    <>
                        <button
                            type="button"
                            className="btn secondary"
                            onClick={() => setShowUserModal(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn primary"
                            disabled={submitting}
                            onClick={handleSubmitUser}
                        >
                            {submitting ? 'Saving...' : (editingUser ? 'Save Changes' : 'Create User')}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmitUser}>
                    {formErrors.submit && (
                        <div className="errorMessage">{formErrors.submit}</div>
                    )}

                    <div className="formGrid">
                        <div className="formGroup fullWidth">
                            <label htmlFor="email">
                                Email <span className="required">*</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                className={`formInput ${formErrors.email ? 'error' : ''}`}
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="user@example.com"
                                disabled={submitting}
                            />
                            {formErrors.email && (
                                <span className="fieldError">{formErrors.email}</span>
                            )}
                        </div>

                        <div className="formGroup">
                            <label htmlFor="firstName">
                                First Name <span className="required">*</span>
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                className={`formInput ${formErrors.firstName ? 'error' : ''}`}
                                value={formData.firstName}
                                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                placeholder="John"
                                disabled={submitting}
                            />
                            {formErrors.firstName && (
                                <span className="fieldError">{formErrors.firstName}</span>
                            )}
                        </div>

                        <div className="formGroup">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                id="lastName"
                                type="text"
                                className="formInput"
                                value={formData.lastName}
                                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                placeholder="Doe"
                                disabled={submitting}
                            />
                        </div>

                        <div className="formGroup fullWidth">
                            <label htmlFor="password">
                                Password {!editingUser && <span className="required">*</span>}
                                {editingUser && <span style={{ fontSize: '0.875rem', color: '#6b7280' }}> (leave blank to keep current)</span>}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className={`formInput ${formErrors.password ? 'error' : ''}`}
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    placeholder="Min 8 characters"
                                    disabled={submitting}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#6b7280'
                                    }}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {formErrors.password && (
                                <span className="fieldError">{formErrors.password}</span>
                            )}
                        </div>
                    </div>

                    <div className="formGroup" style={{ marginTop: '1.5rem' }}>
                        <label>Roles</label>
                        <div className="roleSelection">
                            {availableRoles.map(role => (
                                <label key={role.id} className="roleCheckbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.roleIds.includes(role.id)}
                                        onChange={() => handleRoleToggle(role.id)}
                                        disabled={submitting}
                                    />
                                    <span>{role.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="formGroup" style={{ marginTop: '1.5rem' }}>
                        <div className="statusToggle">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                    disabled={submitting}
                                />
                                <span className="slider"></span>
                            </label>
                            <span style={{ fontWeight: '500' }}>
                                {formData.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </form>
            </Modal>
        </>
    );
}
