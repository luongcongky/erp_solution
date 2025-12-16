'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import appConfig from '@/config/app.config';
import '@/styles/datatable-common.css';
import '@/app/core/users/users.css';
import { ACTION_TYPES } from '@/config/action.config';
import Modal from '@/components/Modal';

export default function UserList({ selectedCompany }) {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
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

    // Modal state
    const [showModal, setShowModal] = useState(false);
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
    const MODULE_NAME = 'COMPANY_USERS';

    useEffect(() => {
        if (selectedCompany) {
            fetchUsers();
        } else {
            setUsers([]);
            setFilteredUsers([]);
        }
    }, [selectedCompany]);

    useEffect(() => {
        // Fetch roles once or when needed
        fetchRoles();
    }, []);

    useEffect(() => {
        filterData();
    }, [users, filters]);

    const fetchUsers = async () => {
        if (!selectedCompany) return;
        setLoadingData(true);
        try {
            const res = await fetch(`/api/core/companies/${selectedCompany.id}/users`);
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
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

    const filterData = () => {
        let result = [...users];

        if (filters.role !== 'all') {
            result = result.filter(user => {
                const userRoles = user.roles || '';
                return userRoles.toLowerCase().includes(filters.role.toLowerCase());
            });
        }

        if (filters.status !== 'all') {
            const isActive = filters.status === 'active';
            result = result.filter(user => user.isActive === isActive);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(user =>
                (user.email && user.email.toLowerCase().includes(searchLower)) ||
                (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
                (user.lastName && user.lastName.toLowerCase().includes(searchLower))
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
            let aVal = a[sortColumn];
            let bVal = b[sortColumn];

            // Handle specific columns
            if (sortColumn === 'name') {
                aVal = `${a.firstName || ''} ${a.lastName || ''}`.trim();
                bVal = `${b.firstName || ''} ${b.lastName || ''}`.trim();
            }

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Paginate
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

    const handleAddUser = () => {
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
        setShowModal(true);
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

        if (!formData.password || formData.password.trim() === '') {
            errors.password = 'Password is required for new users';
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleRoleToggle = (roleId) => {
        setFormData(prev => {
            const roleIds = prev.roleIds.includes(roleId)
                ? prev.roleIds.filter(id => id !== roleId)
                : [...prev.roleIds, roleId];
            return { ...prev, roleIds };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCompany) return;

        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const payload = {
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                password: formData.password,
                roleIds: formData.roleIds,
                isActive: formData.isActive
            };

            const res = await fetch(`/api/core/companies/${selectedCompany.id}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                // Refresh list or add partially (re-fetching is safer for DB defaults)
                await fetchUsers();
                setShowModal(false);
                setFormData({
                    email: '',
                    firstName: '',
                    lastName: '',
                    password: '',
                    roleIds: [],
                    isActive: true
                });
            } else {
                setFormErrors({ submit: data.error || 'Failed to save user' });
            }
        } catch (error) {
            console.error('Error creating user:', error);
            setFormErrors({ submit: 'An error occurred while saving the user' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetPassword = async (userId) => {
        if (!confirm('Reset password to default (123456)?')) return;

        try {
            const res = await fetch(`/api/core/users/${userId}/reset-password`, {
                method: 'POST'
            });
            const data = await res.json();
            if (data.success) {
                alert('Password reset successfully to: 123456');
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            alert('Failed to reset password');
        }
    };

    if (!selectedCompany) {
        return (
            <div className="card" style={{ height: '100%' }}>
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        <p>Select a company to view users</p>
                    </div>
                </div>
            </div>
        );
    }

    if (loadingTranslations) return null;

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header Actions & Filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
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
                            onClick={() => setFilters({ search: '', role: 'all', status: 'all' })}
                            className="clearFiltersBtn"
                        >
                            {t('pages.users.clearFilters', 'Clear Filters')}
                        </button>
                    )}
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleAddUser}
                >
                    + {t('pages.users.addUser', 'Add User')}
                </button>
            </div>

            {/* DataTable */}
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
                                <th className="tableHeaderCell noSort">
                                    {t('pages.users.table.actions', 'ACTIONS')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingData ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                                        Loading users...
                                    </td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((user, index) => (
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
                                                    {(user.firstName || user.email).charAt(0).toUpperCase()}
                                                </div>
                                                <div className="userName">
                                                    {[user.firstName, user.lastName].filter(Boolean).join(' ') || '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="tableCell userEmail">
                                            {user.email}
                                        </td>
                                        <td className="tableCell">
                                            <div className="roleContainer">
                                                {user.roles && user.roles !== 'No roles' ? (
                                                    user.roles.split(', ').map((role, idx) => (
                                                        <span key={idx} className={`roleBadge ${role.toLowerCase().replace(/\s+/g, '-')}`}>
                                                            {role}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="roleBadge no-role">No roles</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="tableCell">
                                            <div className="statusPill">
                                                <div className={`statusDot ${user.isActive ? 'active' : 'inactive'}`}></div>
                                                <span className={`statusText ${user.isActive ? 'active' : 'inactive'}`}>
                                                    {user.isActive ? t('pages.users.active', 'Active') : t('pages.users.inactive', 'Inactive')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="tableCell">
                                            <button
                                                className="btn btn-sm btn-outline"
                                                onClick={() => handleResetPassword(user.id)}
                                                title="Reset password to 123456"
                                                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                            >
                                                Reset Password
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="paginationContainer">
                    <div className="paginationInfo">
                        {t('common.pagination.showing', 'Showing')} {Math.min(startIndex + 1, sortedData.length)} {t('common.pagination.to', 'to')} {Math.min(startIndex + pageSize, sortedData.length)} {t('common.pagination.of', 'of')} {sortedData.length} {t('common.pagination.results', 'results')}
                    </div>
                    <div className="paginationControls">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`pageNumber ${pageNum === currentPage ? 'active' : ''}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="paginationButton"
                        >
                            {t('common.pagination.next', 'Next')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Add New User"
                maxWidth="650px"
                footer={
                    <>
                        <button
                            type="button"
                            className="btn secondary"
                            onClick={() => setShowModal(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn primary"
                            disabled={submitting}
                            onClick={handleSubmit}
                        >
                            {submitting ? 'Creating...' : 'Create User'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit}>
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
                                Password <span className="required">*</span>
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
        </div>
    );
}
