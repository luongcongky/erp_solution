'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import '@/app/core/users/users.css';

export default function AddWarehouseLocationModal({ isOpen, onClose, onSuccess, warehouses = [] }) {
    const [mode, setMode] = useState('warehouse'); // 'warehouse' or 'location'
    const [formData, setFormData] = useState({
        // Warehouse fields
        code: '',
        name: '',
        warehouseType: 'FG',
        allowNegativeStock: false,
        address: '',

        // Location fields
        warehouseId: '',
        locationCode: '',
        locationName: '',
        parentLocationId: '',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [locations, setLocations] = useState([]);

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

    // Fetch locations when warehouse is selected (for location mode)
    useEffect(() => {
        if (mode === 'location' && formData.warehouseId) {
            fetchLocations(formData.warehouseId);
        }
    }, [mode, formData.warehouseId]);

    const fetchLocations = async (warehouseId) => {
        try {
            const response = await fetch(`/api/warehouses/${warehouseId}/locations`, {
                headers: getAuthHeaders()
            });
            const result = await response.json();
            if (result.success) {
                setLocations(result.data);
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Validation
        if (mode === 'warehouse') {
            if (!formData.code || !formData.name) {
                setErrors({ submit: 'Mã kho và tên kho là bắt buộc' });
                return;
            }
        } else {
            if (!formData.warehouseId || !formData.locationCode || !formData.locationName) {
                setErrors({ submit: 'Kho, mã vị trí và tên vị trí là bắt buộc' });
                return;
            }
        }

        setSubmitting(true);
        try {
            let url, payload;

            if (mode === 'warehouse') {
                url = '/api/warehouses';
                payload = {
                    code: formData.code,
                    name: formData.name,
                    warehouseType: formData.warehouseType,
                    allowNegativeStock: formData.allowNegativeStock,
                    address: formData.address ? { text: formData.address } : null,
                };
            } else {
                url = `/api/warehouses/${formData.warehouseId}/locations`;
                payload = {
                    code: formData.locationCode,
                    name: formData.locationName,
                    parentLocationId: formData.parentLocationId || null,
                };
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                // Reset form
                setFormData({
                    code: '',
                    name: '',
                    warehouseType: 'FG',
                    allowNegativeStock: false,
                    address: '',
                    warehouseId: '',
                    locationCode: '',
                    locationName: '',
                    parentLocationId: '',
                });
                onSuccess && onSuccess(result.data);
                onClose();
            } else {
                setErrors({ submit: result.error || 'Lỗi khi tạo mới' });
            }
        } catch (error) {
            console.error('Error creating:', error);
            setErrors({ submit: 'Đã xảy ra lỗi' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors.submit) {
            setErrors({});
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
                {submitting ? 'Đang lưu...' : 'Tạo mới'}
            </button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Thêm vị trí mới"
            footer={modalFooter}
            maxWidth="600px"
        >
            <form onSubmit={handleSubmit}>
                {/* Mode Selection */}
                <div className="formGroup" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label className="formLabel">Loại tạo mới</label>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="mode"
                                value="warehouse"
                                checked={mode === 'warehouse'}
                                onChange={(e) => setMode(e.target.value)}
                                style={{ accentColor: 'var(--primary)' }}
                            />
                            <span>Kho mới (Warehouse)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="mode"
                                value="location"
                                checked={mode === 'location'}
                                onChange={(e) => setMode(e.target.value)}
                                style={{ accentColor: 'var(--primary)' }}
                            />
                            <span>Vị trí/Bin mới (Location)</span>
                        </label>
                    </div>
                </div>

                {mode === 'warehouse' ? (
                    <>
                        {/* Warehouse Fields */}
                        <div className="formGroup">
                            <label className="formLabel">Mã kho <span style={{ color: 'var(--error)' }}>*</span></label>
                            <input
                                type="text"
                                className="formInput"
                                value={formData.code}
                                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                                placeholder="VD: WH-FG-01"
                                required
                            />
                        </div>

                        <div className="formGroup">
                            <label className="formLabel">Tên kho <span style={{ color: 'var(--error)' }}>*</span></label>
                            <input
                                type="text"
                                className="formInput"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="VD: Kho thành phẩm chính"
                                required
                            />
                        </div>

                        <div className="formGroup">
                            <label className="formLabel">Loại kho <span style={{ color: 'var(--error)' }}>*</span></label>
                            <select
                                className="formInput"
                                value={formData.warehouseType}
                                onChange={(e) => handleChange('warehouseType', e.target.value)}
                            >
                                <option value="FG">Kho thành phẩm (FG - Finished Goods)</option>
                                <option value="RM">Kho nguyên vật liệu (RM - Raw Materials)</option>
                                <option value="WIP">Kho bán thành phẩm (WIP - Work In Progress)</option>
                                <option value="QUARANTINE">Kho cách ly (Quarantine)</option>
                            </select>
                        </div>

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

                        <div className="formGroup">
                            <label className="formLabel">Địa chỉ</label>
                            <textarea
                                className="formInput"
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                placeholder="Địa chỉ kho hàng"
                                rows={3}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        {/* Location Fields */}
                        <div className="formGroup">
                            <label className="formLabel">Chọn kho <span style={{ color: 'var(--error)' }}>*</span></label>
                            <select
                                className="formInput"
                                value={formData.warehouseId}
                                onChange={(e) => handleChange('warehouseId', e.target.value)}
                                required
                            >
                                <option value="">-- Chọn kho --</option>
                                {warehouses.map(wh => (
                                    <option key={wh.id} value={wh.id}>
                                        {wh.code} - {wh.name} ({wh.warehouseType})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="formGroup">
                            <label className="formLabel">Mã vị trí <span style={{ color: 'var(--error)' }}>*</span></label>
                            <input
                                type="text"
                                className="formInput"
                                value={formData.locationCode}
                                onChange={(e) => handleChange('locationCode', e.target.value.toUpperCase())}
                                placeholder="VD: ZONE-A, RACK-A1, BIN-001"
                                required
                            />
                        </div>

                        <div className="formGroup">
                            <label className="formLabel">Tên vị trí <span style={{ color: 'var(--error)' }}>*</span></label>
                            <input
                                type="text"
                                className="formInput"
                                value={formData.locationName}
                                onChange={(e) => handleChange('locationName', e.target.value)}
                                placeholder="VD: Khu vực A, Kệ A1, Ngăn 001"
                                required
                            />
                        </div>

                        {formData.warehouseId && locations.length > 0 && (
                            <div className="formGroup">
                                <label className="formLabel">Vị trí cha (tùy chọn)</label>
                                <select
                                    className="formInput"
                                    value={formData.parentLocationId}
                                    onChange={(e) => handleChange('parentLocationId', e.target.value)}
                                >
                                    <option value="">-- Không có (cấp cao nhất) --</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>
                                            {loc.path || loc.code} - {loc.name}
                                        </option>
                                    ))}
                                </select>
                                <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    Chọn vị trí cha để tạo cấu trúc phân cấp (VD: Zone → Rack → Bin)
                                </small>
                            </div>
                        )}
                    </>
                )}

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
