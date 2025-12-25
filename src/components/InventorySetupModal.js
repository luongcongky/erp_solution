'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import '@/app/core/users/users.css';

export default function InventorySetupModal({ isOpen, onClose, onSuccess, editData = null }) {
    const [formData, setFormData] = useState({
        itemId: '',
        warehouseId: '',
        tracking: 'none',
        reorderPoint: '',
        reorderQty: '',
        minStock: '',
        maxStock: '',
        safetyStock: '',
        valuationMethod: 'FIFO',
        isStocked: true,
        allowNegativeStock: false,
        notes: '',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [items, setItems] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);

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

    // Fetch items and warehouses on mount
    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    // Populate form when editing
    useEffect(() => {
        if (editData) {
            setFormData({
                itemId: editData.itemId || '',
                warehouseId: editData.warehouseId || '',
                tracking: editData.tracking || 'none',
                reorderPoint: editData.reorderPoint || '',
                reorderQty: editData.reorderQty || '',
                minStock: editData.minStock || '',
                maxStock: editData.maxStock || '',
                safetyStock: editData.safetyStock || '',
                valuationMethod: editData.valuationMethod || 'FIFO',
                isStocked: editData.isStocked !== undefined ? editData.isStocked : true,
                allowNegativeStock: editData.allowNegativeStock || false,
                notes: editData.notes || '',
            });
        } else {
            // Reset form for new entry
            setFormData({
                itemId: '',
                warehouseId: '',
                tracking: 'none',
                reorderPoint: '',
                reorderQty: '',
                minStock: '',
                maxStock: '',
                safetyStock: '',
                valuationMethod: 'FIFO',
                isStocked: true,
                allowNegativeStock: false,
                notes: '',
            });
        }
    }, [editData]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [itemsRes, warehousesRes] = await Promise.all([
                fetch('/api/inventory/items', { headers: getAuthHeaders() }),
                fetch('/api/inventory/warehouses', { headers: getAuthHeaders() })
            ]);

            const itemsData = await itemsRes.json();
            const warehousesData = await warehousesRes.json();

            if (itemsData.success) {
                setItems(itemsData.data);
            }
            if (warehousesData.success) {
                setWarehouses(warehousesData.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Validation
        if (!formData.itemId) {
            setErrors({ submit: 'Vui lòng chọn sản phẩm' });
            return;
        }
        if (!formData.warehouseId) {
            setErrors({ submit: 'Vui lòng chọn kho' });
            return;
        }

        if (formData.isStocked) {
            if (formData.reorderPoint && Number(formData.reorderPoint) <= 0) {
                setErrors({ submit: 'Reorder Point phải lớn hơn 0 khi quản lý tồn kho' });
                return;
            }
            if (formData.reorderPoint && (!formData.reorderQty || Number(formData.reorderQty) <= 0)) {
                setErrors({ submit: 'Reorder Qty phải lớn hơn 0 khi có Reorder Point' });
                return;
            }
        }

        setSubmitting(true);
        try {
            const url = editData
                ? `/api/inventory/setup/${editData.id}`
                : '/api/inventory/setup';

            const method = editData ? 'PUT' : 'POST';

            // Prepare payload - convert empty strings to null
            const payload = {
                itemId: formData.itemId,
                warehouseId: formData.warehouseId,
                tracking: formData.tracking,
                reorderPoint: formData.reorderPoint || null,
                reorderQty: formData.reorderQty || null,
                minStock: formData.minStock || null,
                maxStock: formData.maxStock || null,
                safetyStock: formData.safetyStock || null,
                valuationMethod: formData.valuationMethod,
                isStocked: formData.isStocked,
                allowNegativeStock: formData.allowNegativeStock,
                notes: formData.notes || null,
            };

            const response = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                onSuccess && onSuccess(result.data);
                onClose();
            } else {
                setErrors({ submit: result.error || 'Lỗi khi lưu cấu hình' });
            }
        } catch (error) {
            console.error('Error saving setup:', error);
            setErrors({ submit: 'Đã xảy ra lỗi' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // Logic for Is Stocked
            if (field === 'isStocked' && !value) {
                newData.tracking = 'none';
                newData.reorderPoint = '';
                newData.reorderQty = '';
                newData.minStock = '';
                newData.maxStock = '';
                newData.safetyStock = '';
            }

            // Logic for Item Type vs Tracking
            if (field === 'itemId') {
                const selectedItem = items.find(i => i.id === value);
                if (selectedItem) {
                    if (selectedItem.itemType === 'asset') {
                        newData.tracking = 'serial';
                    } else if (selectedItem.itemType === 'raw_material') {
                        // Default to none if switching, but user can change to batch
                        if (newData.tracking === 'serial') newData.tracking = 'none';
                    }
                }
            }

            return newData;
        });

        if (errors.submit) {
            setErrors({ submit: '' });
        }
    };

    const getSelectedItem = () => items.find(i => i.id === formData.itemId);
    const getSelectedWarehouse = () => warehouses.find(w => w.id === formData.warehouseId);

    const modalFooter = (
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
            <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
                disabled={submitting}
            >
                Hủy
            </button>
            <button
                type="submit"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting || loading}
            >
                {submitting ? 'Đang lưu...' : (editData ? 'Cập nhật' : 'Tạo mới')}
            </button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editData ? 'Chỉnh sửa Inventory Setup' : 'Tạo Inventory Setup mới'}
            footer={modalFooter}
            maxWidth="700px"
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Đang tải dữ liệu...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {/* Item Selection */}
                    <div className="formGroup">
                        <label className="formLabel">Sản phẩm <span style={{ color: 'var(--error)' }}>*</span></label>
                        <select
                            className="formInput"
                            value={formData.itemId}
                            onChange={(e) => handleChange('itemId', e.target.value)}
                            required
                            disabled={!!editData}
                        >
                            <option value="">-- Chọn sản phẩm --</option>
                            {items.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.sku} - {item.name}
                                </option>
                            ))}
                        </select>
                        {editData && (
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                Không thể thay đổi sản phẩm khi chỉnh sửa
                            </small>
                        )}
                    </div>
                    {formData.itemId && (
                        <div style={{ marginTop: '-10px', marginBottom: '15px' }}>
                            <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                                Type: {getSelectedItem()?.itemType?.replace('_', ' ') || 'N/A'}
                            </span>
                        </div>
                    )}

                    {/* Warehouse Selection */}
                    <div className="formGroup">
                        <label className="formLabel">Kho <span style={{ color: 'var(--error)' }}>*</span></label>
                        <select
                            className="formInput"
                            value={formData.warehouseId}
                            onChange={(e) => handleChange('warehouseId', e.target.value)}
                            required
                            disabled={!!editData}
                        >
                            <option value="">-- Chọn kho --</option>
                            {warehouses.map(wh => (
                                <option key={wh.id} value={wh.id}>
                                    {wh.code} - {wh.name}
                                </option>
                            ))}
                        </select>
                        {editData && (
                            <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                Không thể thay đổi kho khi chỉnh sửa
                            </small>
                        )}
                    </div>
                    {formData.warehouseId && (
                        <div style={{ marginTop: '-10px', marginBottom: '15px' }}>
                            <small style={{ color: 'var(--text-muted)' }}>
                                Type: <strong>{getSelectedWarehouse()?.warehouseType || 'N/A'}</strong>
                            </small>
                        </div>
                    )}

                    {/* Is Stocked */}
                    <div className="formGroup">
                        <label className="formLabel" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <input
                                type="checkbox"
                                checked={formData.isStocked}
                                onChange={(e) => handleChange('isStocked', e.target.checked)}
                                style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                            />
                            <span style={{ fontWeight: 600 }}>Quản lý tồn kho (Is Stocked)</span>
                        </label>
                    </div>

                    {/* Tracking Method */}
                    <div className="formGroup">
                        <label className="formLabel">Phương thức theo dõi</label>
                        <select
                            className="formInput"
                            value={formData.tracking}
                            onChange={(e) => handleChange('tracking', e.target.value)}
                            disabled={!formData.isStocked}
                        >
                            <option value="none">Không theo dõi</option>
                            <option value="batch" disabled={getSelectedItem()?.itemType === 'asset'}>Theo Lot/Batch</option>
                            <option value="serial" disabled={getSelectedItem()?.itemType === 'raw_material'}>Theo Serial Number</option>
                        </select>
                    </div>

                    {/* Stock Levels - Two columns */}


                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div className="formGroup">
                            <label className="formLabel" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                Reorder Point {formData.isStocked && <span style={{ color: 'var(--error)' }}>*</span>}
                                <span
                                    title="Mức tồn kho cần thiết để kích hoạt đơn đặt hàng mới"
                                    style={{
                                        cursor: 'help',
                                        fontSize: '0.75rem',
                                        background: 'var(--surface-border)',
                                        borderRadius: '50%',
                                        width: '16px',
                                        height: '16px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--text-secondary)'
                                    }}
                                >?</span>
                            </label>
                            <input
                                type="number"
                                className="formInput"
                                value={formData.reorderPoint}
                                onChange={(e) => handleChange('reorderPoint', e.target.value)}
                                placeholder="0"
                                step="0.01"
                                min="0"
                                disabled={!formData.isStocked}
                                required={formData.isStocked}
                            />
                        </div>

                        <div className="formGroup">
                            <label className="formLabel">Reorder Qty {formData.reorderPoint > 0 && <span style={{ color: 'var(--error)' }}>*</span>}</label>
                            <input
                                type="number"
                                className="formInput"
                                value={formData.reorderQty}
                                onChange={(e) => handleChange('reorderQty', e.target.value)}
                                placeholder="0"
                                step="0.01"
                                min="0"
                                disabled={!formData.isStocked}
                                required={formData.reorderPoint > 0}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div className="formGroup">
                            <label className="formLabel">Min Stock</label>
                            <input
                                type="number"
                                className="formInput"
                                value={formData.minStock}
                                onChange={(e) => handleChange('minStock', e.target.value)}
                                placeholder="0"
                                step="0.01"
                                min="0"
                                disabled={!formData.isStocked}
                            />
                        </div>
                        <div className="formGroup">
                            <label className="formLabel">Max Stock</label>
                            <input
                                type="number"
                                className="formInput"
                                value={formData.maxStock}
                                onChange={(e) => handleChange('maxStock', e.target.value)}
                                placeholder="0"
                                step="0.01"
                                min="0"
                                disabled={!formData.isStocked}
                            />
                        </div>
                        <div className="formGroup">
                            <label className="formLabel" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                Safety Stock
                                <span
                                    title="Lượng hàng dự trữ an toàn để tránh thiếu hụt hàng hóa bất ngờ"
                                    style={{
                                        cursor: 'help',
                                        fontSize: '0.75rem',
                                        background: 'var(--surface-border)',
                                        borderRadius: '50%',
                                        width: '16px',
                                        height: '16px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--text-secondary)'
                                    }}
                                >?</span>
                            </label>
                            <input
                                type="number"
                                className="formInput"
                                value={formData.safetyStock}
                                onChange={(e) => handleChange('safetyStock', e.target.value)}
                                placeholder="0"
                                step="0.01"
                                min="0"
                                disabled={!formData.isStocked}
                            />
                        </div>
                    </div>

                    {/* Warning Badge for No Reorder Rule */}
                    {formData.isStocked && (!formData.reorderPoint || Number(formData.reorderPoint) <= 0) && (
                        <div style={{
                            marginTop: 'var(--spacing-sm)',
                            marginBottom: 'var(--spacing-md)',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid var(--warning)',
                            borderRadius: '4px',
                            color: 'var(--warning-dark)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)',
                            fontSize: '0.875rem'
                        }}>
                            <span style={{ fontSize: '1.25em' }}>⚠️</span>
                            <span>Sản phẩm này chưa có quy tắc đặt hàng lại – sẽ không có cảnh báo tồn kho thấp</span>
                        </div>
                    )}

                    {/* Valuation Method */}
                    <div className="formGroup">
                        <label className="formLabel">Phương pháp định giá</label>
                        <select
                            className="formInput"
                            value={formData.valuationMethod}
                            onChange={(e) => handleChange('valuationMethod', e.target.value)}
                        >
                            <option value="FIFO">FIFO (First In First Out)</option>
                            <option value="LIFO">LIFO (Last In First Out)</option>
                            <option value="Average">Average Cost</option>
                            <option value="Standard">Standard Cost</option>
                        </select>
                    </div>

                    {/* Allow Negative Stock */}
                    <div className="formGroup">
                        <label className="formLabel" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <input
                                type="checkbox"
                                checked={formData.allowNegativeStock}
                                onChange={(e) => handleChange('allowNegativeStock', e.target.checked)}
                                style={{ accentColor: 'var(--primary)' }}
                            />
                            <span>Cho phép tồn kho âm</span>
                        </label>
                    </div>

                    {/* Notes */}
                    <div className="formGroup">
                        <label className="formLabel">Ghi chú</label>
                        <textarea
                            className="formInput"
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Ghi chú về cấu hình này..."
                            rows={3}
                        />
                    </div>

                    {errors.submit && (
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid var(--error)',
                            borderRadius: '4px',
                            color: 'var(--error)',
                            marginTop: 'var(--spacing-md)'
                        }}>
                            {errors.submit}
                        </div>
                    )}
                </form>
            )}
        </Modal>
    );
}
