'use client';

import { useState } from 'react';
import { InventoryIcon } from '@/components/icons';

export default function WoodMoisturePage() {
    const moistureData = [
        { id: 1, batch: 'LOT-WOOD-2023-12-001', woodType: 'Oak Wood Planks', sku: 'WD-OAK-001', qty: 500, uom: 'm³', currentMoisture: 12.5, standardMin: 8, standardMax: 12, status: 'above-standard', location: 'Drying Room A', lastCheck: '2023-12-20' },
        { id: 2, batch: 'LOT-WOOD-2023-12-002', woodType: 'Pine Wood Boards', sku: 'WD-PINE-001', qty: 350, uom: 'm³', currentMoisture: 10.2, standardMin: 8, standardMax: 12, status: 'normal', location: 'Drying Room B', lastCheck: '2023-12-21' },
        { id: 3, batch: 'LOT-WOOD-2023-11-045', woodType: 'Mahogany Lumber', sku: 'WD-MAH-001', qty: 200, uom: 'm³', currentMoisture: 7.5, standardMin: 8, standardMax: 12, status: 'below-standard', location: 'Warehouse C', lastCheck: '2023-12-19' },
        { id: 4, batch: 'LOT-WOOD-2023-12-003', woodType: 'Teak Wood Slabs', sku: 'WD-TEAK-001', qty: 150, uom: 'm³', currentMoisture: 9.8, standardMin: 8, standardMax: 12, status: 'normal', location: 'Drying Room A', lastCheck: '2023-12-22' },
    ];

    const getStatusBadge = (status) => {
        const statusMap = {
            'normal': 'badge-success',
            'above-standard': 'badge-error',
            'below-standard': 'badge-warning',
        };
        return statusMap[status] || 'badge-info';
    };

    const getStatusText = (status) => {
        const textMap = {
            'normal': 'Đạt chuẩn',
            'above-standard': 'Quá ẩm',
            'below-standard': 'Quá khô',
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
                        Quản lý Độ Ẩm Gỗ
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Theo dõi và kiểm soát độ ẩm để đảm bảo chất lượng gỗ
                    </p>
                </div>
                <button className="btn btn-primary">
                    <InventoryIcon size={20} />
                    Nhập kết quả đo
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Độ ẩm trung bình
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                        10.0%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                        Trong tiêu chuẩn 8-12%
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Đạt chuẩn
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                        142
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                        batches
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Quá ẩm
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error)' }}>
                        8
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: 'var(--spacing-xs)' }}>
                        Cần sấy thêm
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Quá khô
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                        5
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: 'var(--spacing-xs)' }}>
                        Cần điều chỉnh
                    </div>
                </div>
            </div>

            {/* Moisture Tracking Table */}
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title">Theo dõi độ ẩm theo batch</h3>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <select className="input" style={{ width: '200px' }}>
                            <option value="">Tất cả loại gỗ</option>
                            <option value="oak">Oak (Sồi)</option>
                            <option value="pine">Pine (Thông)</option>
                            <option value="mahogany">Mahogany (Gỗ gụ)</option>
                            <option value="teak">Teak (Gỗ tếch)</option>
                        </select>
                        <select className="input" style={{ width: '150px' }}>
                            <option value="">Tất cả trạng thái</option>
                            <option value="normal">Đạt chuẩn</option>
                            <option value="above-standard">Quá ẩm</option>
                            <option value="below-standard">Quá khô</option>
                        </select>
                    </div>
                </div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Batch</th>
                                <th>Loại gỗ</th>
                                <th>SKU</th>
                                <th>Số lượng</th>
                                <th>Độ ẩm hiện tại</th>
                                <th>Tiêu chuẩn</th>
                                <th>Vị trí</th>
                                <th>Kiểm tra lần cuối</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {moistureData.map((item) => (
                                <tr key={item.id} style={{
                                    background: item.status !== 'normal' ? 'rgba(245, 158, 11, 0.05)' : 'transparent'
                                }}>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                                        {item.batch}
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{item.woodType}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{item.sku}</td>
                                    <td>{item.qty} {item.uom}</td>
                                    <td style={{
                                        fontWeight: 600,
                                        fontSize: '1.1rem',
                                        color: item.currentMoisture < item.standardMin ? 'var(--warning)' :
                                            item.currentMoisture > item.standardMax ? 'var(--error)' : 'var(--success)'
                                    }}>
                                        {item.currentMoisture}%
                                    </td>
                                    <td>{item.standardMin}-{item.standardMax}%</td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.location}</td>
                                    <td>{item.lastCheck}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(item.status)}`}>
                                            {getStatusText(item.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-outline" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                                            Lịch sử
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-2" style={{ marginTop: 'var(--spacing-2xl)', gap: 'var(--spacing-xl)' }}>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Hành động khuyến nghị</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {[
                                { action: 'Tiếp tục sấy Oak Wood Planks', batch: 'LOT-WOOD-2023-12-001', moisture: 12.5, target: 10, urgency: 'error' },
                                { action: 'Tăng độ ẩm cho Mahogany Lumber', batch: 'LOT-WOOD-2023-11-045', moisture: 7.5, target: 9, urgency: 'warning' },
                                { action: 'Kiểm tra lại Pine Wood Boards', batch: 'LOT-WOOD-2023-12-002', moisture: 10.2, target: 10, urgency: 'info' },
                            ].map((item, idx) => (
                                <div key={idx} style={{
                                    padding: 'var(--spacing-md)',
                                    background: item.urgency === 'error' ? 'rgba(239, 68, 68, 0.1)' : item.urgency === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-secondary)',
                                    borderRadius: '8px',
                                    borderLeft: `4px solid ${item.urgency === 'error' ? 'var(--error)' : item.urgency === 'warning' ? 'var(--warning)' : 'var(--info)'}`,
                                }}>
                                    <div style={{ fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>{item.action}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                                        {item.batch}
                                    </div>
                                    <div style={{ fontSize: '0.85rem' }}>
                                        Hiện tại: <span style={{ fontWeight: 600 }}>{item.moisture}%</span> → Mục tiêu: <span style={{ fontWeight: 600 }}>{item.target}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Quy trình kiểm soát độ ẩm</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                            <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>1. Nhập kho</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Đo độ ẩm ban đầu và ghi nhận vào hệ thống
                                </div>
                            </div>

                            <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>2. Sấy khô</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Chuyển vào phòng sấy và theo dõi độ ẩm hàng ngày
                                </div>
                            </div>

                            <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>3. Kiểm tra định kỳ</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Đo độ ẩm mỗi 3-5 ngày và cập nhật vào hệ thống
                                </div>
                            </div>

                            <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>4. Đạt chuẩn</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Khi độ ẩm đạt 8-12%, chuyển sang kho thành phẩm
                                </div>
                            </div>

                            <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>5. Bảo quản</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Kiểm tra định kỳ để đảm bảo độ ẩm ổn định
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
