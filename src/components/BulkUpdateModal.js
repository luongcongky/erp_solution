'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';
import '@/app/core/users/users.css';

export default function BulkUpdateModal({ isOpen, onClose, onSuccess, selectedIds = [] }) {
    const [formData, setFormData] = useState({
        updateMinStock: false,
        updateMaxStock: false,
        updateReorderPoint: false,
        updateReorderQty: false,
        updateValuation: false,
        minStock: '',
        maxStock: '',
        reorderPoint: '',
        reorderQty: '',
        valuationMethod: 'FIFO',
    });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Build update data
        const updateData = {};
        if (formData.updateMinStock && formData.minStock) {
            updateData.minStock = formData.minStock;
        }
        if (formData.updateMaxStock && formData.maxStock) {
            updateData.maxStock = formData.maxStock;
        }
        if (formData.updateReorderPoint && formData.reorderPoint) {
            updateData.reorderPoint = formData.reorderPoint;
        }
        if (formData.updateReorderQty && formData.reorderQty) {
            updateData.reorderQty = formData.reorderQty;
        }
        if (formData.updateValuation) {
            updateData.valuationMethod = formData.valuationMethod;
        }

        if (Object.keys(updateData).length === 0) {
            setErrors({ submit: 'Vui lòng chọn ít nhất một trường để cập nhật' });
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch('/api/inventory/setup/bulk', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    ids: selectedIds,
                    data: updateData
                })
            });

            const result = await response.json();

            if (result.success) {
                onSuccess && onSuccess(result.data);
                onClose();
            } else {
                setErrors({ submit: result.error || 'Lỗi khi cập nhật hàng loạt' });
            }
        } catch (error) {
            console.error('Error bulk updating:', error);
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
                {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Cập nhật hàng loạt"
            footer={modalFooter}
            maxWidth="500px"
        >
            <form onSubmit={handleSubmit}>
                <div style={{
                    padding: 'var(--spacing-md)',
                    background: 'var(--surface-secondary)',
                    borderRadius: '8px',
                    marginBottom: 'var(--spacing-lg)'
                }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Số lượng setup được chọn: <strong>{selectedIds.length}</strong>
                    </div>
                </div>

                {/* Min Stock */}
                <div className="formGroup">
                    <label className="formLabel" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <input
                            type="checkbox"
                            checked={formData.updateMinStock}
                            onChange={(e) => setFormData(prev => ({ ...prev, updateMinStock: e.target.checked }))}
                            style={{ accentColor: 'var(--primary)' }}
                        />
                        <span>Cập nhật Min Stock</span>
                    </label>
                    {formData.updateMinStock && (
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

                {/* Max Stock */}
                <div className="formGroup">
                    <label className="formLabel" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <input
                            type="checkbox"
                            checked={formData.updateMaxStock}
                            onChange={(e) => setFormData(prev => ({ ...prev, updateMaxStock: e.target.checked }))}
                            style={{ accentColor: 'var(--primary)' }}
                        />
                        <span>Cập nhật Max Stock</span>
                    </label>
                    {formData.updateMaxStock && (
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

                {/* Reorder Point */}
                <div className="formGroup">
                    <label className="formLabel" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <input
                            type="checkbox"
                            checked={formData.updateReorderPoint}
                            onChange={(e) => setFormData(prev => ({ ...prev, updateReorderPoint: e.target.checked }))}
                            style={{ accentColor: 'var(--primary)' }}
                        />
                        <span>Cập nhật Reorder Point</span>
                    </label>
                    {formData.updateReorderPoint && (
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

                {/* Reorder Qty */}
                <div className="formGroup">
                    <label className="formLabel" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <input
                            type="checkbox"
                            checked={formData.updateReorderQty}
                            onChange={(e) => setFormData(prev => ({ ...prev, updateReorderQty: e.target.checked }))}
                            style={{ accentColor: 'var(--primary)' }}
                        />
                        <span>Cập nhật Reorder Qty</span>
                    </label>
                    {formData.updateReorderQty && (
                        <input
                            type="number"
                            className="formInput"
                            value={formData.reorderQty}
                            onChange={(e) => setFormData(prev => ({ ...prev, reorderQty: e.target.value }))}
                            placeholder="Nhập giá trị mới"
                            step="0.01"
                            min="0"
                        />
                    )}
                </div>

                {/* Valuation Method */}
                <div className="formGroup">
                    <label className="formLabel" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        <input
                            type="checkbox"
                            checked={formData.updateValuation}
                            onChange={(e) => setFormData(prev => ({ ...prev, updateValuation: e.target.checked }))}
                            style={{ accentColor: 'var(--primary)' }}
                        />
                        <span>Cập nhật Phương pháp định giá</span>
                    </label>
                    {formData.updateValuation && (
                        <select
                            className="formInput"
                            value={formData.valuationMethod}
                            onChange={(e) => setFormData(prev => ({ ...prev, valuationMethod: e.target.value }))}
                        >
                            <option value="FIFO">FIFO (First In First Out)</option>
                            <option value="LIFO">LIFO (Last In First Out)</option>
                            <option value="Average">Average Cost</option>
                            <option value="Standard">Standard Cost</option>
                        </select>
                    )}
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
