'use client';

import PageTemplate from '@/components/PageTemplate';
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useEventTracking } from '@/hooks/useEventTracking';
import { ACTION_TYPES } from '@/config/action.config';
import '@/styles/datatable-common.css';
import './menus.css';

// Module color mapping for visual indicators
const MODULE_COLORS = {
    'Core': '#667eea',
    'Sales': '#f093fb',
    'Finance': '#4facfe',
    'Inventory': '#43e97b',
    'HR': '#fa709a',
    'Projects': '#feca57',
    'Settings': '#a29bfe',
};

export default function MenusPage() {
    const [menuItems, setMenuItems] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        parentMenu: 'all',
        status: 'all',
        level: 'all'
    });
    const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'flat'
    const [expandedModules, setExpandedModules] = useState(new Set());
    const { t, loading: loadingTranslations } = useTranslations();
    const { trackEvent } = useEventTracking();
    const MODULE_NAME = 'MENUS';

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            const userData = localStorage.getItem('user');
            const user = userData ? JSON.parse(userData) : null;

            const headers = {
                'Content-Type': 'application/json',
                'x-user-role': user?.role || 'admin',
            };

            if (user?.company) {
                headers['x-tenant-id'] = user.company.tenid || '1000';
                headers['x-stage-id'] = user.company.stgid || 'DEV';
            }

            const response = await fetch('/api/menus/admin', { headers });
            const data = await response.json();

            if (data.success) {
                setMenuItems(data.data);
                // Auto-expand all modules by default
                const parentIds = data.data
                    .filter(item => !item.parentId)
                    .map(item => item.id);
                setExpandedModules(new Set(parentIds));
            }
            setLoadingData(false);
        } catch (err) {
            console.error('Error fetching menus:', err);
            setLoadingData(false);
        }
    };

    // Extract modules with counts (Enhancement 1)
    const modulesWithCounts = useMemo(() => {
        const modules = {};
        const parentMenus = menuItems.filter(item => !item.parentId);

        parentMenus.forEach(parent => {
            const childCount = menuItems.filter(item => item.parentId === parent.id).length;
            modules[parent.label] = {
                id: parent.id,
                count: childCount,
                color: MODULE_COLORS[parent.label] || '#999'
            };
        });

        return modules;
    }, [menuItems]);

    // Get module color for an item
    const getModuleColor = (item) => {
        if (!item.parentId) {
            return MODULE_COLORS[item.label] || '#999';
        }
        const parent = menuItems.find(m => m.id === item.parentId);
        return MODULE_COLORS[parent?.label] || '#999';
    };

    // Get parent menu label
    const getParentLabel = (item) => {
        if (!item.parentId) return null;
        const parent = menuItems.find(m => m.id === item.parentId);
        return parent?.label;
    };

    // Filter data
    let filteredData = [...menuItems];

    // Text search
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(item =>
            item.label.toLowerCase().includes(searchLower) ||
            (item.href && item.href.toLowerCase().includes(searchLower))
        );
    }

    // Parent menu filter
    if (filters.parentMenu !== 'all') {
        const parentMenu = menuItems.find(item => item.label === filters.parentMenu);
        if (parentMenu) {
            // Include both the parent menu itself AND its children
            filteredData = filteredData.filter(item =>
                item.id === parentMenu.id || item.parentId === parentMenu.id
            );
        }
    }

    // Status filter
    if (filters.status !== 'all') {
        filteredData = filteredData.filter(item =>
            filters.status === 'active' ? item.isActive : !item.isActive
        );
    }

    // Level filter
    if (filters.level !== 'all') {
        filteredData = filteredData.filter(item =>
            filters.level === 'top' ? !item.parentId : !!item.parentId
        );
    }

    // Separate parent and child menus for tree view
    const parentMenus = filteredData.filter(item => !item.parentId);
    const childMenus = filteredData.filter(item => !!item.parentId);

    // Toggle module expansion
    const toggleModule = (moduleId) => {
        const newExpanded = new Set(expandedModules);
        const action = newExpanded.has(moduleId) ? ACTION_TYPES.COLLAPSE : ACTION_TYPES.EXPAND;

        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);

        trackEvent({
            action,
            module: MODULE_NAME,
            object_id: moduleId,
            details: `${action === ACTION_TYPES.EXPAND ? 'Expanded' : 'Collapsed'} module`
        });
    };

    // Expand/Collapse all
    const expandAll = () => {
        setExpandedModules(new Set(parentMenus.map(p => p.id)));
    };

    const collapseAll = () => {
        setExpandedModules(new Set());
    };

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
                { label: t('modules.settings', 'Settings') },
                { label: t('pages.menus.title', 'Menus') },
            ]}
            actions={
                <div style={{ display: 'flex', gap: '8px' }}>
                    {viewMode === 'tree' && (
                        <>
                            <button className="btn btn-secondary" onClick={expandAll}>
                                ⬇️ Expand All
                            </button>
                            <button className="btn btn-secondary" onClick={collapseAll}>
                                ⬆️ Collapse All
                            </button>
                        </>
                    )}
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            const newMode = viewMode === 'tree' ? 'flat' : 'tree';
                            setViewMode(newMode);
                            trackEvent({
                                action: ACTION_TYPES.VIEW_MODE_CHANGE,
                                module: MODULE_NAME,
                                details: `Switched to ${newMode} view`,
                                changes: { viewMode: newMode }
                            });
                        }}
                    >
                        {viewMode === 'tree' ? '📋 Flat View' : '🌳 Tree View'}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            trackEvent({
                                action: ACTION_TYPES.CREATE,
                                module: MODULE_NAME,
                                object_type: 'Menu',
                                details: 'Clicked Add Menu button'
                            });
                        }}
                    >
                        + {t('pages.menus.addMenu', 'Add Menu')}
                    </button>
                </div>
            }
            filters={
                <div className="filterBar">
                    <div className="searchInputWrapper">
                        <span className="searchIcon">🔍</span>
                        <input
                            type="text"
                            placeholder={t('pages.menus.searchPlaceholder', 'Search menus...')}
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="searchInput"
                        />
                    </div>

                    <select
                        value={filters.parentMenu}
                        onChange={(e) => setFilters(prev => ({ ...prev, parentMenu: e.target.value }))}
                        className="filterSelect"
                    >
                        <option value="all">
                            {t('pages.menus.allModules', 'All Modules')} ({menuItems.length})
                        </option>
                        {Object.entries(modulesWithCounts).map(([moduleName, data]) => (
                            <option key={moduleName} value={moduleName}>
                                {moduleName} ({data.count})
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="filterSelect"
                    >
                        <option value="all">{t('common.allStatus', 'All Status')}</option>
                        <option value="active">{t('pages.menus.active', 'Active')}</option>
                        <option value="inactive">{t('pages.menus.inactive', 'Inactive')}</option>
                    </select>

                    <select
                        value={filters.level}
                        onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                        className="filterSelect"
                    >
                        <option value="all">{t('pages.menus.allLevels', 'All Levels')}</option>
                        <option value="top">{t('pages.menus.topLevel', 'Top Level')}</option>
                        <option value="sub">{t('pages.menus.subMenu', 'Sub Menu')}</option>
                    </select>

                    {(filters.search || filters.parentMenu !== 'all' || filters.status !== 'all' || filters.level !== 'all') && (
                        <button
                            onClick={() => {
                                setFilters({ search: '', parentMenu: 'all', status: 'all', level: 'all' });
                                trackEvent({
                                    action: ACTION_TYPES.FILTER,
                                    module: MODULE_NAME,
                                    details: 'Cleared all filters'
                                });
                            }}
                            className="clearFiltersBtn"
                        >
                            {t('pages.menus.clearFilters', 'Clear Filters')}
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
                                <th className="tableHeaderCell">{t('pages.menus.table.menuItem', 'MENU ITEM')}</th>
                                <th className="tableHeaderCell">{t('pages.menus.table.path', 'PATH')}</th>
                                <th className="tableHeaderCell">{t('pages.menus.table.order', 'ORDER')}</th>
                                <th className="tableHeaderCell">{t('pages.menus.table.status', 'STATUS')}</th>
                                <th className="tableHeaderCell">{t('pages.menus.table.actions', 'ACTIONS')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {viewMode === 'tree' ? (
                                // Tree View
                                parentMenus.map((parent) => {
                                    const children = childMenus.filter(child => child.parentId === parent.id);
                                    const isExpanded = expandedModules.has(parent.id);

                                    return [
                                        // Parent Row
                                        <tr key={`parent-${parent.id}`} className="tableRow parent-row">
                                            <td className="tableCell">
                                                <div className="menu-item-with-indicator">
                                                    <span
                                                        className="module-indicator"
                                                        style={{ backgroundColor: getModuleColor(parent) }}
                                                    />
                                                    <button
                                                        className="toggle-button"
                                                        onClick={() => toggleModule(parent.id)}
                                                    >
                                                        {isExpanded ? '▼' : '▶'}
                                                    </button>
                                                    {parent.icon && <span className="menuIcon">{parent.icon}</span>}
                                                    <div className="menuLabel">{parent.label}</div>
                                                    <span
                                                        className="module-badge"
                                                        style={{ backgroundColor: getModuleColor(parent) }}
                                                    >
                                                        {children.length}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="tableCell">
                                                <div className="menuPath">{parent.href || '-'}</div>
                                            </td>
                                            <td className="tableCell menuOrder">
                                                {parent.order}
                                            </td>
                                            <td className="tableCell">
                                                <span className={`statusBadge ${parent.isActive ? 'active' : 'inactive'}`}>
                                                    {parent.isActive ? t('pages.menus.active', 'Active') : t('pages.menus.inactive', 'Inactive')}
                                                </span>
                                            </td>
                                            <td className="tableCell">
                                                <div className="actionButtons">
                                                    <button
                                                        className="editButton"
                                                        onClick={() => {
                                                            trackEvent({
                                                                action: ACTION_TYPES.UPDATE,
                                                                module: MODULE_NAME,
                                                                object_id: parent.id,
                                                                object_type: 'Menu',
                                                                details: `Clicked edit for menu: ${parent.label}`
                                                            });
                                                        }}
                                                    >
                                                        {t('common.edit', 'Edit')}
                                                    </button>
                                                    <button
                                                        className="deleteButton"
                                                        onClick={() => {
                                                            trackEvent({
                                                                action: ACTION_TYPES.DELETE,
                                                                module: MODULE_NAME,
                                                                object_id: parent.id,
                                                                object_type: 'Menu',
                                                                details: `Clicked delete for menu: ${parent.label}`
                                                            });
                                                        }}
                                                    >
                                                        {t('common.delete', 'Delete')}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>,

                                        // Child Rows (if expanded)
                                        ...(isExpanded ? children.map((child) => (
                                            <tr key={`child-${child.id}`} className="tableRow child-row">
                                                <td className="tableCell">
                                                    <div className="menu-item-with-indicator indented">
                                                        <span
                                                            className="module-indicator"
                                                            style={{ backgroundColor: getModuleColor(child) }}
                                                        />
                                                        <span className="indent-marker">└─</span>
                                                        {child.icon && <span className="menuIcon">{child.icon}</span>}
                                                        <div className="menuLabel">{child.label}</div>
                                                    </div>
                                                </td>
                                                <td className="tableCell">
                                                    <div className="menuPath">{child.href || '-'}</div>
                                                </td>
                                                <td className="tableCell menuOrder">
                                                    {child.order}
                                                </td>
                                                <td className="tableCell">
                                                    <span className={`statusBadge ${child.isActive ? 'active' : 'inactive'}`}>
                                                        {child.isActive ? t('pages.menus.active', 'Active') : t('pages.menus.inactive', 'Inactive')}
                                                    </span>
                                                </td>
                                                <td className="tableCell">
                                                    <div className="actionButtons">
                                                        <button
                                                            className="editButton"
                                                            onClick={() => {
                                                                trackEvent({
                                                                    action: ACTION_TYPES.UPDATE,
                                                                    module: MODULE_NAME,
                                                                    object_id: child.id,
                                                                    object_type: 'Menu',
                                                                    details: `Clicked edit for submenu: ${child.label}`
                                                                });
                                                            }}
                                                        >
                                                            {t('common.edit', 'Edit')}
                                                        </button>
                                                        <button
                                                            className="deleteButton"
                                                            onClick={() => {
                                                                trackEvent({
                                                                    action: ACTION_TYPES.DELETE,
                                                                    module: MODULE_NAME,
                                                                    object_id: child.id,
                                                                    object_type: 'Menu',
                                                                    details: `Clicked delete for submenu: ${child.label}`
                                                                });
                                                            }}
                                                        >
                                                            {t('common.delete', 'Delete')}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : [])
                                    ];
                                })
                            ) : (
                                // Flat View
                                filteredData.map((item, index) => (
                                    <tr
                                        key={item.id || `menu-item-${index}`}
                                        className={`tableRow ${index % 2 === 0 ? 'even' : 'odd'}`}
                                    >
                                        <td className="tableCell">
                                            <div className="menu-item-with-indicator">
                                                <span
                                                    className="module-indicator"
                                                    style={{ backgroundColor: getModuleColor(item) }}
                                                />
                                                {item.icon && <span className="menuIcon">{item.icon}</span>}
                                                <div>
                                                    <div className="menuLabel">{item.label}</div>
                                                    {getParentLabel(item) && (
                                                        <div className="parent-label">
                                                            <span
                                                                className="module-badge-small"
                                                                style={{ backgroundColor: getModuleColor(item) }}
                                                            >
                                                                {getParentLabel(item)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="tableCell">
                                            <div className="menuPath">{item.href || '-'}</div>
                                        </td>
                                        <td className="tableCell menuOrder">
                                            {item.order}
                                        </td>
                                        <td className="tableCell">
                                            <span className={`statusBadge ${item.isActive ? 'active' : 'inactive'}`}>
                                                {item.isActive ? t('pages.menus.active', 'Active') : t('pages.menus.inactive', 'Inactive')}
                                            </span>
                                        </td>
                                        <td className="tableCell">
                                            <div className="actionButtons">
                                                <button
                                                    className="editButton"
                                                    onClick={() => {
                                                        trackEvent({
                                                            action: ACTION_TYPES.UPDATE,
                                                            module: MODULE_NAME,
                                                            object_id: item.id,
                                                            object_type: 'Menu',
                                                            details: `Clicked edit for menu: ${item.label}`
                                                        });
                                                    }}
                                                >
                                                    {t('common.edit', 'Edit')}
                                                </button>
                                                <button
                                                    className="deleteButton"
                                                    onClick={() => {
                                                        trackEvent({
                                                            action: ACTION_TYPES.DELETE,
                                                            module: MODULE_NAME,
                                                            object_id: item.id,
                                                            object_type: 'Menu',
                                                            details: `Clicked delete for menu: ${item.label}`
                                                        });
                                                    }}
                                                >
                                                    {t('common.delete', 'Delete')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageTemplate>
    );
}
