'use client';

import PageTemplate from '@/components/PageTemplate';
import Modal from '@/components/Modal';
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useAuth } from '@/components/AuthProvider';
import { useEventTracking } from '@/hooks/useEventTracking';
import { ACTION_TYPES } from '@/config/action.config';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableMenuRow } from './SortableMenuRow';
import {
    DashboardIcon,
    SalesIcon,
    InventoryIcon,
    FinanceIcon,
    HRIcon,
    SettingsIcon,
    ProductIcon,
    MapPinIcon,
    BarcodeIcon,
    ClipboardIcon,
    AlertIcon,
    WarningIcon,
    PluginIcon,
    WarehouseIcon,
    ScaleIcon,
    CoreIcon,
    UserIcon,
    ProjectsIcon,
    MenuIcon,
    StockManagementIcon,
    StockInIcon,
    StockOutIcon,
    StockBalanceIcon,
    BuildingIcon,
    ChevronDownIcon,
    ChevronRightIcon
} from '@/components/icons';
import '@/styles/datatable-common.css';
import './menus.css';

const ICON_MAP = {
    DashboardIcon,
    SalesIcon,
    InventoryIcon,
    FinanceIcon,
    HRIcon,
    SettingsIcon,
    ProductIcon,
    MapPinIcon,
    BarcodeIcon,
    ClipboardIcon,
    AlertIcon,
    WarningIcon,
    PluginIcon,
    WarehouseIcon,
    ScaleIcon,
    CoreIcon,
    UserIcon,
    ProjectsIcon,
    MenuIcon,
    StockManagementIcon,
    StockInIcon,
    StockOutIcon,
    StockBalanceIcon,
    BuildingIcon
};

const renderIcon = (iconName) => {
    if (!iconName) return null;
    const IconComponent = ICON_MAP[iconName];
    if (IconComponent) {
        return <span className="menuIcon"><IconComponent size={18} /></span>;
    }
    return <span className="menuIcon">{iconName}</span>;
};

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

