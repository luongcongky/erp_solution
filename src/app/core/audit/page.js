'use client';

import PageTemplate from '@/components/PageTemplate';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useExcelExport } from '@/hooks/useExcelExport';
import { useEventTracking } from '@/hooks/useEventTracking';
import { ACTION_TYPES } from '@/config/action.config';
import appConfig from '@/config/app.config';
import * as XLSX from 'xlsx';
import '@/styles/datatable-common.css';
import './audit.css';

export default function AuditLogsPage() {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(appConfig.pagination.defaultPageSize);
    const [filters, setFilters] = useState({
        search: '',
        action: 'all',
        resource: 'all',
        dateRange: 'all'
    });

    const { isExporting, exportProgress, exportData } = useExcelExport();
    const { t, loading: loadingTranslations } = useTranslations();
    const { trackEvent } = useEventTracking();
    const MODULE_NAME = 'AUDIT';

    // Fetch audit logs from API
    useEffect(() => {
        fetchAuditLogs();
    }, [currentPage, filters]);

    const fetchAuditLogs = async () => {
        try {
            setLoadingData(true);
            setError(null);

            // Build query parameters
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: pageSize.toString(),
            });

            if (filters.search) params.append('search', filters.search);
            if (filters.action !== 'all') params.append('action', filters.action);
            if (filters.resource !== 'all') params.append('resource', filters.resource);
            if (filters.dateRange !== 'all') params.append('dateRange', filters.dateRange);

            // Get user data from localStorage to send tenant/stage headers
            const userData = localStorage.getItem('user');
            const headers = {};
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    if (user.ten_id) headers['x-tenant-id'] = user.ten_id;
                    if (user.stg_id) headers['x-stage-id'] = user.stg_id;
                } catch (e) {
                    console.error('Error parsing user data:', e);
                }
            }

            const response = await fetch(`/api/audit?${params.toString()}`, { headers });
            const data = await response.json();

            if (data.success) {
                setAuditLogs(data.data);
                setTotalRecords(data.pagination.total);
            } else {
                setError(data.error || 'Failed to fetch audit logs');
            }
        } catch (err) {
            console.error('Error fetching audit logs:', err);
            setError('Failed to load audit logs. Please try again.');
        } finally {
            setLoadingData(false);
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
            details: `Sorted audit logs by ${column} ${newDirection}`,
            changes: { column, direction: newDirection }
        });
    };

    const handleExportClick = () => {
        trackEvent({
            action: ACTION_TYPES.EXPORT,
            module: MODULE_NAME,
            details: 'Exported audit logs to Excel',
            changes: { filters, totalRecords }
        });
        const now = new Date();
        const defaultFilename = `audit_logs_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.xlsx`;

        // Get user data for headers
        const userData = localStorage.getItem('user');
        const headers = {};
        if (userData) {
            try {
                const user = JSON.parse(userData);
                if (user.ten_id) headers['x-tenant-id'] = user.ten_id;
                if (user.stg_id) headers['x-stage-id'] = user.stg_id;
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }

        exportData({
            fileName: defaultFilename,
            apiEndpoint: '/api/audit',
            filters: filters,
            headers: headers,
            sheetName: 'Audit Logs',
            columnWidths: [
                { wch: 20 }, // Timestamp
                { wch: 25 }, // User
                { wch: 12 }, // Action
                { wch: 15 }, // Resource
                { wch: 18 }, // IP Address
                { wch: 50 }  // Details
            ],
            transformData: (log) => ({
                'Thời gian': log.timestamp,
                'Người dùng': log.user,
                'Hành động': log.action,
                'Tài nguyên': log.resource,
                'Địa chỉ IP': log.ip,
                'Chi tiết': log.details
            }),
            onSuccess: (count) => {
                alert(t('pages.audit.export.success', `Xuất file thành công! Đã xuất ${count} bản ghi.`));
            },
            onError: (message) => {
                alert(message === 'No data to export'
                    ? t('pages.audit.export.noData', 'Không có dữ liệu để xuất')
                    : t('pages.audit.export.failed', 'Xuất file thất bại. Vui lòng thử lại.')
                );
            }
        });
    };

    // Pagination (data already filtered and paginated by API)
    const totalPages = Math.ceil(totalRecords / pageSize);
    const startIndex = (currentPage - 1) * pageSize;

    if (loadingTranslations || loadingData) {
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

    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <p style={{ color: 'var(--error)', fontSize: '18px' }}>{error}</p>
                <button onClick={fetchAuditLogs} className="btn btn-primary">
                    {t('common.retry', 'Retry')}
                </button>
            </div>
        );
    }

    return (
        <PageTemplate
            breadcrumbs={[
                { label: t('modules.core', 'Core') },
                { label: t('pages.audit.title', 'Audit Logs') },
            ]}
            actions={
                <button className="btn btn-primary" onClick={handleExportClick} disabled={loadingData || isExporting}>
                    {isExporting ? `Exporting... ${exportProgress}%` : t('pages.audit.exportExcel', 'Export Excel')}
                </button>
            }
            filters={
                <div className="filterBar">
                    <div className="searchInputWrapper">
                        <span className="searchIcon">🔍</span>
                        <input
                            type="text"
                            placeholder={t('common.search', 'Search logs...')}
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="searchInput"
                        />
                    </div>

                    <select
                        value={filters.action}
                        onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                        className="filterSelect"
                    >
                        <option value="all">{t('common.allActions', 'All Actions')}</option>
                        <option value="CREATE">{t('common.actionCreate', 'CREATE')}</option>
                        <option value="UPDATE">{t('common.actionUpdate', 'UPDATE')}</option>
                        <option value="DELETE">{t('common.actionDelete', 'DELETE')}</option>
                        <option value="LOGIN">{t('common.actionLogin', 'LOGIN')}</option>
                    </select>

                    <select
                        value={filters.resource}
                        onChange={(e) => setFilters(prev => ({ ...prev, resource: e.target.value }))}
                        className="filterSelect"
                    >
                        <option value="all">{t('common.allResources', 'All Resources')}</option>
                        <option value="User">{t('common.resourceUser', 'User')}</option>
                        <option value="Role">{t('common.resourceRole', 'Role')}</option>
                        <option value="Customer">{t('common.resourceCustomer', 'Customer')}</option>
                        <option value="Product">{t('common.resourceProduct', 'Product')}</option>
                        <option value="System">{t('common.resourceSystem', 'System')}</option>
                    </select>

                    <select
                        value={filters.dateRange}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                        className="filterSelect"
                    >
                        <option value="all">{t('common.allTime', 'All Time')}</option>
                        <option value="today">{t('common.today', 'Today')}</option>
                        <option value="yesterday">{t('common.yesterday', 'Yesterday')}</option>
                        <option value="last7days">{t('common.last7Days', 'Last 7 Days')}</option>
                        <option value="last30days">{t('common.last30Days', 'Last 30 Days')}</option>
                    </select>

                    {(filters.search || filters.action !== 'all' || filters.resource !== 'all' || filters.dateRange !== 'all') && (
                        <button
                            onClick={() => {
                                setFilters({ search: '', action: 'all', resource: 'all', dateRange: 'all' });
                                trackEvent({
                                    action: ACTION_TYPES.FILTER,
                                    module: MODULE_NAME,
                                    details: 'Cleared all filters'
                                });
                            }}
                            className="clearFiltersBtn"
                        >
                            {t('pages.audit.clearFilters', 'Clear Filters')}
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
                                <th className="tableHeaderCell" onClick={() => handleSort('timestamp')}>
                                    <div className="tableHeaderContent">
                                        {t('pages.audit.table.timestamp', 'TIMESTAMP')}
                                        {sortColumn === 'timestamp' && (
                                            <span style={{ fontSize: '0.75rem' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="tableHeaderCell" onClick={() => handleSort('user')}>
                                    <div className="tableHeaderContent">
                                        {t('pages.audit.table.user', 'USER')}
                                        {sortColumn === 'user' && (
                                            <span style={{ fontSize: '0.75rem' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="tableHeaderCell" onClick={() => handleSort('action')}>
                                    <div className="tableHeaderContent">
                                        {t('pages.audit.table.action', 'ACTION')}
                                        {sortColumn === 'action' && (
                                            <span style={{ fontSize: '0.75rem' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="tableHeaderCell" onClick={() => handleSort('resource')}>
                                    <div className="tableHeaderContent">
                                        {t('pages.audit.table.resource', 'RESOURCE')}
                                        {sortColumn === 'resource' && (
                                            <span style={{ fontSize: '0.75rem' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="tableHeaderCell" onClick={() => handleSort('ipAddress')}>
                                    <div className="tableHeaderContent">
                                        {t('pages.audit.table.ip', 'IP ADDRESS')}
                                        {sortColumn === 'ipAddress' && (
                                            <span style={{ fontSize: '0.75rem' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="tableHeaderCell noSort">
                                    {t('pages.audit.table.details', 'DETAILS')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLogs.map((log, index) => (
                                <tr
                                    key={log.id || index}
                                    className={`tableRow ${index % 2 === 0 ? 'even' : 'odd'}`}
                                >
                                    <td className="tableCell timestamp">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="tableCell">
                                        <div className="userInfo">
                                            <div className="userAvatar">
                                                {log.user ? log.user.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <span>{log.user || 'System'}</span>
                                        </div>
                                    </td>
                                    <td className="tableCell">
                                        <span className={`actionBadge ${log.action.toLowerCase()}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="tableCell resource">
                                        {log.resource}
                                    </td>
                                    <td className="tableCell ipAddress">
                                        {log.ip || '-'}
                                    </td>
                                    <td className="tableCell details">
                                        <div className="detailsText">
                                            {log.details || '-'}
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
                        {t('common.pagination.showing', 'Showing')} {startIndex + 1} {t('common.pagination.to', 'to')} {Math.min(startIndex + pageSize, totalRecords)} {t('common.pagination.of', 'of')} {totalRecords} {t('common.pagination.results', 'results')}
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

            {/* Loading Overlay */}
            {isExporting && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1001,
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <div className="spinner" style={{ width: '60px', height: '60px' }}></div>
                    <div style={{ color: 'white', fontSize: '18px', fontWeight: '500' }}>
                        Exporting data to Excel...
                    </div>
                    <div style={{ width: '300px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${exportProgress}%`,
                            height: '8px',
                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                            transition: 'width 0.3s ease'
                        }}></div>
                    </div>
                    <div style={{ color: 'white', fontSize: '14px' }}>
                        {exportProgress}% complete
                    </div>
                </div>
            )}
        </PageTemplate>
    );
}
