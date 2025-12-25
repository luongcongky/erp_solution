'use client';

import { useState, useEffect } from 'react';
import { InventoryIcon } from '@/components/icons';
import InventorySetupModal from '@/components/InventorySetupModal';
import DuplicateSetupModal from '@/components/DuplicateSetupModal';
import BulkUpdateModal from '@/components/BulkUpdateModal';
import AddItemsToWarehouseModal from '@/components/AddItemsToWarehouseModal';
import '@/styles/datatable-common.css';

export default function InventorySetupPage() {
    const [setups, setSetups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [itemGroups, setItemGroups] = useState([]);
    const [itemCategories, setItemCategories] = useState([]);

    // Pagination State (Client-side)
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    // Modals
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
    const [showAddItemsModal, setShowAddItemsModal] = useState(false);
    const [editingSetup, setEditingSetup] = useState(null);
    const [duplicatingSetup, setDuplicatingSetup] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        warehouseId: '',
        itemType: '',
        itemGroupId: '',
        itemCategoryId: '',
        tracking: '',
        lowStockConfigured: '',
        isActive: 'true'
    });

    const getAuthHeaders = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                const tenId = user.ten_id || user.company?.ten_id || '1000';
                const stgId = user.stg_id || user.company?.stg_id || 'DEV';
                return {
                    'x-tenant-id': tenId,
                    'x-stage-id': stgId,
                    'Content-Type': 'application/json'
                };
            }
        } catch (e) {
            console.error('Error parsing user from localStorage', e);
        }
        return {
            'x-tenant-id': '1000',
            'x-stage-id': 'DEV',
            'Content-Type': 'application/json'
        };
    };

    useEffect(() => {
        fetchMasterData();
        fetchSetups();
    }, []);

    useEffect(() => {
        fetchSetups();
        setPage(1); // Reset to first page when filters change
    }, [filters]);

    const fetchMasterData = async () => {
        try {
            const headers = getAuthHeaders();
            const [warehousesRes, groupsRes, categoriesRes] = await Promise.all([
                fetch('/api/inventory/warehouses', { headers }),
                fetch('/api/items/groups', { headers }),
                fetch('/api/items/categories', { headers })
            ]);

            const [warehousesData, groupsData, categoriesData] = await Promise.all([
                warehousesRes.json(),
                groupsRes.json(),
                categoriesRes.json()
            ]);

            if (warehousesData.success) setWarehouses(warehousesData.data);
            if (groupsData.success) setItemGroups(groupsData.data);
            if (categoriesData.success) setItemCategories(categoriesData.data);

        } catch (error) {
            console.error('Error fetching master data:', error);
        }
    };

    const fetchSetups = async () => {
        setLoading(true);
        try {
            // Build query params
            const params = new URLSearchParams();
            if (filters.warehouseId) params.append('warehouseId', filters.warehouseId);
            if (filters.itemType) params.append('itemType', filters.itemType);
            if (filters.itemGroupId) params.append('itemGroupId', filters.itemGroupId);
            if (filters.itemCategoryId) params.append('itemCategoryId', filters.itemCategoryId);
            if (filters.tracking) params.append('tracking', filters.tracking);
            if (filters.lowStockConfigured) params.append('lowStockConfigured', filters.lowStockConfigured);
            if (filters.isActive) params.append('isActive', filters.isActive);

            const response = await fetch(`/api/inventory/setup?${params.toString()}`, {
                headers: getAuthHeaders()
            });

            const result = await response.json();
            if (result.success) {
                setSetups(result.data);
            }
        } catch (error) {
            console.error('Error fetching setups:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleClearFilters = () => {
        setFilters({
            warehouseId: '',
            itemType: '',
            itemGroupId: '',
            itemCategoryId: '',
            tracking: '',
            lowStockConfigured: '',
            isActive: 'true'
        });
    };

    const handleNewSetup = () => {
        setEditingSetup(null);
        setShowSetupModal(true);
    };

    const handleEdit = (setup) => {
        setEditingSetup(setup);
        setShowSetupModal(true);
    };

    const handleDuplicate = (setup) => {
        setDuplicatingSetup(setup);
        setShowDuplicateModal(true);
    };

    const handleBulkUpdate = () => {
        if (selectedIds.length === 0) {
            alert('Vui lòng chọn ít nhất một setup');
            return;
        }
        setShowBulkUpdateModal(true);
    };

    const handleToggleStatus = async (activate) => {
        if (selectedIds.length === 0) {
            alert('Vui lòng chọn ít nhất một setup');
            return;
        }

        try {
            const response = await fetch('/api/inventory/setup/bulk', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    ids: selectedIds,
                    data: { isActive: activate }
                })
            });

            const result = await response.json();
            if (result.success) {
                fetchSetups();
                setSelectedIds([]);
            }
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa setup này?')) {
            return;
        }

        try {
            const response = await fetch(`/api/inventory/setup/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const result = await response.json();
            if (result.success) {
                fetchSetups();
            }
        } catch (error) {
            console.error('Error deleting setup:', error);
        }
    };

    const handleExport = () => {
        const headers = ['Item Code', 'Item Name', 'Warehouse', 'Tracking', 'Reorder Point', 'Reorder Qty', 'Min Stock', 'Max Stock', 'Valuation', 'Status'];
        const rows = setups.map(s => [
            s.itemCode,
            s.itemName,
            `${s.warehouseCode} - ${s.warehouseName}`,
            s.tracking,
            s.reorderPoint || '',
            s.reorderQty || '',
            s.minStock || '',
            s.maxStock || '',
            s.valuationMethod,
            s.isActive ? 'Active' : 'Inactive'
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `inventory_setup_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(paginatedSetups.map(s => s.id));
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

    // Calculate Pagination
    const totalRecords = setups.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedSetups = setups.slice(startIndex, startIndex + pageSize);

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-xl)',
            }}>
                <div>
                    <h1 style={{ marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <InventoryIcon size={32} />
                        Inventory Setup
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Quản lý chính sách tồn kho theo từng sản phẩm và kho
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-primary" onClick={() => setShowAddItemsModal(true)}>
                        <span style={{ fontSize: '1.2rem', marginRight: 'var(--spacing-xs)' }}>📦</span>
                        Add Items to Warehouse
                    </button>
                    <button className="btn btn-primary" onClick={handleNewSetup}>
                        <span style={{ fontSize: '1.2rem', marginRight: 'var(--spacing-xs)' }}>+</span>
                        New Setup
                    </button>
                </div>
            </div>

            {/* Combined Card for Filters and Table */}
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 className="card-title">Setup List</h3>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                        <select
                            className="filterSelect"
                            style={{ width: '200px' }}
                            value={filters.warehouseId}
                            onChange={(e) => handleFilterChange('warehouseId', e.target.value)}
                        >
                            <option value="">All Warehouses</option>
                            {warehouses.map(wh => (
                                <option key={wh.id} value={wh.id}>
                                    {wh.code} - {wh.name}
                                </option>
                            ))}
                        </select>
                        <select
                            className="filterSelect"
                            style={{ width: '160px' }}
                            value={filters.itemType}
                            onChange={(e) => handleFilterChange('itemType', e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="raw_material">Raw Material</option>
                            <option value="semi_finished">Semi Finished</option>
                            <option value="finished">Finished Goods</option>
                            <option value="packaging">Packaging</option>
                            <option value="consumables">Consumables</option>
                            <option value="asset">Asset</option>
                            <option value="service">Service</option>
                        </select>
                        <select
                            className="filterSelect"
                            style={{ width: '160px' }}
                            value={filters.itemGroupId}
                            onChange={(e) => handleFilterChange('itemGroupId', e.target.value)}
                        >
                            <option value="">All Groups</option>
                            {itemGroups.map(grp => (
                                <option key={grp.id} value={grp.id}>{grp.name}</option>
                            ))}
                        </select>
                        <select
                            className="filterSelect"
                            style={{ width: '160px' }}
                            value={filters.itemCategoryId}
                            onChange={(e) => handleFilterChange('itemCategoryId', e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {itemCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <select
                            className="filterSelect"
                            style={{ width: '130px' }}
                            value={filters.isActive}
                            onChange={(e) => handleFilterChange('isActive', e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>

                        {(filters.warehouseId || filters.itemType || filters.itemGroupId || filters.itemCategoryId || filters.isActive !== 'true') && (
                            <button
                                className="clearFiltersBtn"
                                onClick={handleClearFilters}
                                title="Clear Filters"
                            >
                                ✕
                            </button>
                        )}

                        <button className="btn btn-sm btn-outline" onClick={handleExport} title="Export CSV">
                            📥
                        </button>
                    </div>
                </div>

                {/* Bulk Actions Toolbar */}
                {selectedIds.length > 0 && (
                    <div style={{
                        padding: '10px 16px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderBottom: '1px solid var(--border-light)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ fontWeight: 500, color: 'var(--primary)' }}>
                            {selectedIds.length} selected
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-sm btn-success" onClick={handleBulkUpdate}>
                                Bulk Update
                            </button>
                            <button className="btn btn-sm btn-success" onClick={() => handleToggleStatus(true)}>
                                Activate
                            </button>
                            <button className="btn btn-sm btn-error" onClick={() => handleToggleStatus(false)}>
                                Deactivate
                            </button>
                        </div>
                    </div>
                )}

                <div className="card-body" style={{ padding: 0 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : setups.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            No inventory setups found.
                        </div>
                    ) : (
                        <div className="tableContainer" style={{ border: 'none', borderRadius: 0 }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="dataTable">
                                    <thead className="tableHeader">
                                        <tr>
                                            <th className="tableHeaderCell" style={{ width: '40px', paddingLeft: '16px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={paginatedSetups.length > 0 && selectedIds.length >= paginatedSetups.length}
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                            <th className="tableHeaderCell">ITEM CODE</th>
                                            <th className="tableHeaderCell">ITEM NAME</th>
                                            <th className="tableHeaderCell">WAREHOUSE</th>
                                            <th className="tableHeaderCell" style={{ textAlign: 'center' }}>STOCKED</th>
                                            <th className="tableHeaderCell">TRACKING</th>
                                            <th className="tableHeaderCell">REORDER PT</th>
                                            <th className="tableHeaderCell">MIN/MAX</th>
                                            <th className="tableHeaderCell">VALUATION</th>
                                            <th className="tableHeaderCell">STATUS</th>
                                            <th className="tableHeaderCell">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedSetups.map((row, index) => (
                                            <tr key={row.id} className={`tableRow ${index % 2 === 0 ? 'even' : 'odd'} ${selectedIds.includes(row.id) ? 'selected' : ''}`}>
                                                <td className="tableCell" style={{ paddingLeft: '16px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(row.id)}
                                                        onChange={() => handleSelectRow(row.id)}
                                                    />
                                                </td>
                                                <td className="tableCell" style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'monospace' }}>
                                                    {row.itemCode}
                                                </td>
                                                <td className="tableCell" style={{ color: 'var(--text-primary)' }}>
                                                    {row.itemName}
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                                        {row.itemType?.replace('_', ' ')}
                                                    </div>
                                                </td>
                                                <td className="tableCell">
                                                    <div style={{ fontWeight: 500 }}>{row.warehouseCode}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.warehouseName}</div>
                                                </td>
                                                <td className="tableCell" style={{ textAlign: 'center' }}>
                                                    <span className={`statusBadge ${row.isStocked !== false ? 'active' : 'inactive'}`} style={{ fontSize: '0.7rem' }}>
                                                        {row.isStocked !== false ? 'YES' : 'NO'}
                                                    </span>
                                                </td>
                                                <td className="tableCell">
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        background: row.tracking === 'none' ? 'var(--surface-border)' : 'rgba(59, 130, 246, 0.1)',
                                                        color: row.tracking === 'none' ? 'var(--text-muted)' : 'var(--primary)'
                                                    }}>
                                                        {row.tracking}
                                                    </span>
                                                </td>
                                                <td className="tableCell">
                                                    {row.reorderPoint ? (
                                                        <div style={{ fontWeight: 500 }}>
                                                            {row.reorderPoint}
                                                            {row.reorderQty && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> / {row.reorderQty}</span>}
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                                                    )}
                                                </td>
                                                <td className="tableCell">
                                                    {(row.minStock || row.maxStock) ? (
                                                        <div style={{ fontSize: '0.8rem' }}>
                                                            <div>Min: {row.minStock || '-'}</div>
                                                            <div>Max: {row.maxStock || '-'}</div>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                                                    )}
                                                </td>
                                                <td className="tableCell" style={{ fontSize: '0.8rem' }}>
                                                    {row.valuationMethod}
                                                </td>
                                                <td className="tableCell">
                                                    <span className={`statusBadge ${row.isActive ? 'active' : 'inactive'}`}>
                                                        {row.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="tableCell">
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            className="editButton"
                                                            onClick={() => handleEdit(row)}
                                                            title="Edit"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="resetButton"
                                                            onClick={() => handleDuplicate(row)}
                                                            title="Duplicate"
                                                        >
                                                            Copy
                                                        </button>
                                                        <button
                                                            className="deleteButton"
                                                            onClick={() => handleDelete(row.id)}
                                                            title="Delete"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {setups.length > 0 && (
                    <div className="paginationContainer" style={{ borderTop: '1px solid var(--border-light)' }}>
                        <div className="paginationInfo">
                            Showing {startIndex + 1} - {Math.min(startIndex + pageSize, totalRecords)} of {totalRecords} records
                        </div>
                        <div className="paginationControls">
                            <button
                                className="paginationButton"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                Previous
                            </button>
                            <button
                                className="paginationButton"
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <InventorySetupModal
                isOpen={showSetupModal}
                onClose={() => {
                    setShowSetupModal(false);
                    setEditingSetup(null);
                }}
                onSuccess={() => {
                    fetchSetups();
                    setShowSetupModal(false);
                    setEditingSetup(null);
                }}
                editData={editingSetup}
            />

            <DuplicateSetupModal
                isOpen={showDuplicateModal}
                onClose={() => {
                    setShowDuplicateModal(false);
                    setDuplicatingSetup(null);
                }}
                onSuccess={() => {
                    fetchSetups();
                    setShowDuplicateModal(false);
                    setDuplicatingSetup(null);
                }}
                sourceSetup={duplicatingSetup}
            />

            <BulkUpdateModal
                isOpen={showBulkUpdateModal}
                onClose={() => setShowBulkUpdateModal(false)}
                onSuccess={() => {
                    fetchSetups();
                    setShowBulkUpdateModal(false);
                    setSelectedIds([]);
                }}
                selectedIds={selectedIds}
            />

            <AddItemsToWarehouseModal
                isOpen={showAddItemsModal}
                onClose={() => setShowAddItemsModal(false)}
                onSuccess={() => {
                    fetchSetups();
                    setShowAddItemsModal(false);
                }}
                warehouses={warehouses}
            />
        </div>
    );
}
