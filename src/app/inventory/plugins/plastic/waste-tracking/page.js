'use client';

import { useState } from 'react';
import { InventoryIcon } from '@/components/icons';

export default function PlasticWasteTrackingPage() {
    const wasteData = [
        { id: 1, batch: 'LOT-20231201', material: 'Polypropylene Granules', sku: 'RM-PLASTIC-001', inputQty: 2000, outputQty: 1850, wasteQty: 150, wastePercent: 7.5, standard: 5.0, status: 'above-standard', date: '2023-12-15' },
        { id: 2, batch: 'LOT-20231205', material: 'PVC Resin', sku: 'RM-PVC-001', inputQty: 1500, outputQty: 1455, wasteQty: 45, wastePercent: 3.0, standard: 5.0, status: 'normal', date: '2023-12-18' },
        { id: 3, batch: 'LOT-20231210', material: 'HDPE Pellets', sku: 'RM-HDPE-001', inputQty: 3000, outputQty: 2730, wasteQty: 270, wastePercent: 9.0, standard: 6.0, status: 'above-standard', date: '2023-12-20' },
        { id: 4, batch: 'LOT-20231212', material: 'ABS Plastic', sku: 'RM-ABS-001', inputQty: 1200, outputQty: 1164, wasteQty: 36, wastePercent: 3.0, standard: 4.0, status: 'normal', date: '2023-12-22' },
    ];

    const getStatusBadge = (status) => {
        const statusMap = {
            'normal': 'badge-success',
            'above-standard': 'badge-error',
        };
        return statusMap[status] || 'badge-info';
    };

    const getStatusText = (status) => {
        const textMap = {
            'normal': 'Bình thường',
            'above-standard': 'Vượt tiêu chuẩn',
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
                        Quản lý Hao Hụt Nguyên Liệu Nhựa
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Theo dõi tỷ lệ hao hụt và phân tích nguyên nhân
                    </p>
                </div>
                <button className="btn btn-primary">
                    <InventoryIcon size={20} />
                    Nhập dữ liệu hao hụt
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tỷ lệ hao hụt TB
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                        5.6%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: 'var(--spacing-xs)' }}>
                        ↑ 0.8% so với tháng trước
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tiêu chuẩn cho phép
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                        5.0%
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tổng hao hụt
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error)' }}>
                        2.5 tấn
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                        Tháng này
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Giá trị hao hụt
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error)' }}>
                        ₫125M
                    </div>
                </div>
            </div>

            {/* Waste Tracking Table */}
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title">Theo dõi hao hụt theo batch</h3>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <input
                            type="date"
                            className="input"
                            style={{ width: '150px' }}
                        />
                        <select className="input" style={{ width: '200px' }}>
                            <option value="">Tất cả nguyên liệu</option>
                            <option value="PP">Polypropylene</option>
                            <option value="PVC">PVC Resin</option>
                            <option value="HDPE">HDPE Pellets</option>
                            <option value="ABS">ABS Plastic</option>
                        </select>
                    </div>
                </div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Batch</th>
                                <th>Nguyên liệu</th>
                                <th>SKU</th>
                                <th>Ngày SX</th>
                                <th>Đầu vào (kg)</th>
                                <th>Đầu ra (kg)</th>
                                <th>Hao hụt (kg)</th>
                                <th>Tỷ lệ hao hụt</th>
                                <th>Tiêu chuẩn</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wasteData.map((item) => (
                                <tr key={item.id} style={{
                                    background: item.status === 'above-standard' ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                                }}>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                                        {item.batch}
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{item.material}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{item.sku}</td>
                                    <td>{item.date}</td>
                                    <td>{item.inputQty.toLocaleString()}</td>
                                    <td>{item.outputQty.toLocaleString()}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--error)' }}>
                                        {item.wasteQty.toLocaleString()}
                                    </td>
                                    <td style={{
                                        fontWeight: 600,
                                        fontSize: '1.1rem',
                                        color: item.wastePercent > item.standard ? 'var(--error)' : 'var(--success)'
                                    }}>
                                        {item.wastePercent}%
                                    </td>
                                    <td>{item.standard}%</td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(item.status)}`}>
                                            {getStatusText(item.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-outline" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                                            Phân tích
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
                        <h3 className="card-title">Nguyên nhân hao hụt</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {[
                                { reason: 'Nhiệt độ ép không ổn định', percent: 35, qty: '875 kg' },
                                { reason: 'Chất lượng nguyên liệu kém', percent: 28, qty: '700 kg' },
                                { reason: 'Máy móc cũ, hao mòn', percent: 22, qty: '550 kg' },
                                { reason: 'Lỗi vận hành', percent: 15, qty: '375 kg' },
                            ].map((item) => (
                                <div key={item.reason} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500 }}>{item.reason}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {item.qty}
                                        </div>
                                    </div>
                                    <div style={{ width: '80px', textAlign: 'right', marginRight: 'var(--spacing-md)' }}>
                                        <span style={{ fontWeight: 600 }}>{item.percent}%</span>
                                    </div>
                                    <div style={{ width: '100px', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${item.percent}%`, height: '100%', background: 'var(--error)' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Xu hướng hao hụt</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {[
                                { month: 'Tháng 12/2023', rate: 5.6, trend: 'up' },
                                { month: 'Tháng 11/2023', rate: 4.8, trend: 'down' },
                                { month: 'Tháng 10/2023', rate: 5.2, trend: 'up' },
                                { month: 'Tháng 9/2023', rate: 4.5, trend: 'down' },
                            ].map((item) => (
                                <div key={item.month} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 500 }}>{item.month}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                        <span style={{
                                            fontWeight: 600,
                                            fontSize: '1.1rem',
                                            color: item.rate > 5.0 ? 'var(--error)' : 'var(--success)'
                                        }}>
                                            {item.rate}%
                                        </span>
                                        <span style={{ fontSize: '1.2rem', color: item.trend === 'up' ? 'var(--error)' : 'var(--success)' }}>
                                            {item.trend === 'up' ? '↑' : '↓'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
