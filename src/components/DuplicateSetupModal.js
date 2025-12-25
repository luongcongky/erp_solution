'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import '@/app/core/users/users.css';

export default function DuplicateSetupModal({ isOpen, onClose, onSuccess, sourceSetup = null }) {
    const [formData, setFormData] = useState({
        targetWarehouseIds: [],
        adjustMinStock: false,
        adjustMaxStock: false,
        adjustReorderPoint: false,
        minStock: '',
        maxStock: '',
        reorderPoint: '',
    });
    const [warehouses, setWarehouses] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

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
            fetchWarehouses();
        }
    }, [isOpen]);

    const fetchWarehouses = async () => {
        try {
            const response = await fetch('/api/inventory/warehouses', {
                headers: getAuthHeaders()
            });
            const result = await response.json();
            if (result.success) {
                // Filter out the source warehouse
                const filtered = result.data.filter(wh => wh.id !== sourceSetup?.warehouseId);
                setWarehouses(filtered);
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        }
    };

    const handleWarehouseToggle = (warehouseId) => {
        setFormData(prev => {
            const ids = prev.targetWarehouseIds.includes(warehouseId)
                ? prev.targetWarehouseIds.filter(id => id !== warehouseId)
                : [...prev.targetWarehouseIds, warehouseId];
            return { ...prev, targetWarehouseIds: ids };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (formData.targetWarehouseIds.length === 0) {
            setErrors({ submit: 'Vui lòng chọn ít nhất một kho đích' });
            return;
        }

        setSubmitting(true);
        try {
            const adjustments = {};
            if (formData.adjustMinStock && formData.minStock) {
                adjustments.minStock = formData.minStock;
            }
            if (formData.adjustMaxStock && formData.maxStock) {
                adjustments.maxStock = formData.maxStock;
            }
            if (formData.adjustReorderPoint && formData.reorderPoint) {
                adjustments.reorderPoint = formData.reorderPoint;
            }

            const response = await fetch('/api/inventory/setup/duplicate', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    sourceId: sourceSetup.id,
                    targetWarehouseIds: formData.targetWarehouseIds,
                    adjustments: Object.keys(adjustments).length > 0 ? adjustments : null
                })
            });

            const result = await response.json();

            if (result.success) {
                onSuccess && onSuccess(result.data);
                onClose();
            } else {
                setErrors({ submit: result.error || 'Lỗi khi sao chép cấu hình' });
            }
        } catch (error) {
            console.error('Error duplicating setup:', error);
            setErrors({ submit: 'Đã xảy ra lỗi' });
        } finally {
            setSubmitting(false);
        }
    };

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
                disabled={submitting}
            >
                {submitting ? 'Đang sao chép...' : 'Sao chép'}
            </button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Sao chép Inventory Setup"
            footer={modalFooter}
            maxWidth="600px"
        >
            <form onSubmit={handleSubmit}>
                {/* Source Info */}
                {sourceSetup && (
                    <div style={{
                        padding: 'var(--spacing-md)',
                        background: 'var(--surface-secondary)',
                        borderRadius: '8px',
                        marginBottom: 'var(--spacing-lg)'
                    }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                            Sao chép từ:
                        </div>
                        <div style={{ fontWeight: 600 }}>
                            {sourceSetup.itemCode} - {sourceSetup.itemName}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            Kho: {sourceSetup.warehouseCode} - {sourceSetup.warehouseName}
                        </div>
                    </div>
                )}

                {/* Target Warehouses */}
                <div className="formGroup">
                    <label className="formLabel">Chọn kho đích <span style={{ color: 'var(--error)' }}>*</span></label>
                    <div style={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: 'var(--spacing-sm)'
                    }}>
                        {warehouses.length === 0 ? (
                            <div style={{ padding: 'var(--spacing-md)', textAlign: 'center', color: 'var(--text-muted)' }}>
                                Không có kho khả dụng
                            </div>
                        ) : (
                            warehouses.map(wh => (
                                <label
                                    key={wh.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-sm)',
                                        padding: 'var(--spacing-sm)',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-secondary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.targetWarehouseIds.includes(wh.id)}
                                        onChange={() => handleWarehouseToggle(wh.id)}
                                        style={{ accentColor: 'var(--primary)' }}
                                    />
                                    <span>{wh.code} - {wh.name}</span>
                                </label>
                            ))
                        )}
                    </div>
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Đã chọn: {formData.targetWarehouseIds.length} kho
                    </small>
                </div>

                {/* Adjustments */}
                <div style={{
                    padding: 'var(--spacing-md)',
                    background: 'var(--surface-secondary)',
                    borderRadius: '8px',
                    marginTop: 'var(--spacing-lg)'
                }}>
                    <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
                        Điều chỉnh giá trị (tùy chọn)
                    </div>

                    <div className="formGroup">
                        <label className="formLabel" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <input
                                type="checkbox"
                                checked={formData.adjustMinStock}
                                onChange={(e) => setFormData(prev => ({ ...prev, adjustMinStock: e.target.checked }))}
                                style={{ accentColor: 'var(--primary)' }}
                            />
                            <span>Điều chỉnh Min Stock</span>
                        </label>
                        {formData.adjustMinStock && (
                            <input
                                type="number"
                                className="formInput"
                                value={formData.minStock}
                                onChange={(e) => setFormData(prev => ({ ...prev, minStock: e.target.value }))}
                                placeholder="Nhập giá trị mới"
                                step="0.01"
                                min="0"
                            />
                        )}
                    </div>

                    <div className="formGroup">
                        <label className="formLabel" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <input
                                type="checkbox"
                                checked={formData.adjustMaxStock}
                                onChange={(e) => setFormData(prev => ({ ...prev, adjustMaxStock: e.target.checked }))}
                                style={{ accentColor: 'var(--primary)' }}
                            />
                            <span>Điều chỉnh Max Stock</span>
                        </label>
                        {formData.adjustMaxStock && (
                            <input
                                type="number"
                                className="formInput"
                                value={formData.maxStock}
                                onChange={(e) => setFormData(prev => ({ ...prev, maxStock: e.target.value }))}
                                placeholder="Nhập giá trị mới"
                                step="0.01"
                                min="0"
                            />
                        )}
                    </div>

                    <div className="formGroup">
                        <label className="formLabel" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <input
                                type="checkbox"
                                checked={formData.adjustReorderPoint}
                                onChange={(e) => setFormData(prev => ({ ...prev, adjustReorderPoint: e.target.checked }))}
                                style={{ accentColor: 'var(--primary)' }}
                            />
                            <span>Điều chỉnh Reorder Point</span>
                        </label>
                        {formData.adjustReorderPoint && (
                            <input
                                type="number"
                                className="formInput"
                                value={formData.reorderPoint}
                                onChange={(e) => setFormData(prev => ({ ...prev, reorderPoint: e.target.value }))}
                                placeholder="Nhập giá trị mới"
                                step="0.01"
                                min="0"
                            />
                        )}
                    </div>
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
        </Modal>
    );
}
