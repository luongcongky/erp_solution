import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';

export default function AddItemsToWarehouseModal({ isOpen, onClose, onSuccess, warehouses }) {
    const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
    const [availableItems, setAvailableItems] = useState([]);
    const [selectedItemIds, setSelectedItemIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 50;

    // Filters
    const [search, setSearch] = useState('');
    const [itemGroupId, setItemGroupId] = useState('');
    const [itemCategoryId, setItemCategoryId] = useState('');
    const [itemType, setItemType] = useState('');
    const [notInAnyWarehouse, setNotInAnyWarehouse] = useState(false);

    // Master data
    const [itemGroups, setItemGroups] = useState([]);
    const [itemCategories, setItemCategories] = useState([]);

    // Default configuration
    const [defaultConfig, setDefaultConfig] = useState({
        tracking: 'none',
        valuationMethod: 'FIFO',
        isStocked: true,
        allowNegativeStock: false,
        reorderPoint: '',
        reorderQty: ''
    });
    const [showConfig, setShowConfig] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

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
        if (isOpen) {
            fetchMasterData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedWarehouseId) {
            setPage(1); // Reset to first page
            fetchItemsWithoutSetup();
        } else {
            setAvailableItems([]);
            setSelectedItemIds([]);
        }
    }, [selectedWarehouseId, search, itemGroupId, itemCategoryId, itemType, notInAnyWarehouse, page]);

    const fetchMasterData = async () => {
        try {
            const headers = getAuthHeaders();
            const [groupsRes, categoriesRes] = await Promise.all([
                fetch('/api/items/groups', { headers }),
                fetch('/api/items/categories', { headers })
            ]);

            const [groupsData, categoriesData] = await Promise.all([
                groupsRes.json(),
                categoriesRes.json()
            ]);

            if (groupsData.success) setItemGroups(groupsData.data);
            if (categoriesData.success) setItemCategories(categoriesData.data);
        } catch (error) {
            console.error('Error fetching master data:', error);
        }
    };

    const fetchItemsWithoutSetup = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                warehouseId: selectedWarehouseId,
                page: page.toString(),
                limit: limit.toString()
            });

            if (search) params.append('search', search);
            if (itemGroupId) params.append('itemGroupId', itemGroupId);
            if (itemCategoryId) params.append('itemCategoryId', itemCategoryId);
            if (itemType) params.append('itemType', itemType);
            if (notInAnyWarehouse) params.append('notInAnyWarehouse', 'true');

            const response = await fetch(`/api/inventory/items-without-setup?${params.toString()}`, {
                headers: getAuthHeaders()
            });
            const result = await response.json();
            if (result.success) {
                setAvailableItems(result.data.items);
                setTotalPages(result.data.pagination.totalPages);
                setTotalItems(result.data.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching items without setup:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            // Select all on current page
            const currentPageIds = availableItems.map(item => item.id);
            setSelectedItemIds(prev => [...new Set([...prev, ...currentPageIds])]);
        } else {
            // Deselect all on current page
            const currentPageIds = availableItems.map(item => item.id);
            setSelectedItemIds(prev => prev.filter(id => !currentPageIds.includes(id)));
        }
    };

    const handleSelectItem = (itemId) => {
        if (selectedItemIds.includes(itemId)) {
            setSelectedItemIds(selectedItemIds.filter(id => id !== itemId));
        } else {
            setSelectedItemIds([...selectedItemIds, itemId]);
        }
    };

    const handleClearFilters = () => {
        setSearch('');
        setItemGroupId('');
        setItemCategoryId('');
        setItemType('');
        setNotInAnyWarehouse(false);
        setPage(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedWarehouseId) {
            alert('Please select a warehouse');
            return;
        }

        if (selectedItemIds.length === 0) {
            alert('Please select at least one item');
            return;
        }

        setSubmitting(true);
        try {
            // Create setups one by one
            const promises = selectedItemIds.map(itemId =>
                fetch('/api/inventory/setup', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        itemId,
                        warehouseId: selectedWarehouseId,
                        ...defaultConfig
                    })
                })
            );

            await Promise.all(promises);

            onSuccess();
            handleClose();
        } catch (error) {
            console.error('Error creating setups:', error);
            alert('Error creating setups. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setSelectedWarehouseId('');
        setAvailableItems([]);
        setSelectedItemIds([]);
        setSearch('');
        setItemGroupId('');
        setItemCategoryId('');
        setItemType('');
        setPage(1);
        setDefaultConfig({
            tracking: 'none',
            valuationMethod: 'FIFO',
            isStocked: true,
            allowNegativeStock: false,
            reorderPoint: '',
            reorderQty: ''
        });
        onClose();
    };

    if (!isOpen) return null;

    const currentPageItemIds = availableItems.map(item => item.id);
    const allCurrentPageSelected = currentPageItemIds.length > 0 &&
        currentPageItemIds.every(id => selectedItemIds.includes(id));

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Add Items to Warehouse"
            size="large"
        >
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                        Select Warehouse *
                    </label>
                    <select
                        className="formInput"
                        value={selectedWarehouseId}
                        onChange={(e) => setSelectedWarehouseId(e.target.value)}
                        required
                    >
                        <option value="">-- Select Warehouse --</option>
                        {warehouses.map(wh => (
                            <option key={wh.id} value={wh.id}>
                                {wh.code} - {wh.name}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedWarehouseId && (
                    <>
                        {/* Default Configuration */}
                        <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--surface-secondary)', borderRadius: '8px' }}>
                            <div
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                onClick={() => setShowConfig(!showConfig)}
                            >
                                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Default Configuration</h4>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {showConfig ? '▼' : '▶'}
                                </span>
                            </div>

                            {showConfig && (
                                <div style={{ marginTop: '1rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Tracking</label>
                                            <select
                                                className="formInput"
                                                value={defaultConfig.tracking}
                                                onChange={(e) => setDefaultConfig({ ...defaultConfig, tracking: e.target.value })}
                                            >
                                                <option value="none">None</option>
                                                <option value="batch">Batch/Lot</option>
                                                <option value="serial">Serial</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Valuation Method</label>
                                            <select
                                                className="formInput"
                                                value={defaultConfig.valuationMethod}
                                                onChange={(e) => setDefaultConfig({ ...defaultConfig, valuationMethod: e.target.value })}
                                            >
                                                <option value="FIFO">FIFO</option>
                                                <option value="LIFO">LIFO</option>
                                                <option value="Average">Average</option>
                                                <option value="Standard">Standard</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Reorder Point</label>
                                            <input
                                                type="number"
                                                className="formInput"
                                                value={defaultConfig.reorderPoint}
                                                onChange={(e) => setDefaultConfig({ ...defaultConfig, reorderPoint: e.target.value })}
                                                placeholder="Optional"
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Reorder Qty</label>
                                            <input
                                                type="number"
                                                className="formInput"
                                                value={defaultConfig.reorderQty}
                                                onChange={(e) => setDefaultConfig({ ...defaultConfig, reorderQty: e.target.value })}
                                                placeholder="Optional"
                                            />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={defaultConfig.isStocked}
                                                onChange={(e) => setDefaultConfig({ ...defaultConfig, isStocked: e.target.checked })}
                                            />
                                            Is Stocked
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={defaultConfig.allowNegativeStock}
                                                onChange={(e) => setDefaultConfig({ ...defaultConfig, allowNegativeStock: e.target.checked })}
                                            />
                                            Allow Negative Stock
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Filters */}
                        <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--surface-secondary)', borderRadius: '8px' }}>
                            <div
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Filter Items</h4>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {showFilters ? '▼' : '▶'}
                                </span>
                            </div>

                            {showFilters && (
                                <div style={{ marginTop: '1rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                        <div>
                                            <input
                                                type="text"
                                                className="formInput"
                                                placeholder="Search SKU or Name..."
                                                value={search}
                                                onChange={(e) => {
                                                    setSearch(e.target.value);
                                                    setPage(1);
                                                }}
                                                style={{ fontSize: '0.875rem' }}
                                            />
                                        </div>
                                        <div>
                                            <select
                                                className="formInput"
                                                value={itemType}
                                                onChange={(e) => {
                                                    setItemType(e.target.value);
                                                    setPage(1);
                                                }}
                                                style={{ fontSize: '0.875rem' }}
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
                                        </div>
                                        <div>
                                            <select
                                                className="formInput"
                                                value={itemGroupId}
                                                onChange={(e) => {
                                                    setItemGroupId(e.target.value);
                                                    setPage(1);
                                                }}
                                                style={{ fontSize: '0.875rem' }}
                                            >
                                                <option value="">All Groups</option>
                                                {itemGroups.map(grp => (
                                                    <option key={grp.id} value={grp.id}>{grp.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <select
                                                className="formInput"
                                                value={itemCategoryId}
                                                onChange={(e) => {
                                                    setItemCategoryId(e.target.value);
                                                    setPage(1);
                                                }}
                                                style={{ fontSize: '0.875rem' }}
                                            >
                                                <option value="">All Categories</option>
                                                {itemCategories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={notInAnyWarehouse}
                                                onChange={(e) => {
                                                    setNotInAnyWarehouse(e.target.checked);
                                                    setPage(1);
                                                }}
                                            />
                                            Only show items not in ANY warehouse
                                        </label>
                                    </div>

                                    {(search || itemGroupId || itemCategoryId || itemType || notInAnyWarehouse) && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline"
                                            onClick={handleClearFilters}
                                            style={{ fontSize: '0.8rem' }}
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Items List Header */}
                        <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                Available Items ({totalItems} total)
                            </h4>
                            {selectedItemIds.length > 0 && (
                                <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 500 }}>
                                    {selectedItemIds.length} item(s) selected
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <div className="spinner"></div>
                            </div>
                        ) : availableItems.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                {totalItems === 0 ? 'All items already have setup for this warehouse' : 'No items match your filters'}
                            </div>
                        ) : (
                            <>
                                <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <table className="dataTable" style={{ fontSize: '0.875rem' }}>
                                        <thead className="tableHeader" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                            <tr>
                                                <th className="tableHeaderCell" style={{ width: '40px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={allCurrentPageSelected}
                                                        onChange={handleSelectAll}
                                                        title="Select all on this page"
                                                    />
                                                </th>
                                                <th className="tableHeaderCell">SKU</th>
                                                <th className="tableHeaderCell">Name</th>
                                                <th className="tableHeaderCell">Type</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {availableItems.map((item, index) => (
                                                <tr key={item.id} className={`tableRow ${index % 2 === 0 ? 'even' : 'odd'}`}>
                                                    <td className="tableCell">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedItemIds.includes(item.id)}
                                                            onChange={() => handleSelectItem(item.id)}
                                                        />
                                                    </td>
                                                    <td className="tableCell" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                                        {item.sku}
                                                    </td>
                                                    <td className="tableCell">{item.name}</td>
                                                    <td className="tableCell" style={{ textTransform: 'capitalize' }}>
                                                        {item.itemType?.replace('_', ' ')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                                        <div style={{ color: 'var(--text-muted)' }}>
                                            Page {page} of {totalPages}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline"
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                            >
                                                Previous
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline"
                                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                disabled={page === totalPages}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={handleClose}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!selectedWarehouseId || selectedItemIds.length === 0 || submitting}
                    >
                        {submitting ? 'Creating...' : `Create ${selectedItemIds.length} Setup(s)`}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
