'use client';

import { useState } from 'react';
import { InventoryIcon } from '@/components/icons';

export default function BatchSerialPage() {
    const [activeTab, setActiveTab] = useState('batch'); // batch or serial

    const batches = [
        { id: 'LOT-20231201', item: 'Stainless Steel Sheet 304', sku: 'RM-STEEL-001', mfgDate: '2023-12-01', expiryDate: '2025-12-01', qty: 5000, uom: 'kg', status: 'active', locations: 2 },
        { id: 'LOT-20231205', item: 'Polypropylene Granules', sku: 'RM-PLASTIC-001', mfgDate: '2023-12-05', expiryDate: '2024-12-05', qty: 450, uom: 'kg', status: 'active', locations: 1 },
        { id: 'LOT-20231210', item: 'Aluminum Rods', sku: 'RM-ALU-001', mfgDate: '2023-12-10', expiryDate: '2026-12-10', qty: 0, uom: 'kg', status: 'depleted', locations: 0 },
        { id: 'LOT-20231115', item: 'Food Product A', sku: 'FD-PROD-A', mfgDate: '2023-11-15', expiryDate: '2024-01-15', qty: 250, uom: 'kg', status: 'expiring', locations: 1 },
    ];

    const serials = [
        { id: 'SN-001-045', item: 'Super Widget X', sku: 'FG-WIDGET-X', location: 'WH-MAIN/ZONE-B/RACK-B1', status: 'in-stock', mfgDate: '2023-11-20', warranty: '2025-11-20' },
        { id: 'SN-001-046', item: 'Super Widget X', sku: 'FG-WIDGET-X', location: 'WH-MAIN/ZONE-B/RACK-B1', status: 'in-stock', mfgDate: '2023-11-20', warranty: '2025-11-20' },
        { id: 'SN-002-012', item: 'Industrial Machine A', sku: 'MC-IND-A', location: 'Customer Site A', status: 'sold', mfgDate: '2023-10-15', warranty: '2026-10-15' },
        { id: 'SN-003-008', item: 'Precision Tool B', sku: 'TL-PREC-B', location: 'WH-MAIN/ZONE-C/RACK-C1', status: 'quarantine', mfgDate: '2023-12-01', warranty: '2025-12-01' },
    ];

    const getStatusBadge = (status) => {
        const statusMap = {
            'active': 'badge-success',
            'depleted': 'badge-error',
            'expiring': 'badge-warning',
            'in-stock': 'badge-success',
            'sold': 'badge-info',
            'quarantine': 'badge-warning',
        };
        return statusMap[status] || 'badge-info';
    };

    const getStatusText = (status) => {
        const textMap = {
            'active': 'Hoạt động',
            'depleted': 'Đã hết',
            'expiring': 'Sắp hết hạn',
            'in-stock': 'Trong kho',
            'sold': 'Đã bán',
            'quarantine': 'Kiểm định',
        };
        return textMap[status] || status;
    };

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
                        Quản lý Batch & Serial
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Theo dõi và truy xuất nguồn gốc theo batch/lot và serial number
                    </p>
                </div>
                <button className="btn btn-primary">
                    <InventoryIcon size={20} />
                    {activeTab === 'batch' ? 'Tạo batch mới' : 'Đăng ký serial mới'}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tổng batches
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        156
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Batches hoạt động
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                        142
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tổng serials
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                        2,458
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Sắp hết hạn
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                        8
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', borderBottom: '2px solid var(--border-color)' }}>
                    {[
                        { id: 'batch', label: 'Batch Management' },
                        { id: 'serial', label: 'Serial Tracking' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: 'var(--spacing-md) var(--spacing-lg)',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: activeTab === tab.id ? 600 : 400,
                                cursor: 'pointer',
                                marginBottom: '-2px',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Batch Table */}
            {activeTab === 'batch' && (
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="card-title">Danh sách Batches/Lots</h3>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm batch..."
                                className="input"
                                style={{ width: '300px' }}
                            />
                            <select className="input" style={{ width: '150px' }}>
                                <option value="">Tất cả trạng thái</option>
                                <option value="active">Hoạt động</option>
                                <option value="depleted">Đã hết</option>
                                <option value="expiring">Sắp hết hạn</option>
                            </select>
                        </div>
                    </div>
                    <div className="card-body">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Batch/Lot</th>
                                    <th>Sản phẩm</th>
                                    <th>SKU</th>
                                    <th>Ngày SX</th>
                                    <th>Hạn sử dụng</th>
                                    <th>Số lượng</th>
                                    <th>Vị trí</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batches.map((batch) => (
                                    <tr key={batch.id}>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                                            {batch.id}
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{batch.item}</td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{batch.sku}</td>
                                        <td>{batch.mfgDate}</td>
                                        <td>{batch.expiryDate}</td>
                                        <td style={{ fontWeight: 600 }}>
                                            {batch.qty} {batch.uom}
                                        </td>
                                        <td>{batch.locations} vị trí</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(batch.status)}`}>
                                                {getStatusText(batch.status)}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-outline" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                                                Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Serial Table */}
            {activeTab === 'serial' && (
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="card-title">Danh sách Serial Numbers</h3>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm serial..."
                                className="input"
                                style={{ width: '300px' }}
                            />
                            <select className="input" style={{ width: '150px' }}>
                                <option value="">Tất cả trạng thái</option>
                                <option value="in-stock">Trong kho</option>
                                <option value="sold">Đã bán</option>
                                <option value="quarantine">Kiểm định</option>
                            </select>
                        </div>
                    </div>
                    <div className="card-body">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Serial Number</th>
                                    <th>Sản phẩm</th>
                                    <th>SKU</th>
                                    <th>Vị trí</th>
                                    <th>Ngày SX</th>
                                    <th>Bảo hành đến</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {serials.map((serial) => (
                                    <tr key={serial.id}>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                                            {serial.id}
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{serial.item}</td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{serial.sku}</td>
                                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{serial.location}</td>
                                        <td>{serial.mfgDate}</td>
                                        <td>{serial.warranty}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(serial.status)}`}>
                                                {getStatusText(serial.status)}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-outline" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                                                Truy xuất
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
