'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { InventoryIcon } from '@/components/icons';
import Modal from '@/components/Modal';
import '@/app/core/users/users.css'; // Import form styles
import appConfig from '@/config/app.config';

// Hardcoded UUIDs for Development (Matching Seed Data)
const CATEGORIES = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Electronics' },
    { id: '11111111-1111-1111-1111-111111111112', name: 'Mechanical' },
    { id: '11111111-1111-1111-1111-111111111113', name: 'Raw Materials' }
];

const BRANDS = [
    { id: '22222222-2222-2222-2222-222222222221', name: 'Generic' },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Premium' }
];

const UOMS = [
    { id: '33333333-3333-3333-3333-333333333331', code: 'PCS', name: 'Pieces' },
    { id: '33333333-3333-3333-3333-333333333332', code: 'KG', name: 'Kilogram' },
    { id: '33333333-3333-3333-3333-333333333333', code: 'M', name: 'Meter' },
    { id: '33333333-3333-3333-3333-333333333334', code: 'BOX', name: 'Box' }
];

const WAREHOUSES = [
    { id: '44444444-4444-4444-4444-444444444441', name: 'Main Warehouse' },
    { id: '44444444-4444-4444-4444-444444444442', name: 'Production Store' }
];

const CURRENCIES = ['USD', 'VND', 'EUR'];
const TAX_RATES = [
    { name: 'VAT 10%', rate: 10 },
    { name: 'VAT 8%', rate: 8 },
    { name: 'VAT 5%', rate: 5 },
    { name: 'Non-VAT', rate: 0 }
];

