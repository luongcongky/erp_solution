'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { InventoryIcon } from '@/components/icons';
import Modal from '@/components/Modal';
import '@/app/core/users/users.css'; // Import form styles

export default function ItemMasterPage() {
    const [items, setItems] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        lowStock: 0,
        outOfStock: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        shortName: '',
        description: '',
        itemType: 'finished',
        isPurchaseItem: true,
        isSalesItem: true,
        isActive: true,
        minStock: 0,
        maxStock: 0,
        reorderPoint: 0,
        standardCost: 0,
        defaultSellingPrice: 0
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const { t, loading: loadingTranslations } = useTranslations();

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoadingData(true);
            const response = await fetch('/api/items?limit=100');
            const result = await response.json();

            if (result.success) {
                setItems(result.data);
                calculateStats(result.data);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const calculateStats = (itemsData) => {
        setStats({
            total: itemsData.length,
            active: itemsData.filter(i => i.isActive).length,
            lowStock: itemsData.filter(i => i.minStock > 0 && i.minStock <= 10).length,
            outOfStock: itemsData.filter(i => i.minStock === 0).length
        });
    };

    const handleAddItem = () => {
        setEditingItem(null);
        setFormData({
            sku: '',
            name: '',
            shortName: '',
            description: '',
            itemType: 'finished',
            isPurchaseItem: true,
            isSalesItem: true,
            isActive: true,
            minStock: 0,
            maxStock: 0,
            reorderPoint: 0,
            standardCost: 0,
            defaultSellingPrice: 0
        });
        setFormErrors({});
        setShowItemModal(true);
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setFormData({
            sku: item.sku,
            name: item.name,
            shortName: item.shortName || '',
            description: item.description || '',
            itemType: item.itemType || 'finished',
            isPurchaseItem: item.isPurchaseItem ?? true,
            isSalesItem: item.isSalesItem ?? true,
            isActive: item.isActive ?? true,
            minStock: item.minStock || 0,
            maxStock: item.maxStock || 0,
            reorderPoint: item.reorderPoint || 0,
            standardCost: item.standardCost || 0,
            defaultSellingPrice: item.defaultSellingPrice || 0
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

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
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

    const getStatusBadge = (item) => {
        if (!item.isActive) return 'badge-error';
        if (item.minStock === 0) return 'badge-error';
        if (item.minStock <= 10) return 'badge-warning';
        return 'badge-success';
    };

    const getStatusText = (item) => {
        if (!item.isActive) return 'Inactive';
        if (item.minStock === 0) return 'Out of Stock';
        if (item.minStock <= 10) return 'Low Stock';
        return 'In Stock';
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = !searchTerm ||
            item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || item.itemType === filterType;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && item.isActive) ||
            (filterStatus === 'inactive' && !item.isActive);
        return matchesSearch && matchesType && matchesStatus;
    });

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
                    <div className="card">
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                            {t('pages.items.stats.total', 'Tổng Items')}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {stats.total}
                        </div>
                    </div>
                    <div className="card">
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                            {t('pages.items.stats.active', 'Đang hoạt động')}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                            {stats.active}
                        </div>
                    </div>
                    <div className="card">
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                            {t('pages.items.stats.lowStock', 'Sắp hết hàng')}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                            {stats.lowStock}
                        </div>
                    </div>
                    <div className="card">
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                            {t('pages.items.stats.outOfStock', 'Hết hàng')}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error)' }}>
                            {stats.outOfStock}
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
                                className="input"
                                style={{ width: '250px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select
                                className="input"
                                style={{ width: '150px' }}
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">{t('pages.items.filter.allTypes', 'Tất cả loại')}</option>
                                <option value="raw_material">{t('pages.items.type.rawMaterial', 'Raw Material')}</option>
                                <option value="semi_finished">{t('pages.items.type.semiFinished', 'Semi-Finished')}</option>
                                <option value="finished">{t('pages.items.type.finished', 'Finished')}</option>
                                <option value="service">{t('pages.items.type.service', 'Service')}</option>
                                <option value="asset">{t('pages.items.type.asset', 'Asset')}</option>
                            </select>
                            <select
                                className="input"
                                style={{ width: '130px' }}
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
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
                                        <th>{t('pages.items.table.type', 'Loại')}</th>
                                        <th>{t('pages.items.table.group', 'Nhóm')}</th>
                                        <th>{t('pages.items.table.uom', 'UOM')}</th>
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
                                            <td>
                                                <span style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid var(--border)'
                                                }}>
                                                    {item.itemType?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td>{item.itemGroupName || '-'}</td>
                                            <td>{item.baseUomCode || '-'}</td>
                                            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                ${item.standardCost || 0}
                                            </td>
                                            <td style={{ fontWeight: 600, color: 'var(--success)' }}>
                                                ${item.defaultSellingPrice || 0}
                                            </td>
                                            <td>
                                                <span className={`badge ${getStatusBadge(item)}`}>
                                                    {getStatusText(item)}
                                                </span>
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

                    <div className="formGrid">
                        <div className="formGroup">
                            <label htmlFor="sku">
                                SKU <span className="required">*</span>
                            </label>
                            <input
                                id="sku"
                                type="text"
                                className={`formInput ${formErrors.sku ? 'error' : ''}`}
                                value={formData.sku}
                                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                                placeholder="ITEM-001"
                                disabled={submitting || editingItem}
                            />
                            {formErrors.sku && (
                                <span className="fieldError">{formErrors.sku}</span>
                            )}
                        </div>

                        <div className="formGroup">
                            <label htmlFor="itemType">{t('pages.items.form.itemType', 'Loại Item')}</label>
                            <select
                                id="itemType"
                                className="formInput"
                                value={formData.itemType}
                                onChange={(e) => setFormData(prev => ({ ...prev, itemType: e.target.value }))}
                                disabled={submitting}
                            >
                                <option value="raw_material">Raw Material</option>
                                <option value="semi_finished">Semi-Finished</option>
                                <option value="finished">Finished Goods</option>
                                <option value="service">Service</option>
                                <option value="asset">Asset</option>
                            </select>
                        </div>

                        <div className="formGroup fullWidth">
                            <label htmlFor="name">
                                {t('pages.items.form.name', 'Tên Item')} <span className="required">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                className={`formInput ${formErrors.name ? 'error' : ''}`}
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Tên item"
                                disabled={submitting}
                            />
                            {formErrors.name && (
                                <span className="fieldError">{formErrors.name}</span>
                            )}
                        </div>

                        <div className="formGroup fullWidth">
                            <label htmlFor="description">{t('pages.items.form.description', 'Mô tả')}</label>
                            <textarea
                                id="description"
                                className="formInput"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Mô tả item"
                                disabled={submitting}
                                rows={3}
                            />
                        </div>

                        <div className="formGroup">
                            <label htmlFor="minStock">{t('pages.items.form.minStock', 'Tồn kho tối thiểu')}</label>
                            <input
                                id="minStock"
                                type="number"
                                className="formInput"
                                value={formData.minStock}
                                onChange={(e) => setFormData(prev => ({ ...prev, minStock: parseFloat(e.target.value) || 0 }))}
                                disabled={submitting}
                                min="0"
                            />
                        </div>

                        <div className="formGroup">
                            <label htmlFor="maxStock">{t('pages.items.form.maxStock', 'Tồn kho tối đa')}</label>
                            <input
                                id="maxStock"
                                type="number"
                                className="formInput"
                                value={formData.maxStock}
                                onChange={(e) => setFormData(prev => ({ ...prev, maxStock: parseFloat(e.target.value) || 0 }))}
                                disabled={submitting}
                                min="0"
                            />
                        </div>

                        <div className="formGroup">
                            <label htmlFor="standardCost">{t('pages.items.form.standardCost', 'Giá vốn ($)')}</label>
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
                            <label htmlFor="defaultSellingPrice">{t('pages.items.form.sellingPrice', 'Giá bán ($)')}</label>
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
                    </div>

                    <div className="formGroup" style={{ marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '2rem' }}>
                            <label className="roleCheckbox">
                                <input
                                    type="checkbox"
                                    checked={formData.isPurchaseItem}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isPurchaseItem: e.target.checked }))}
                                    disabled={submitting}
                                />
                                <span>{t('pages.items.form.purchaseItem', 'Hàng mua')}</span>
                            </label>
                            <label className="roleCheckbox">
                                <input
                                    type="checkbox"
                                    checked={formData.isSalesItem}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isSalesItem: e.target.checked }))}
                                    disabled={submitting}
                                />
                                <span>{t('pages.items.form.salesItem', 'Hàng bán')}</span>
                            </label>
                            <label className="roleCheckbox">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                    disabled={submitting}
                                />
                                <span>{t('common.active', 'Đang hoạt động')}</span>
                            </label>
                        </div>
                    </div>
                </form>
            </Modal>
        </>
    );
}