const IconPicker = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const closeTimerRef = useState(null); // specific usage of ref, but useState works for quick ref-like storage if we don't need instant update
    // Actually standard Ref is better:
    const timerRef = React.useRef(null);

    const handleMouseEnter = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleMouseLeave = () => {
        timerRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150); // 150ms delay to allow crossing gaps comfortably
    };

    return (
        <div
            className="iconPickerContainer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Trigger Button */}
            <div
                className={`iconPickerTrigger ${isOpen ? 'active' : ''}`}
                onClick={() => {
                    // Toggle open/close immediately on click
                    // If opening, ensure we clear any pending close timer
                    if (!isOpen) handleMouseEnter();
                    setIsOpen(!isOpen);
                }}
            >
                {value ? (
                    <div className="selectedIconPreview trigger">
                        {renderIcon(value)}
                        <span>{value}</span>
                    </div>
                ) : (
                    <span className="placeholder">Select an icon...</span>
                )}
                <span className="chevron">{isOpen ? '▲' : '▼'}</span>
            </div>

            {/* Dropdown Grid */}
            {isOpen && (
                <div
                    className="iconGrid dropdown"
                // Also handle mouse enter/leave on dropdown specifically if needed, 
                // but container wrapping handles it.
                >
                    {Object.entries(ICON_MAP).map(([iconName, IconComponent]) => (
                        <div
                            key={iconName}
                            className={`iconOption ${value === iconName ? 'selected' : ''}`}
                            onClick={() => {
                                onChange(iconName);
                                setIsOpen(false);
                            }}
                            title={iconName}
                        >
                            <IconComponent size={24} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
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
    const [showModal, setShowModal] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);
    const [formData, setFormData] = useState({
        label: '',
        href: '',
        icon: '',
        parentId: '',
        order: 0,
        isActive: true
    });
    const [submitting, setSubmitting] = useState(false);
    const [activeId, setActiveId] = useState(null);
    const { t, loading: loadingTranslations } = useTranslations();
    const { trackEvent } = useEventTracking();
    const { user, activeRole } = useAuth();
    const MODULE_NAME = 'MENUS';

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );


    useEffect(() => {
        if (user) {
            fetchMenus();
        }
    }, [user, activeRole]);

    const fetchMenus = async (preserveExpandState = false) => {
        console.log('MenusPage: fetchMenus called');
        try {
            console.log('MenusPage: Using auth context:', user ? 'User Found' : 'No User', 'Role:', activeRole);

            const headers = {
                'Content-Type': 'application/json',
                // Ensure role is lowercased for API check
                'x-user-role': (activeRole || user?.role || 'admin').toLowerCase(),
            };

            if (user?.company) {
                headers['x-tenant-id'] = user.company.ten_id || '1000';
                headers['x-stage-id'] = user.company.stg_id || 'DEV';
            }
            console.log('MenusPage: Fetching /api/menus/admin with headers:', headers);

            const response = await fetch('/api/menus/admin', { headers });
            const data = await response.json();

            if (data.success) {
                setMenuItems(data.data);
                // Only collapse all on initial load, preserve state on refresh
                if (!preserveExpandState) {
                    setExpandedModules(new Set());
                }
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

    const handleDelete = async (menuItem) => {
        if (!window.confirm(t('pages.menus.confirmDelete', `Are you sure you want to delete "${menuItem.label}"?`))) {
            return;
        }

        try {
            const response = await fetch(`/api/menus/admin?id=${menuItem.id}`, {
                method: 'DELETE',
                headers: {
                    'x-user-role': 'admin' // Ensure admin role is sent
                }
            });

            const data = await response.json();

            if (data.success) {
                // Refresh list
                await fetchMenus();
                // Optional: Show success toast if you have a toast system
                // alert('Menu deleted successfully'); 
            } else {
                alert(data.error || 'Failed to delete menu');
            }
        } catch (error) {
            console.error('Error deleting menu:', error);
            alert('An error occurred while deleting the menu');
        }
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

    const handleAdd = () => {
        trackEvent({
            action: ACTION_TYPES.CREATE,
            module: MODULE_NAME,
            object_type: 'Menu',
            details: 'Opened Add Menu modal'
        });
        setEditingMenu(null);
        setFormData({
            label: '',
            href: '',
            icon: '',
            parentId: '',
            order: 0,
            isActive: true
        });
        setShowModal(true);
    };

    const handleEdit = (item) => {
        trackEvent({
            action: ACTION_TYPES.UPDATE,
            module: MODULE_NAME,
            object_id: item.id,
            object_type: 'Menu',
            details: `Opened Edit Menu modal for: ${item.label}`
        });
        setEditingMenu(item);
        setFormData({
            label: item.label,
            href: item.href || '',
            icon: item.icon || '',
            parentId: item.parentId || '',
            order: item.order || 0,
            isActive: item.isActive
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            console.log('MenusPage: handleSubmit called with data:', formData);

            // Calculate level
            let level = 1;
            if (formData.parentId) {
                const parent = menuItems.find(m => m.id === formData.parentId);
                if (parent) {
                    level = (parent.level || 1) + 1;
                }
            }

            // Prepare payload
            const payload = {
                ...formData,
                level,
                // Default roles if not specified (could be enhanced later to have a picker)
                roles: ['user', 'admin'],
                // Ensure parentId is null if empty string
                parentId: formData.parentId || null
            };

            const headers = {
                'Content-Type': 'application/json',
                'x-user-role': (activeRole || user?.role || 'admin').toLowerCase(),
            };

            if (user?.company) {
                headers['x-tenant-id'] = user.company.ten_id || '1000';
                headers['x-stage-id'] = user.company.stg_id || 'DEV';
            }

            const url = '/api/menus/admin';
            const method = editingMenu ? 'PUT' : 'POST';

            if (editingMenu) {
                payload.id = editingMenu.id;
            }

            console.log(`MenusPage: Sending ${method} request to ${url}`, payload);

            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || result.message || 'Failed to save menu');
            }

            console.log('MenusPage: Save successful', result);

            // Close modal and refresh
            setShowModal(false);
            fetchMenus(true); // Preserve expand state
            alert(`Menu ${editingMenu ? 'updated' : 'created'} successfully`);
        } catch (error) {
            console.error('Error saving menu:', error);
            alert(`Failed to save menu: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    // Drag and drop handlers
    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over || active.id === over.id) return;

        const activeItem = menuItems.find(item => item.id === active.id);
        const overItem = menuItems.find(item => item.id === over.id);

        if (!activeItem || !overItem) return;

        // Determine drag type
        const isModuleDrag = !activeItem.parentId && !overItem.parentId;
        const isSameParentDrag = activeItem.parentId === overItem.parentId;
        const isCrossModuleDrag = activeItem.parentId && overItem.parentId && activeItem.parentId !== overItem.parentId;
        const isPageToModuleDrag = activeItem.parentId && !overItem.parentId;

        let updates = [];

        if (isModuleDrag) {
            // Reorder modules
            const modules = menuItems.filter(item => !item.parentId);
            const oldIndex = modules.findIndex(item => item.id === active.id);
            const newIndex = modules.findIndex(item => item.id === over.id);
            const reorderedModules = arrayMove(modules, oldIndex, newIndex);

            updates = reorderedModules.map((item, index) => ({
                id: item.id,
                order: index + 1,
                parentId: null
            }));
        } else if (isSameParentDrag) {
            // Reorder pages within same module
            const pages = menuItems.filter(item => item.parentId === activeItem.parentId);
            const oldIndex = pages.findIndex(item => item.id === active.id);
            const newIndex = pages.findIndex(item => item.id === over.id);
            const reorderedPages = arrayMove(pages, oldIndex, newIndex);

            updates = reorderedPages.map((item, index) => ({
                id: item.id,
                order: index + 1,
                parentId: activeItem.parentId
            }));
        } else if (isPageToModuleDrag) {
            // Move page to different module
            const confirmed = window.confirm(
                `Move "${activeItem.label}" to "${overItem.label}" module?`
            );

            if (!confirmed) return;

            updates = [{
                id: activeItem.id,
                order: 999, // Will be at the end
                parentId: overItem.id
            }];
        }

        if (updates.length > 0) {
            try {
                const response = await fetch('/api/menus/reorder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ updates })
                });

                if (!response.ok) throw new Error('Failed to save order');

                // Preserve expand/collapse state when refreshing after drag-and-drop
                await fetchMenus(true);

                trackEvent({
                    action: ACTION_TYPES.UPDATE,
                    module: MODULE_NAME,
                    object_id: active.id,
                    details: 'Reordered menu items via drag and drop'
                });
            } catch (error) {
                console.error('Error saving order:', error);
                alert('Failed to save new order');
            }
        }
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
        <>
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
                            onClick={handleAdd}
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
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="tableContainer">
                        <div style={{ overflowX: 'auto' }}>
                            <table className="dataTable">
                                <thead className="tableHeader">
                                    <tr>
                                        <th className="tableHeaderCell" style={{ width: '40px' }}></th>
                                        <th className="tableHeaderCell">{t('pages.menus.table.menuItem', 'MENU ITEM')}</th>
                                        <th className="tableHeaderCell">{t('pages.menus.table.path', 'PATH')}</th>
                                        <th className="tableHeaderCell">{t('pages.menus.table.order', 'ORDER')}</th>
                                        <th className="tableHeaderCell">{t('pages.menus.table.status', 'STATUS')}</th>
                                        <th className="tableHeaderCell">{t('pages.menus.table.actions', 'ACTIONS')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <SortableContext
                                        items={viewMode === 'tree' ? parentMenus.map(p => p.id) : filteredData.map(d => d.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {viewMode === 'tree' ? (
                                            // Tree View
                                            parentMenus.map((parent) => {
                                                const children = childMenus.filter(child => child.parentId === parent.id);
                                                const isExpanded = expandedModules.has(parent.id);

                                                return [
                                                    // Parent Row
                                                    <SortableMenuRow
                                                        key={`parent-${parent.id}`}
                                                        id={parent.id}
                                                        isDragging={activeId === parent.id}
                                                    >
                                                        {({ listeners, attributes }) => (
                                                            <>
                                                                <td className="tableCell">
                                                                    <span className="dragHandle" {...listeners} {...attributes}>
                                                                        ⋮⋮
                                                                    </span>
                                                                </td>
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
                                                                        {renderIcon(parent.icon)}
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
                                                                            onClick={() => handleEdit(parent)}
                                                                        >
                                                                            {t('common.edit', 'Edit')}
                                                                        </button>
                                                                        {parent.href && (
                                                                            <button
                                                                                className="viewButton"
                                                                                onClick={() => window.open(parent.href, '_blank')}
                                                                                title={t('common.view', 'View')}
                                                                            >
                                                                                {t('common.view', 'View')}
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            className="deleteButton"
                                                                            onClick={() => handleDelete(parent)}
                                                                        >
                                                                            {t('common.delete', 'Delete')}
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </>
                                                        )}
                                                    </SortableMenuRow>,

                                                    // Child Rows (if expanded)
                                                    ...(isExpanded ? children.map((child) => (
                                                        <React.Fragment key={child.id}>
                                                            {/* Child Row (Level 2) */}
                                                            <SortableMenuRow
                                                                key={`child-${child.id}`}
                                                                id={child.id}
                                                                isDragging={activeId === child.id}
                                                                isChild={true}
                                                            >
                                                                {({ listeners, attributes }) => (
                                                                    <>
                                                                        <td className="tableCell">
                                                                            <span className="dragHandle" {...listeners} {...attributes}>
                                                                                ⋮⋮
                                                                            </span>
                                                                        </td>
                                                                        <td className="tableCell">
                                                                            <div className="menu-item-with-indicator indented">
                                                                                <span
                                                                                    className="module-indicator"
                                                                                    style={{ backgroundColor: getModuleColor(child) }}
                                                                                />
                                                                                <span className="indent-marker">└─</span>

                                                                                {/* Expansion toggle for Level 2 if it has children */}
                                                                                {menuItems.some(m => m.parentId === child.id) && (
                                                                                    <button
                                                                                        className="toggle-button"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            toggleModule(child.id);
                                                                                        }}
                                                                                    >
                                                                                        {expandedModules.has(child.id) ?
                                                                                            <ChevronDownIcon size={12} /> :
                                                                                            <ChevronRightIcon size={12} />
                                                                                        }
                                                                                    </button>
                                                                                )}

                                                                                {renderIcon(child.icon)}
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
                                                                                    onClick={() => handleEdit(child)}
                                                                                >
                                                                                    {t('common.edit', 'Edit')}
                                                                                </button>
                                                                                {child.href && (
                                                                                    <button
                                                                                        className="viewButton"
                                                                                        onClick={() => window.open(child.href, '_blank')}
                                                                                        title={t('common.view', 'View')}
                                                                                    >
                                                                                        {t('common.view', 'View')}
                                                                                    </button>
                                                                                )}
                                                                                <button
                                                                                    className="deleteButton"
                                                                                    onClick={() => handleDelete(child)}
                                                                                >
                                                                                    {t('common.delete', 'Delete')}
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </>
                                                                )}
                                                            </SortableMenuRow>

                                                            {/* GrandChild Rows (Level 3 - if Level 2 expanded) */}
                                                            {expandedModules.has(child.id) && menuItems
                                                                .filter(m => m.parentId === child.id)
                                                                .sort((a, b) => a.order - b.order)
                                                                .map(grandChild => (
                                                                    <SortableMenuRow
                                                                        key={`grandchild-${grandChild.id}`}
                                                                        id={grandChild.id}
                                                                        isDragging={activeId === grandChild.id}
                                                                        isChild={true}
                                                                    >
                                                                        {({ listeners, attributes }) => (
                                                                            <>
                                                                                <td className="tableCell">
                                                                                    <span className="dragHandle" {...listeners} {...attributes}>
                                                                                        ⋮⋮
                                                                                    </span>
                                                                                </td>
                                                                                <td className="tableCell">
                                                                                    <div className="menu-item-with-indicator indented" style={{ paddingLeft: '48px' }}>
                                                                                        <span
                                                                                            className="module-indicator"
                                                                                            style={{ backgroundColor: getModuleColor(grandChild) }}
                                                                                        />
                                                                                        <span className="indent-marker">└─</span>
                                                                                        {renderIcon(grandChild.icon)}
                                                                                        <div className="menuLabel">{grandChild.label}</div>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="tableCell">
                                                                                    <div className="menuPath">{grandChild.href || '-'}</div>
                                                                                </td>
                                                                                <td className="tableCell menuOrder">
                                                                                    {grandChild.order}
                                                                                </td>
                                                                                <td className="tableCell">
                                                                                    <span className={`statusBadge ${grandChild.isActive ? 'active' : 'inactive'}`}>
                                                                                        {grandChild.isActive ? t('pages.menus.active', 'Active') : t('pages.menus.inactive', 'Inactive')}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="tableCell">
                                                                                    <div className="actionButtons">
                                                                                        <button
                                                                                            className="editButton"
                                                                                            onClick={() => handleEdit(grandChild)}
                                                                                        >
                                                                                            {t('common.edit', 'Edit')}
                                                                                        </button>
                                                                                        {grandChild.href && (
                                                                                            <button
                                                                                                className="viewButton"
                                                                                                onClick={() => window.open(grandChild.href, '_blank')}
                                                                                                title={t('common.view', 'View')}
                                                                                            >
                                                                                                {t('common.view', 'View')}
                                                                                            </button>
                                                                                        )}
                                                                                        <button
                                                                                            className="deleteButton"
                                                                                            onClick={() => handleDelete(grandChild)}
                                                                                        >
                                                                                            {t('common.delete', 'Delete')}
                                                                                        </button>
                                                                                    </div>
                                                                                </td>
                                                                            </>
                                                                        )}
                                                                    </SortableMenuRow>
                                                                ))
                                                            }
                                                        </React.Fragment>
                                                    )) : [])
                                                ];
                                            })
                                        ) : (
                                            // Flat View
                                            filteredData.map((item, index) => (
                                                <SortableMenuRow
                                                    key={item.id || `menu-item-${index}`}
                                                    id={item.id}
                                                    isDragging={activeId === item.id}
                                                    isChild={!!item.parentId}
                                                >
                                                    {({ listeners, attributes }) => (
                                                        <>
                                                            <td className="tableCell">
                                                                <span className="dragHandle" {...listeners} {...attributes}>
                                                                    ⋮⋮
                                                                </span>
                                                            </td>
                                                            <td className="tableCell">
                                                                <div className="menu-item-with-indicator">
                                                                    <span
                                                                        className="module-indicator"
                                                                        style={{ backgroundColor: getModuleColor(item) }}
                                                                    />
                                                                    {renderIcon(item.icon)}
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
                                                                        onClick={() => handleEdit(item)}
                                                                    >
                                                                        {t('common.edit', 'Edit')}
                                                                    </button>
                                                                    {item.href && (
                                                                        <button
                                                                            className="viewButton"
                                                                            onClick={() => window.open(item.href, '_blank')}
                                                                            title={t('common.view', 'View')}
                                                                        >
                                                                            {t('common.view', 'View')}
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        className="deleteButton"
                                                                        onClick={() => handleDelete(item)}
                                                                    >
                                                                        {t('common.delete', 'Delete')}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </>
                                                    )}
                                                </SortableMenuRow>
                                            ))
                                        )}
                                    </SortableContext>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </DndContext >
            </PageTemplate >

            {/* Add/Edit Modal */}
            < Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)
                }
                title={editingMenu ? t('pages.menus.editMenu', 'Edit Menu') : t('pages.menus.addMenu', 'Add Menu')}
                maxWidth="800px"
                footer={
                    <>
                        <button
                            type="button"
                            className="btn secondary"
                            onClick={() => setShowModal(false)}
                            disabled={submitting}
                        >
                            {t('common.cancel', 'Cancel')}
                        </button>
                        <button
                            type="submit"
                            className="btn primary"
                            disabled={submitting}
                            onClick={handleSubmit}
                        >
                            {submitting ? t('common.saving', 'Saving...') : (editingMenu ? t('common.saveChanges', 'Save Changes') : t('common.create', 'Create'))}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit}>
                    <div className="formGrid">
                        <div className="formGroup">
                            <label>{t('pages.menus.form.label', 'Label')} *</label>
                            <input
                                type="text"
                                className="formInput"
                                value={formData.label}
                                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                                placeholder="e.g., Dashboard"
                                required
                            />
                        </div>

                        <div className="formGroup">
                            <label>{t('pages.menus.form.path', 'Path')}</label>
                            <input
                                type="text"
                                className="formInput"
                                value={formData.href}
                                onChange={(e) => setFormData(prev => ({ ...prev, href: e.target.value }))}
                                placeholder="e.g., /dashboard"
                            />
                        </div>

                        <div className="formGroup">
                            <label>{t('pages.menus.form.icon', 'Icon')}</label>
                            <IconPicker
                                value={formData.icon}
                                onChange={(newIcon) => setFormData(prev => ({ ...prev, icon: newIcon }))}
                            />
                        </div>

                        <div className="formGroup">
                            <label>{t('pages.menus.form.order', 'Order')}</label>
                            <input
                                type="number"
                                className="formInput"
                                value={formData.order}
                                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                            />
                        </div>

                        <div className="formGroup fullWidth">
                            <label>{t('pages.menus.form.parent', 'Parent Menu')}</label>
                            <select
                                className="formInput"
                                value={formData.parentId}
                                onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
                            >
                                <option value="">{t('pages.menus.form.noParent', 'None (Top Level)')}</option>
                                {menuItems
                                    .filter(item => !item.parentId && item.id !== editingMenu?.id) // Exclude self if editing
                                    .map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.label}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="formGroup fullWidth">
                            <label>{t('pages.menus.form.status', 'Status')}</label>
                            <div className="statusToggle">
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                    />
                                    <span className="slider"></span>
                                </label>
                                <span>{formData.isActive ? t('pages.menus.active', 'Active') : t('pages.menus.inactive', 'Inactive')}</span>
                            </div>
                        </div>
                    </div>
                </form>
            </Modal >
        </>
    );
}
