'use client';

import PageTemplate from '@/components/PageTemplate';
import Modal from '@/components/Modal';
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
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
    const MODULE_NAME = 'MENUS';

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async (preserveExpandState = false) => {
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

        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            // In a real app, you would call the API here
            // const response = await fetch('/api/menus', ...);

            // For now, just close the modal and refresh (mock)
            setShowModal(false);
            fetchMenus(true); // Preserve expand state
            alert('Menu saved successfully (Mock)');
        } catch (error) {
            console.error('Error saving menu:', error);
            alert('Failed to save menu');
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
                                                                            onClick={() => handleEdit(parent)}
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
                                                            </>
                                                        )}
                                                    </SortableMenuRow>,

                                                    // Child Rows (if expanded)
                                                    ...(isExpanded ? children.map((child) => (
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
                                                                                onClick={() => handleEdit(child)}
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
                                                                </>
                                                            )}
                                                        </SortableMenuRow>
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
                                                                        onClick={() => handleEdit(item)}
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
                </DndContext>
            </PageTemplate>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
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
                            <input
                                type="text"
                                className="formInput"
                                value={formData.icon}
                                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                                placeholder="e.g., 🏠"
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
            </Modal>
        </>
    );
}
