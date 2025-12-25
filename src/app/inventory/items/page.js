'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { InventoryIcon } from '@/components/icons';
import Modal from '@/components/Modal';
import '@/styles/datatable-common.css';
import '@/app/core/users/users.css'; // Import form styles
import '@/app/core/audit/audit.css'; // Reuse audit styles for consistent look
import MultiSelect from '@/components/MultiSelect';
import appConfig from '@/config/app.config';

// Hardcoded UUIDs for Development (Matching Seed Data)
// Hardcoded constants for lists/dropdowns
const BRANDS = [];
const TAX_RATES = [
    { name: 'None (0%)', rate: 0 },
    { name: 'VAT (10%)', rate: 10 },
    { name: 'VAT (8%)', rate: 8 },
    { name: 'VAT (5%)', rate: 5 }
];

export default function ItemMasterPage() {
    const [items, setItems] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    // ... existing stats state ...
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        hasMinStock: 0,
        hasMaxStock: 0
    });
    const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL', 'ACTIVE', 'HAS_MIN_STOCK', 'HAS_MAX_STOCK'
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGroup, setFilterGroup] = useState('all');
    const [itemGroups, setItemGroups] = useState([]);

    // Master Data States
    const [categories, setCategories] = useState([]);
    const [uoms, setUoms] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [currencies, setCurrencies] = useState([
        { id: 'USD', name: 'US Dollar', code: 'USD' },
        { id: 'VND', name: 'Vietnamese Dong', code: 'VND' },
        { id: 'EUR', name: 'Euro', code: 'EUR' }
    ]);

    const [filterStatus, setFilterStatus] = useState('all');
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [activeTab, setActiveTab] = useState('identification');
    const [dragActive, setDragActive] = useState(false);

    // Creation Modal States
    const [creationModal, setCreationModal] = useState({
        isOpen: false,
        type: null, // 'group', 'category', 'uom', 'warehouse'
        title: ''
    });
    const [creationFormData, setCreationFormData] = useState({});
    const [creationErrors, setCreationErrors] = useState({});

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(appConfig.pagination.defaultPageSize);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [formData, setFormData] = useState({
        // Identification
        sku: '',
        name: '',
        itemType: 'finished', // Default to Finished Goods
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
        minStock: '',
        maxStock: '',
        reorderPoint: '',
        settings_defaultWarehouseId: '',

        // Costing & Pricing
        standardCost: '',
        defaultSellingPrice: '',
        currency: 'USD',
        taxRate: '',

        // Tracking / Compliance
        tracking: 'none',
        expiryControl: false,
        shelfLifeDays: '',
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

    const getAuthHeaders = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                // Priority: Direct user property > Company property > Default
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
        fetchItems();
    }, [page, limit, searchTerm, filterGroup, filterStatus, activeFilter]); // Refetch when dependencies change

    useEffect(() => {
        fetchStats();
        fetchMasterData();
    }, []);

    const fetchMasterData = async () => {
        try {
            const headers = getAuthHeaders();
            const [groupsRes, categoriesRes, uomsRes, warehousesRes] = await Promise.all([
                fetch('/api/items/groups', { headers }),
                fetch('/api/items/categories', { headers }), // We need to check if this endpoint exists/returns all
                fetch('/api/inventory/uoms', { headers }),
                fetch('/api/inventory/warehouses', { headers })
            ]);

            const [groups, categories, uoms, warehouses] = await Promise.all([
                groupsRes.json(),
                categoriesRes.json(),
                uomsRes.json(),
                warehousesRes.json()
            ]);

            if (groups.success) setItemGroups(groups.data);
            if (categories.success) setCategories(categories.data);
            if (uoms.success) setUoms(uoms.data);
            if (warehouses.success) setWarehouses(warehouses.data);

        } catch (error) {
            console.error('Error fetching master data:', error);
        }
    };

    // Creation Handlers
    const handleOpenCreateModal = (type, title) => {
        setCreationModal({
            isOpen: true,
            type,
            title
        });
        setCreationFormData({});
        setCreationErrors({});
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!creationFormData.name || !creationFormData.code) {
            setCreationErrors({ submit: 'Name and Code are required' });
            return;
        }

        setSubmitting(true);
        try {
            let url = '';
            switch (creationModal.type) {
                case 'group': url = '/api/items/groups'; break;
                case 'category': url = '/api/items/categories'; break;
                case 'uom': url = '/api/inventory/uoms'; break;
                case 'warehouse': url = '/api/inventory/warehouses'; break;
                case 'currency':
                    // Just handle locally since it's a simple string field
                    const newCurrency = { id: creationFormData.code, name: creationFormData.name || creationFormData.code, code: creationFormData.code };
                    setCurrencies(prev => [...prev, newCurrency]);
                    setFormData(prev => ({ ...prev, currency: creationFormData.code }));
                    setCreationModal({ isOpen: false, type: null, title: '' });
                    setCreationFormData({});
                    setSubmitting(false);
                    return;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(creationFormData)
            });

            const result = await response.json();

            if (result.success) {
                // Update local state and select the new item
                const newItem = result.data;
                switch (creationModal.type) {
                    case 'group':
                        setItemGroups(prev => [...prev, newItem]);
                        setFormData(prev => ({ ...prev, itemGroupId: newItem.id }));
                        break;
                    case 'category':
                        setCategories(prev => [...prev, newItem]);
                        setFormData(prev => ({ ...prev, categoryId: newItem.id }));
                        break;
                    case 'uom':
                        setUoms(prev => [...prev, newItem]);
                        setFormData(prev => ({ ...prev, baseUomId: newItem.id }));
                        break;
                    case 'warehouse':
                        setWarehouses(prev => [...prev, newItem]);
                        setFormData(prev => ({ ...prev, settings_defaultWarehouseId: newItem.id }));
                        break;
                    case 'currency':
                        // Currency is just a code/string for now
                        const newCurrency = { id: newItem.code, name: newItem.name || newItem.code, code: newItem.code };
                        setCurrencies(prev => [...prev, newCurrency]);
                        setFormData(prev => ({ ...prev, currency: newItem.code }));
                        break;
                }
                setCreationModal({ isOpen: false, type: null, title: '' });
                setCreationFormData({});
            } else {
                setCreationErrors({ submit: result.error || 'Failed to create item' });
            }
        } catch (error) {
            console.error('Error creating item:', error);
            setCreationErrors({ submit: 'An error occurred' });
        } finally {
            setSubmitting(false);
        }
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

            const response = await fetch(`/api/items?${queryParams}`, {
                headers: getAuthHeaders()
            });
            const result = await response.json();

            if (result.success) {
                setItems(result.data);
                if (result.meta?.pagination) {
                    setTotalPages(result.meta.pagination.totalPages);
                    setTotalRecords(result.meta.pagination.total);
                }
                // fetchStats(); // We call fetchStats independently in useEffect, avoiding double call if not needed
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/items/stats', {
                headers: getAuthHeaders()
            });
            const result = await response.json();
            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Image Handlers
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
            itemType: 'finished',
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
            standardCost: '',
            defaultSellingPrice: '',
            currency: 'USD',
            taxRate: '',
            tracking: 'none',
            expiryControl: false,
            shelfLifeDays: '',
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
            const response = await fetch('/api/items/groups', {
                headers: getAuthHeaders()
            });
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
            itemType: item.itemType || 'finished',
            shortName: item.shortName || '',
            description: item.description || '',
            barcode: item.barcode || '', // Assuming barcode is joined or first one
            externalCode: item.externalCode || '',

            itemGroupId: item.itemGroupId || '', // Added itemGroupId
            categoryId: item.itemCategoryId || '',
            brand: item.brand || '',
            tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),

            baseUomId: item.baseUomId || '',
            minStock: item.minStock ?? '',
            maxStock: item.maxStock ?? '',
            reorderPoint: item.reorderPoint ?? '',
            settings_defaultWarehouseId: item.defaultWarehouseId || '',

            standardCost: item.standardCost ?? '',
            defaultSellingPrice: item.defaultSellingPrice ?? '',
            currency: item.currency || 'USD',
            taxRate: item.taxRate ?? '',

            tracking: item.tracking || 'none',
            expiryControl: item.expiryControl || false,
            shelfLifeDays: item.shelfLifeDays ?? '',
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
            const cleanNumber = (val) => (val === '' || val === null || val === undefined ? null : Number(val));

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

                // Nullable numerics (empty input -> null)
                minStock: cleanNumber(formData.minStock),
                maxStock: cleanNumber(formData.maxStock),
                reorderPoint: cleanNumber(formData.reorderPoint),
                reorderQty: cleanNumber(formData.reorderQty),
                safetyStock: cleanNumber(formData.safetyStock),
                leadTimeDays: cleanNumber(formData.leadTimeDays),
                shelfLifeDays: cleanNumber(formData.shelfLifeDays),
                warrantyMonths: cleanNumber(formData.warrantyMonths),
                weight: cleanNumber(formData.weight),
                length: cleanNumber(formData.length),
                width: cleanNumber(formData.width),
                height: cleanNumber(formData.height),

                // Numerics (previously zero, now null allowed per request)
                standardCost: cleanNumber(formData.standardCost),
                defaultSellingPrice: cleanNumber(formData.defaultSellingPrice),
                taxRate: cleanNumber(formData.taxRate),
            };

            const response = await fetch(url, {
                method: method,
                headers: getAuthHeaders(),
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
            const response = await fetch(`/api/items/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
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
                            <div className="tableContainer">
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="dataTable">
                                        <thead className="tableHeader">
                                            <tr>
                                                <th className="tableHeaderCell">{t('pages.items.table.sku', 'SKU')}</th>
                                                <th className="tableHeaderCell">{t('pages.items.table.name', 'ITEM NAME')}</th>
                                                <th className="tableHeaderCell">{t('pages.items.table.group', 'GROUP')}</th>
                                                <th className="tableHeaderCell">{t('pages.items.table.category', 'CATEGORY')}</th>
                                                <th className="tableHeaderCell">{t('pages.items.table.uom', 'UOM')}</th>
                                                <th className="tableHeaderCell" style={{ textAlign: 'center' }}>{t('pages.items.table.purchasable', 'PURCH')}</th>
                                                <th className="tableHeaderCell" style={{ textAlign: 'center' }}>{t('pages.items.table.sellable', 'SELL')}</th>
                                                <th className="tableHeaderCell">{t('pages.items.table.cost', 'COST')}</th>
                                                <th className="tableHeaderCell">{t('pages.items.table.price', 'PRICE')}</th>
                                                <th className="tableHeaderCell">{t('pages.items.table.status', 'STATUS')}</th>
                                                <th className="tableHeaderCell">{t('pages.items.table.actions', 'ACTIONS')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredItems.map((item, index) => (
                                                <tr key={item.id} className={`tableRow ${index % 2 === 0 ? 'even' : 'odd'}`}>
                                                    <td className="tableCell" style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'monospace' }}>
                                                        {item.sku}
                                                    </td>
                                                    <td className="tableCell" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                                        {item.name}
                                                    </td>
                                                    <td className="tableCell">{item.itemGroupName || '-'}</td>
                                                    <td className="tableCell">{item.itemCategoryName || '-'}</td>
                                                    <td className="tableCell">{item.baseUomCode || '-'}</td>
                                                    <td className="tableCell" style={{ textAlign: 'center' }}>
                                                        <input type="checkbox" checked={item.isPurchaseItem} readOnly style={{ accentColor: 'var(--primary)' }} />
                                                    </td>
                                                    <td className="tableCell" style={{ textAlign: 'center' }}>
                                                        <input type="checkbox" checked={item.isSalesItem} readOnly style={{ accentColor: 'var(--primary)' }} />
                                                    </td>
                                                    <td className="tableCell" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                        {item.standardCost !== null && item.standardCost !== undefined ? `$${item.standardCost}` : '-'}
                                                    </td>
                                                    <td className="tableCell" style={{ fontWeight: 600, color: 'var(--success)' }}>
                                                        {item.defaultSellingPrice !== null && item.defaultSellingPrice !== undefined ? `$${item.defaultSellingPrice}` : '-'}
                                                    </td>
                                                    <td className="tableCell">
                                                        <span className={`statusBadge ${item.isActive ? 'active' : 'inactive'}`}>
                                                            {item.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                                                        </span>
                                                    </td>
                                                    <td className="tableCell">
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                className="editButton"
                                                                onClick={() => handleEditItem(item)}
                                                            >
                                                                {t('common.edit', 'Edit')}
                                                            </button>
                                                            <button
                                                                className="deleteButton"
                                                                onClick={() => handleDeleteItem(item.id)}
                                                            >
                                                                {t('common.delete', 'Delete')}
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

                        {/* Pagination Controls */}
                        {filteredItems.length > 0 && (
                            <div className="paginationContainer">
                                <div className="paginationInfo">
                                    {t('common.pagination.showing', 'Hiển thị')} {(page - 1) * limit + 1} - {Math.min(page * limit, totalRecords)} {t('common.pagination.of', 'trong')} {totalRecords} {t('common.pagination.records', 'bản ghi')}
                                </div>
                                <div className="paginationControls">
                                    <button
                                        className="paginationButton"
                                        disabled={page === 1}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                    >
                                        {t('common.pagination.previous', 'Trước')}
                                    </button>
                                    <div className="paginationNumbers">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum = i + 1;
                                            if (totalPages > 5 && page > 3) {
                                                pageNum = page - 2 + i;
                                            }
                                            if (pageNum > totalPages) return null;

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setPage(pageNum)}
                                                    className={`pageNumber ${pageNum === page ? 'active' : ''}`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        className="paginationButton"
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
                                <div className="formGroup">
                                    <label htmlFor="itemType">Item Type <span className="required">*</span></label>
                                    <select
                                        id="itemType"
                                        className="formInput"
                                        value={formData.itemType}
                                        onChange={(e) => setFormData(prev => ({ ...prev, itemType: e.target.value }))}
                                        disabled={submitting}
                                    >
                                        <option value="raw_material">Raw Material</option>
                                        <option value="semi_finished">Semi Finished</option>
                                        <option value="finished">Finished Goods</option>
                                        <option value="packaging">Packaging</option>
                                        <option value="consumables">Consumables</option>
                                        <option value="asset">Asset</option>
                                        <option value="service">Service</option>
                                    </select>
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
                                    <MultiSelect
                                        options={itemGroups}
                                        value={formData.itemGroupId ? [formData.itemGroupId] : []}
                                        onChange={(val) => setFormData(prev => ({ ...prev, itemGroupId: val[0] || '' }))}
                                        placeholder="Select Group"
                                        singleSelect={true}
                                        onAddNew={() => handleOpenCreateModal('group', 'Create New Item Group')}
                                    />
                                </div>
                                <div className="formGroup">
                                    <label htmlFor="categoryId">Category</label>
                                    <MultiSelect
                                        options={categories}
                                        value={formData.categoryId ? [formData.categoryId] : []}
                                        onChange={(val) => setFormData(prev => ({ ...prev, categoryId: val[0] || '' }))}
                                        placeholder="Select Category"
                                        singleSelect={true}
                                        onAddNew={() => handleOpenCreateModal('category', 'Create New Category')}
                                    />
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
                                    <MultiSelect
                                        options={uoms}
                                        value={formData.baseUomId ? [formData.baseUomId] : []}
                                        onChange={(val) => setFormData(prev => ({ ...prev, baseUomId: val[0] || '' }))}
                                        placeholder="Select UOM"
                                        singleSelect={true}
                                        onAddNew={() => handleOpenCreateModal('uom', 'Create New UOM')}
                                    />
                                </div>
                                <div className="formGroup">
                                    <label htmlFor="defaultWarehouseId">Warehouse Assignment</label>
                                    <MultiSelect
                                        options={warehouses}
                                        value={formData.settings_defaultWarehouseId ? [formData.settings_defaultWarehouseId] : []}
                                        onChange={(val) => setFormData(prev => ({ ...prev, settings_defaultWarehouseId: val[0] || '' }))}
                                        placeholder="Default Warehouse"
                                        singleSelect={true}
                                        onAddNew={() => handleOpenCreateModal('warehouse', 'Create New Warehouse')}
                                    />
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
                                    <MultiSelect
                                        options={currencies}
                                        value={formData.currency ? [formData.currency] : []}
                                        onChange={(val) => setFormData(prev => ({ ...prev, currency: val[0] || '' }))}
                                        placeholder="Select Currency"
                                        singleSelect={true}
                                        onAddNew={() => handleOpenCreateModal('currency', 'Add New Currency')}
                                    />
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
            </Modal>

            {/* Generic Creation Modal */}
            <Modal
                isOpen={creationModal.isOpen}
                onClose={() => setCreationModal({ ...creationModal, isOpen: false })}
                title={creationModal.title}
                width="500px"
                footer={
                    <>
                        <button
                            type="button"
                            className="btn secondary"
                            onClick={() => setCreationModal({ ...creationModal, isOpen: false })}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn primary"
                            onClick={handleCreateSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Creating...' : 'Create'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleCreateSubmit} className="formGrid singleColumn">
                    <div className="formGroup">
                        <label>Code <span className="required">*</span></label>
                        <input
                            type="text"
                            className="formInput"
                            value={creationFormData.code || ''}
                            onChange={(e) => setCreationFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                            placeholder="Unique Code"
                        />
                    </div>
                    <div className="formGroup">
                        <label>Name <span className="required">*</span></label>
                        <input
                            type="text"
                            className="formInput"
                            value={creationFormData.name || ''}
                            onChange={(e) => setCreationFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Name"
                        />
                    </div>
                    <div className="formGroup fullWidth">
                        <label>Description</label>
                        <textarea
                            className="formInput"
                            value={creationFormData.description || ''}
                            onChange={(e) => setCreationFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                        />
                    </div>
                    {creationErrors.submit && (
                        <div className="errorMessage">{creationErrors.submit}</div>
                    )}
                </form>
            </Modal>
        </>
    );
}