export default function ItemMasterPage() {
    const [items, setItems] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        total: 0,
        active: 0,
        hasMinStock: 0,
        hasMaxStock: 0
    });
    const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL', 'ACTIVE', 'HAS_MIN_STOCK', 'HAS_MAX_STOCK'
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGroup, setFilterGroup] = useState('all');
    const [itemGroups, setItemGroups] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [activeTab, setActiveTab] = useState('identification');
    const [dragActive, setDragActive] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(appConfig.pagination.defaultPageSize);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [formData, setFormData] = useState({
        // Identification
        sku: '',
        name: '',
        shortName: '',
        description: '',
        barcode: '',
        externalCode: '',

        // Classification
        itemGroupId: '',
        categoryId: '',
        brand: '',
        tags: '',

        // Inventory Settings
        baseUomId: '',
        baseUomId: '',
        minStock: '',
        maxStock: '',
        reorderPoint: 0,
        settings_defaultWarehouseId: '',

        // Costing & Pricing
        standardCost: 0,
        defaultSellingPrice: 0,
        currency: 'USD',
        taxRate: 0,

        // Tracking / Compliance
        tracking: 'none',
        expiryControl: false,
        shelfLifeDays: 0,
        storageTemp: '',
        storageHumidity: '',

        // Business Flags
        isPurchaseItem: true,
        isSalesItem: true,
        isActive: true,

        // Media
        primaryImageUrl: '',
        images: [] // { id, url, file, name }
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const { t, loading: loadingTranslations } = useTranslations();

    useEffect(() => {
        fetchItems();
    }, [page, limit, searchTerm, filterGroup, filterStatus, activeFilter]); // Refetch when dependencies change

    useEffect(() => {
        fetchStats();
        fetchGroups();
    }, []); // Fetch stats once on mount (or could reload on item changes)

    // Cleanup object URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            formData.images?.forEach(img => {
                if (img.url.startsWith('blob:')) {
                    URL.revokeObjectURL(img.url);
                }
            });
        };
    }, [formData.images]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFiles = (files) => {
        const newImages = Array.from(files).map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(file), // Create preview URL
            file: file,
            name: file.name
        }));

        setFormData(prev => {
            const updatedImages = [...(prev.images || []), ...newImages];
            // Auto-set primary image if it's empty and we have images
            const primaryUrl = prev.primaryImageUrl || (updatedImages.length > 0 ? updatedImages[0].url : '');

            return {
                ...prev,
                images: updatedImages,
                primaryImageUrl: primaryUrl
            };
        });
    };

    const handleRemoveImage = (id) => {
        setFormData(prev => {
            const updatedImages = prev.images.filter(img => img.id !== id);
            // If we removed the primary image, update it
            let primaryUrl = prev.primaryImageUrl;
            const removedImage = prev.images.find(img => img.id === id);

            if (removedImage && prev.primaryImageUrl === removedImage.url) {
                primaryUrl = updatedImages.length > 0 ? updatedImages[0].url : '';
            }

            return {
                ...prev,
                images: updatedImages,
                primaryImageUrl: primaryUrl
            };
        });
    };

    const fetchItems = async () => {
        try {
            setLoadingData(true);
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sort: 'createdAt',
                order: 'desc'
            });

            if (searchTerm) queryParams.append('search', searchTerm);
            if (filterGroup !== 'all') queryParams.append('groupId', filterGroup);
            if (filterStatus !== 'all') queryParams.append('active', filterStatus === 'active' ? 'true' : 'false');

            // Apply Dashboard Filters
            if (activeFilter === 'ACTIVE') {
                queryParams.set('active', 'true');
            } else if (activeFilter === 'HAS_MIN_STOCK') {
                queryParams.set('active', 'true');
                queryParams.set('hasMinStock', 'true');
            } else if (activeFilter === 'HAS_MAX_STOCK') {
                queryParams.set('active', 'true');
                queryParams.set('hasMaxStock', 'true');
            }

            const response = await fetch(`/api/items?${queryParams}`);
            const result = await response.json();

            if (result.success) {
                setItems(result.data);
                if (result.meta?.pagination) {
                    setTotalPages(result.meta.pagination.totalPages);
                    setTotalRecords(result.meta.pagination.total);
                }
                fetchStats(); // Update global stats on search
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/items/stats');
            const result = await response.json();
            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Deprecated local calc, using API stats now
    const calculateStats = (itemsData, totalOverride) => {
        // Only update total from pagination if we are in 'ALL' mode or if we want to show filtered count
        // For Dashboard stats, we use fetchStats. 
        // We might want to update a "showing X results" state separate from global stats.
    };

    const handleFilterClick = (filter) => {
        if (activeFilter === filter) {
            setActiveFilter('ALL'); // Toggle off
        } else {
            setActiveFilter(filter);
        }
        setPage(1); // Reset pagination
    };

    const handleAddItem = () => {
        setEditingItem(null);
        setActiveTab('identification');
        setFormData({
            sku: '',
            name: '',
            shortName: '',
            description: '',
            barcode: '',
            externalCode: '',
            itemGroupId: '',
            categoryId: '',
            brand: '',
            tags: '',
            tags: '',
            baseUomId: '',
            minStock: '',
            maxStock: '',
            reorderPoint: '',
            settings_defaultWarehouseId: '',
            standardCost: 0,
            defaultSellingPrice: 0,
            currency: 'USD',
            taxRate: 0,
            tracking: 'none',
            expiryControl: false,
            shelfLifeDays: 0,
            storageTemp: '',
            storageHumidity: '',
            isPurchaseItem: true,
            isSalesItem: true,
            isActive: true,
            primaryImageUrl: ''
        });
        setFormErrors({});
        setShowItemModal(true);
    };

    const fetchGroups = async () => {
        try {
            const response = await fetch('/api/items/groups');
            const result = await response.json();
            if (result.success) {
                setItemGroups(result.data);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setActiveTab('identification');
        setFormData({
            sku: item.sku,
            name: item.name,
            shortName: item.shortName || '',
            description: item.description || '',
            barcode: item.barcode || '', // Assuming barcode is joined or first one
            externalCode: item.externalCode || '',

            itemGroupId: item.itemGroupId || '', // Added itemGroupId
            categoryId: item.itemCategoryId || '',
            brand: item.brand || '',
            tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),

            baseUomId: item.baseUomId || '',
            minStock: item.minStock || 0,
            maxStock: item.maxStock || 0,
            reorderPoint: item.reorderPoint || 0,
            settings_defaultWarehouseId: item.defaultWarehouseId || '',

            standardCost: item.standardCost || 0,
            defaultSellingPrice: item.defaultSellingPrice || 0,
            currency: item.currency || 'USD',
            taxRate: item.taxRate || 0,

            tracking: item.tracking || 'none',
            expiryControl: item.expiryControl || false,
            shelfLifeDays: item.shelfLifeDays || 0,
            storageTemp: item.storageTemp || '',
            storageHumidity: item.storageHumidity || '',

            isPurchaseItem: item.isPurchaseItem ?? true,
            isSalesItem: item.isSalesItem ?? true,
            isActive: item.isActive ?? true,

            primaryImageUrl: item.primaryImageUrl || ''
        });
        setFormErrors({});
        setShowItemModal(true);
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.sku || formData.sku.trim() === '') {
            errors.sku = 'SKU is required';
        } else if (!/^[A-Z0-9-]+$/.test(formData.sku)) {
            errors.sku = 'SKU must contain only uppercase letters, numbers, and hyphens';
        }
        if (!formData.name || formData.name.trim() === '') {
            errors.name = 'Name is required';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitItem = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const url = editingItem ? `/api/items/${editingItem.id}` : '/api/items';
            const method = editingItem ? 'PUT' : 'POST';

            const cleanUUID = (val) => (val && val.trim() !== '' ? val : null);

            const payload = {
                ...formData,
                baseUomId: cleanUUID(formData.baseUomId),
                itemGroupId: cleanUUID(formData.itemGroupId),
                itemCategoryId: cleanUUID(formData.categoryId),
                defaultWarehouseId: cleanUUID(formData.settings_defaultWarehouseId),
                qcTemplateId: cleanUUID(formData.qcTemplateId),
                defaultSupplierId: cleanUUID(formData.defaultSupplierId),
                purchaseUomId: cleanUUID(formData.purchaseUomId),
                salesUomId: cleanUUID(formData.salesUomId),
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
                minStock: formData.minStock === '' ? null : formData.minStock,
                maxStock: formData.maxStock === '' ? null : formData.maxStock,
            };

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                await fetchItems();
                setShowItemModal(false);
            } else {
                setFormErrors({ submit: result.error || 'Failed to save item' });
            }
        } catch (error) {
            console.error('Error saving item:', error);
            setFormErrors({ submit: 'An error occurred while saving the item' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteItem = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa item này?')) return;

        try {
            const response = await fetch(`/api/items/${id}`, { method: 'DELETE' });
            if (response.ok) {
                await fetchItems();
            } else {
                alert('Failed to delete item');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('An error occurred while deleting the item');
        }
    };

    // Filter logic moved to API, so we just use items directly
    const filteredItems = items;

    if (loadingTranslations) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <>
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
                            {t('pages.items.title', 'Item Master')}
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {t('pages.items.description', 'Quản lý danh mục sản phẩm và hàng hóa')}
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={handleAddItem}>
                        <InventoryIcon size={20} />
                        {t('pages.items.addItem', 'Thêm Item mới')}
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    <div className={`card ${activeFilter === 'ALL' ? 'ring-4 ring-primary' : ''}`} onClick={() => handleFilterClick('ALL')} style={{ cursor: 'pointer', backgroundColor: activeFilter === 'ALL' ? 'rgba(59, 130, 246, 0.25)' : null }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                            {t('pages.items.stats.total', 'Tổng Items')}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {stats.total}
                        </div>
                    </div>
                    <div className={`card ${activeFilter === 'ACTIVE' ? 'ring-4 ring-success' : ''}`} onClick={() => handleFilterClick('ACTIVE')} style={{ cursor: 'pointer', backgroundColor: activeFilter === 'ACTIVE' ? 'rgba(34, 197, 94, 0.25)' : null }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                            {t('pages.items.stats.active', 'Đang hoạt động')}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                            {stats.active}
                        </div>
                    </div>
                    <div className={`card ${activeFilter === 'HAS_MIN_STOCK' ? 'ring-4 ring-warning' : ''}`} onClick={() => handleFilterClick('HAS_MIN_STOCK')} style={{ cursor: 'pointer', backgroundColor: activeFilter === 'HAS_MIN_STOCK' ? 'rgba(234, 179, 8, 0.25)' : null }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                            {t('pages.items.stats.minStock', 'Minimum Stock')}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                            {stats.hasMinStock}
                        </div>
                    </div>
                    <div className={`card ${activeFilter === 'HAS_MAX_STOCK' ? 'ring-4 ring-error' : ''}`} onClick={() => handleFilterClick('HAS_MAX_STOCK')} style={{ cursor: 'pointer', backgroundColor: activeFilter === 'HAS_MAX_STOCK' ? 'rgba(239, 68, 68, 0.25)' : null }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                            {t('pages.items.stats.maxStock', 'Maximum Stock')}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error)' }}>
                            {stats.hasMaxStock}
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="card-title">{t('pages.items.list', 'Danh sách Items')}</h3>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                            <button
                                className="btn btn-primary"
                                onClick={handleAddItem}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <span style={{ fontSize: '1.2rem', lineHeight: '1' }}>+</span>
                                {t('pages.items.actions.create', 'Thêm mới')}
                            </button>
                            <input
                                type="text"
                                placeholder={t('pages.items.searchPlaceholder', 'Tìm kiếm SKU, tên...')}
                                className="filterInput"
                                style={{ width: '250px' }}
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1); // Reset to page 1 on search
                                }}
                            />
                            <select
                                className="filterSelect"
                                style={{ width: '150px' }}
                                value={filterGroup}
                                onChange={(e) => {
                                    setFilterGroup(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="all">{t('pages.items.filter.allGroups', 'Tất cả nhóm')}</option>
                                {itemGroups.map(group => (
                                    <option key={group.id} value={group.id}>{group.name}</option>
                                ))}
                            </select>
                            <select
                                className="filterSelect"
                                style={{ width: '130px' }}
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="all">{t('common.all', 'Tất cả')}</option>
                                <option value="active">{t('common.active', 'Active')}</option>
                                <option value="inactive">{t('common.inactive', 'Inactive')}</option>
                            </select>
                        </div>
                    </div>
                    <div className="card-body">
                        {loadingData ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>{t('common.loading', 'Loading...')}</div>
                        ) : filteredItems.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                {t('pages.items.noItems', 'Không tìm thấy item nào')}
                            </div>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>{t('pages.items.table.sku', 'SKU')}</th>
                                        <th>{t('pages.items.table.name', 'Tên Item')}</th>
                                        <th>{t('pages.items.table.group', 'Nhóm')}</th>
                                        <th>{t('pages.items.table.category', 'Category')}</th>
                                        <th>{t('pages.items.table.uom', 'UOM')}</th>
                                        <th style={{ textAlign: 'center' }}>{t('pages.items.table.purchasable', 'Purchasable')}</th>
                                        <th style={{ textAlign: 'center' }}>{t('pages.items.table.sellable', 'Sellable')}</th>
                                        <th>{t('pages.items.table.cost', 'Giá vốn')}</th>
                                        <th>{t('pages.items.table.price', 'Giá bán')}</th>
                                        <th>{t('pages.items.table.status', 'Trạng thái')}</th>
                                        <th>{t('pages.items.table.actions', 'Thao tác')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map((item) => (
                                        <tr key={item.id}>
                                            <td style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'monospace' }}>
                                                {item.sku}
                                            </td>
                                            <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                                {item.name}
                                            </td>
                                            <td>{item.itemGroupName || '-'}</td>
                                            <td>{item.itemCategoryName || '-'}</td>
                                            <td>{item.baseUomCode || '-'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <input type="checkbox" checked={item.isPurchaseItem} readOnly style={{ accentColor: 'var(--primary)' }} />
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <input type="checkbox" checked={item.isSalesItem} readOnly style={{ accentColor: 'var(--primary)' }} />
                                            </td>
                                            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                ${item.standardCost || 0}
                                            </td>
                                            <td style={{ fontWeight: 600, color: 'var(--success)' }}>
                                                ${item.defaultSellingPrice || 0}
                                            </td>
                                            <td>
                                                <span className={`badge ${item.isActive ? 'badge-success' : 'badge-secondary'}`}>
                                                    {item.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                                                </span>
                                                {item.minStock !== null && (
                                                    <span className="badge badge-warning" style={{ marginLeft: '4px' }}>
                                                        Min: {Number(item.minStock)}
                                                    </span>
                                                )}
                                                {item.maxStock !== null && (
                                                    <span className="badge badge-info" style={{ marginLeft: '4px' }}>
                                                        Max: {Number(item.maxStock)}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                                                        onClick={() => handleEditItem(item)}
                                                    >
                                                        {t('common.edit', 'Sửa')}
                                                    </button>
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', color: 'var(--error)', borderColor: 'var(--error)' }}
                                                        onClick={() => handleDeleteItem(item.id)}
                                                    >
                                                        {t('common.delete', 'Xóa')}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {/* Pagination Controls */}
                        {filteredItems.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '1rem', borderTop: '1px solid var(--border)' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    {t('common.pagination.showing', 'Hiển thị')} {(page - 1) * limit + 1} - {Math.min(page * limit, totalRecords)} {t('common.pagination.of', 'trong')} {totalRecords} {t('common.pagination.records', 'bản ghi')}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className="btn btn-outline"
                                        disabled={page === 1}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                    >
                                        {t('common.pagination.previous', 'Trước')}
                                    </button>
                                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                                        {t('common.pagination.page', 'Trang')} {page} / {totalPages}
                                    </div>
                                    <button
                                        className="btn btn-outline"
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    >
                                        {t('common.pagination.next', 'Sau')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Item Modal */}
            <Modal
                isOpen={showItemModal}
                onClose={() => setShowItemModal(false)}
                title={editingItem ? t('pages.items.editItem', 'Sửa Item') : t('pages.items.addItem', 'Thêm Item mới')}
                maxWidth="800px"
                footer={
                    <>
                        <button
                            type="button"
                            className="btn secondary"
                            onClick={() => setShowItemModal(false)}
                            disabled={submitting}
                        >
                            {t('common.cancel', 'Hủy')}
                        </button>
                        <button
                            type="submit"
                            className="btn primary"
                            disabled={submitting}
                            onClick={handleSubmitItem}
                        >
                            {submitting ? t('common.saving', 'Đang lưu...') : (editingItem ? t('common.saveChanges', 'Lưu thay đổi') : t('pages.items.createItem', 'Tạo Item'))}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmitItem}>
                    {formErrors.submit && (
                        <div className="errorMessage">{formErrors.submit}</div>
                    )}

                    {/* Tabs Navigation */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', gap: '2rem' }}>
                        {[
                            { id: 'identification', label: 'Identification' },
                            { id: 'classification', label: 'Classification' },
                            { id: 'inventory', label: 'Inventory' },
                            { id: 'costing', label: 'Costing' },
                            { id: 'tracking', label: 'Tracking' },
                            { id: 'media', label: 'Media' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                                    padding: '0.5rem 0',
                                    color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                                    fontWeight: activeTab === tab.id ? 600 : 400,
                                    cursor: 'pointer'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="formGrid">
                        {/* A. Identification */}
                        {activeTab === 'identification' && (
                            <>
                                <div className="formGroup">
                                    <label htmlFor="sku">SKU <span className="required">*</span></label>
                                    <input
                                        id="sku"
                                        type="text"
                                        className={`formInput ${formErrors.sku ? 'error' : ''}`}
                                        value={formData.sku}
                                        onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                                        placeholder="ITEM-001"
                                        disabled={submitting || editingItem}
                                    />
                                    {formErrors.sku && <span className="fieldError">{formErrors.sku}</span>}
                                </div>
                                <div className="formGroup fullWidth">
                                    <label htmlFor="name">Item Name <span className="required">*</span></label>
                                    <input
                                        id="name"
                                        type="text"
                                        className={`formInput ${formErrors.name ? 'error' : ''}`}
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Full item name"
                                        disabled={submitting}
                                    />
                                    {formErrors.name && <span className="fieldError">{formErrors.name}</span>}
                                </div>
                                <div className="formGroup">
                                    <label htmlFor="barcode">Barcode</label>
                                    <input
                                        id="barcode"
                                        type="text"
                                        className="formInput"
                                        value={formData.barcode}
                                        onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                                        placeholder="EAN / UPC / Custom"
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="formGroup">
                                    <label htmlFor="externalCode">External Code</label>
                                    <input
                                        id="externalCode"
                                        type="text"
                                        className="formInput"
                                        value={formData.externalCode}
                                        onChange={(e) => setFormData(prev => ({ ...prev, externalCode: e.target.value }))}
                                        placeholder="Supplier SKU or Legacy Code"
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="formGroup fullWidth">
                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        className="formInput"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Detailed description"
                                        disabled={submitting}
                                        rows={3}
                                    />
                                </div>
                            </>
                        )}

                        {/* B. Classification */}
                        {activeTab === 'classification' && (
                            <>
                                <div className="formGroup">
                                    <label htmlFor="itemGroupId">Group</label>
                                    <select
                                        id="itemGroupId"
                                        className="formInput"
                                        value={formData.itemGroupId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, itemGroupId: e.target.value }))}
                                        disabled={submitting}
                                    >
                                        <option value="">Select Group</option>
                                        {itemGroups.map(group => (
                                            <option key={group.id} value={group.id}>{group.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="formGroup">
                                    <label htmlFor="categoryId">Category</label>
                                    <select
                                        id="categoryId"
                                        className="formInput"
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                                        disabled={submitting}
                                    >
                                        <option value="">Select Category</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="formGroup">
                                    <label htmlFor="brand">Brand</label>
                                    <input
                                        id="brand"
                                        type="text"
                                        className="formInput"
                                        value={formData.brand}
                                        onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                                        placeholder="Brand name"
                                        disabled={submitting}
                                        list="brand-list"
                                    />
                                    <datalist id="brand-list">
                                        {BRANDS.map(b => (
                                            <option key={b.id} value={b.name} />
                                        ))}
                                    </datalist>
                                </div>
                                <div className="formGroup">
                                    <label htmlFor="tags">Tags</label>
                                    <input
                                        id="tags"
                                        type="text"
                                        className="formInput"
                                        value={formData.tags}
                                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                                        placeholder="e.g. New, Hot, Seasonal (comma used)"
                                        disabled={submitting}
                                    />
                                </div>
                            </>
                        )}

                        {/* C. Inventory Settings */}
                        {activeTab === 'inventory' && (
                            <>
                                <div className="formGroup">
                                    <label htmlFor="baseUomId">Base UOM</label>
                                    <select
                                        id="baseUomId"
                                        className="formInput"
                                        value={formData.baseUomId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, baseUomId: e.target.value }))}
                                        disabled={submitting}
                                    >
                                        <option value="">Select UOM</option>
                                        {UOMS.map(uom => (
                                            <option key={uom.id} value={uom.id}>{uom.name} ({uom.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="formGroup">
                                    <label htmlFor="defaultWarehouseId">Warehouse Assignment</label>
                                    <select
                                        id="defaultWarehouseId"
                                        className="formInput"
                                        value={formData.settings_defaultWarehouseId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, settings_defaultWarehouseId: e.target.value }))}
                                        disabled={submitting}
                                    >
                                        <option value="">Default Warehouse</option>
                                        {WAREHOUSES.map(wh => (
                                            <option key={wh.id} value={wh.id}>{wh.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="formGroup">
                                    <label htmlFor="minStock">Min Stock</label>
                                    <input
                                        id="minStock"
                                        type="number"
                                        className="formInput"
                                        value={formData.minStock}
                                        onChange={(e) => setFormData(prev => ({ ...prev, minStock: e.target.value === '' ? '' : parseFloat(e.target.value) }))}
                                        disabled={submitting}
                                        min="0"
                                    />
                                </div>
                                <div className="formGroup">
                                    <label htmlFor="maxStock">Max Stock</label>
                                    <input
                                        id="maxStock"
                                        type="number"
                                        className="formInput"
                                        value={formData.maxStock}
                                        onChange={(e) => setFormData(prev => ({ ...prev, maxStock: e.target.value === '' ? '' : parseFloat(e.target.value) }))}
                                        disabled={submitting}
                                        min="0"
                                    />
                                </div>
                            </>
                        )}

                        {/* D. Costing & Pricing */}
                        {activeTab === 'costing' && (
                            <>
                                <div className="formGroup">
                                    <label htmlFor="currency">Currency</label>
                                    <select
                                        id="currency"
                                        className="formInput"
                                        value={formData.currency}
                                        onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                                        disabled={submitting}
                                    >
                                        {CURRENCIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="formGroup">
                                    <label htmlFor="taxRate">Tax</label>
                                    <select
                                        id="taxRate"
                                        className="formInput"
                                        value={formData.taxRate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                                        disabled={submitting}
                                    >
                                        {TAX_RATES.map(t => (
                                            <option key={t.name} value={t.rate}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="formGroup">
                                    <label htmlFor="standardCost">Standard Cost</label>
                                    <input
                                        id="standardCost"
                                        type="number"
                                        className="formInput"
                                        value={formData.standardCost}
                                        onChange={(e) => setFormData(prev => ({ ...prev, standardCost: parseFloat(e.target.value) || 0 }))}
                                        disabled={submitting}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="formGroup">
                                    <label htmlFor="defaultSellingPrice">Selling Price</label>
                                    <input
                                        id="defaultSellingPrice"
                                        type="number"
                                        className="formInput"
                                        value={formData.defaultSellingPrice}
                                        onChange={(e) => setFormData(prev => ({ ...prev, defaultSellingPrice: parseFloat(e.target.value) || 0 }))}
                                        disabled={submitting}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </>
                        )}

                        {/* E. Tracking / Compliance */}
                        {activeTab === 'tracking' && (
                            <>
                                <div className="formGroup">
                                    <label htmlFor="tracking">Tracking Method</label>
                                    <select
                                        id="tracking"
                                        className="formInput"
                                        value={formData.tracking}
                                        onChange={(e) => setFormData(prev => ({ ...prev, tracking: e.target.value }))}
                                        disabled={submitting}
                                    >
                                        <option value="none">None</option>
                                        <option value="batch">Batch / Lot Control</option>
                                        <option value="serial">Serial Number</option>
                                    </select>
                                </div>
                                <div className="formGroup">
                                    <label className="roleCheckbox" style={{ marginTop: '2rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.expiryControl}
                                            onChange={(e) => setFormData(prev => ({ ...prev, expiryControl: e.target.checked }))}
                                            disabled={submitting}
                                        />
                                        <span>Expiry Control</span>
                                    </label>
                                </div>
                                {formData.expiryControl && (
                                    <div className="formGroup">
                                        <label htmlFor="shelfLifeDays">Shelf Life (Days)</label>
                                        <input
                                            id="shelfLifeDays"
                                            type="number"
                                            className="formInput"
                                            value={formData.shelfLifeDays}
                                            onChange={(e) => setFormData(prev => ({ ...prev, shelfLifeDays: parseInt(e.target.value) || 0 }))}
                                            disabled={submitting}
                                            min="0"
                                        />
                                    </div>
                                )}
                                <div className="formGroup">
                                    <label htmlFor="storageTemp">Storage Temp</label>
                                    <input
                                        id="storageTemp"
                                        type="text"
                                        className="formInput"
                                        value={formData.storageTemp}
                                        onChange={(e) => setFormData(prev => ({ ...prev, storageTemp: e.target.value }))}
                                        placeholder="e.g. 15-25°C"
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="formGroup">
                                    <label htmlFor="storageHumidity">Storage Humidity</label>
                                    <input
                                        id="storageHumidity"
                                        type="text"
                                        className="formInput"
                                        value={formData.storageHumidity}
                                        onChange={(e) => setFormData(prev => ({ ...prev, storageHumidity: e.target.value }))}
                                        placeholder="e.g. < 60%"
                                        disabled={submitting}
                                    />
                                </div>
                            </>
                        )}

                        {/* F. Media */}
                        {activeTab === 'media' && (
                            <div className="formGroup fullWidth">
                                <div
                                    className={`drop-zone ${dragActive ? "drag-active" : ""}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    style={{
                                        width: '100%',
                                        border: '2px dashed var(--border)',
                                        borderRadius: '8px',
                                        padding: '2rem',
                                        textAlign: 'center',
                                        background: dragActive ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--bg-secondary)',
                                        borderColor: dragActive ? 'var(--primary)' : 'var(--border)',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer',
                                        marginBottom: '1.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onClick={() => document.getElementById('image-upload').click()}
                                >
                                    <input
                                        id="image-upload"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleFiles(e.target.files)}
                                    />
                                    <div style={{ pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                                        <p style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Drag & Drop images here</p>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>or click to browse</p>
                                    </div>
                                </div>

                                {formData.images && formData.images.length > 0 && (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                        gap: '1rem'
                                    }}>
                                        {formData.images.map((img, index) => (
                                            <div key={img.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '1' }}>
                                                <img
                                                    src={img.url}
                                                    alt={img.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveImage(img.id);
                                                    }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '4px',
                                                        right: '4px',
                                                        background: 'rgba(0,0,0,0.5)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '20px',
                                                        height: '20px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '12px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    ×
                                                </button>
                                                {img.url === formData.primaryImageUrl && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '0',
                                                        left: '0',
                                                        right: '0',
                                                        background: 'rgba(var(--primary-rgb), 0.8)',
                                                        color: 'white',
                                                        fontSize: '0.65rem',
                                                        padding: '2px',
                                                        textAlign: 'center'
                                                    }}>
                                                        Primary
                                                    </div>
                                                )}
                                                {img.url !== formData.primaryImageUrl && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFormData(prev => ({ ...prev, primaryImageUrl: img.url }));
                                                        }}
                                                        style={{
                                                            position: 'absolute',
                                                            bottom: '4px',
                                                            left: '50%',
                                                            transform: 'translateX(-50%)',
                                                            background: 'rgba(255,255,255,0.9)',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '0.65rem',
                                                            padding: '2px 6px',
                                                            cursor: 'pointer',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        Set Primary
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>
                        )}
                    </div>

                    {/* F. Business Flags (Always Visible at bottom) */}
                    <div className="formGroup" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', gap: '2rem' }}>
                            <label className="roleCheckbox">
                                <input
                                    type="checkbox"
                                    checked={formData.isPurchaseItem}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isPurchaseItem: e.target.checked }))}
                                    disabled={submitting}
                                />
                                <span>Purchasable</span>
                            </label>
                            <label className="roleCheckbox">
                                <input
                                    type="checkbox"
                                    checked={formData.isSalesItem}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isSalesItem: e.target.checked }))}
                                    disabled={submitting}
                                />
                                <span>Sellable</span>
                            </label>
                            <label className="roleCheckbox">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                    disabled={submitting}
                                />
                                <span>Active</span>
                            </label>
                        </div>
                    </div>
                </form>
            </Modal >
        </>
    );
}
