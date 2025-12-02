'use client';

import { useState } from 'react';
import { InventoryIcon } from '@/components/icons';

export default function MechanicalSerialPage() {
    const equipment = [
        { id: 1, serial: 'SN-MC-2023-001', item: 'CNC Machine Pro X500', sku: 'EQ-CNC-X500', location: 'Production Floor A', status: 'in-use', mfgDate: '2023-06-15', warranty: '2026-06-15', lastMaintenance: '2023-11-20', nextMaintenance: '2024-02-20', condition: 'good' },
        { id: 2, serial: 'SN-MC-2023-002', item: 'Hydraulic Press HP-2000', sku: 'EQ-HP-2000', location: 'Production Floor B', status: 'in-use', mfgDate: '2023-08-10', warranty: '2026-08-10', lastMaintenance: '2023-12-01', nextMaintenance: '2024-03-01', condition: 'good' },
        { id: 3, serial: 'SN-MC-2022-045', item: 'Lathe Machine LM-350', sku: 'EQ-LM-350', location: 'Maintenance', status: 'maintenance', mfgDate: '2022-03-20', warranty: '2025-03-20', lastMaintenance: '2023-09-15', nextMaintenance: '2023-12-25', condition: 'needs-repair' },
        { id: 4, serial: 'SN-MC-2023-003', item: 'Welding Robot WR-500', sku: 'EQ-WR-500', location: 'WH-MAIN/ZONE-B', status: 'in-stock', mfgDate: '2023-10-05', warranty: '2026-10-05', lastMaintenance: null, nextMaintenance: '2024-01-05', condition: 'new' },
    ];

    const getStatusBadge = (status) => {
        const statusMap = {
            'in-use': 'badge-success',
            'in-stock': 'badge-info',
            'maintenance': 'badge-warning',
            'sold': 'badge-primary',
        };
        return statusMap[status] || 'badge-info';
    };

    const getStatusText = (status) => {
        const textMap = {
            'in-use': 'Đang sử dụng',
            'in-stock': 'Trong kho',
            'maintenance': 'Bảo trì',
            'sold': 'Đã bán',
        };
        return textMap[status] || status;
    };

    const getConditionBadge = (condition) => {
        const conditionMap = {
            'new': 'badge-success',
            'good': 'badge-success',
            'needs-repair': 'badge-error',
        };
        return conditionMap[condition] || 'badge-info';
    };

    const getConditionText = (condition) => {
        const textMap = {
            'new': 'Mới',
            'good': 'Tốt',
            'needs-repair': 'Cần sửa chữa',
        };
        return textMap[condition] || condition;
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
                        Quản lý Serial Thiết Bị Cơ Khí
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Theo dõi thiết bị, bảo trì và lịch sử sử dụng
                    </p>
                </div>
                <button className="btn btn-primary">
                    <InventoryIcon size={20} />
                    Đăng ký thiết bị mới
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tổng thiết bị
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        156
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Đang sử dụng
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                        128
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Đang bảo trì
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                        8
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Cần bảo trì trong 30 ngày
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error)' }}>
                        15
                    </div>
                </div>
            </div>

            {/* Equipment Table */}
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title">Danh sách thiết bị</h3>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <input
                            type="text"
                            placeholder="Tìm serial hoặc tên thiết bị..."
                            className="input"
                            style={{ width: '300px' }}
                        />
                        <select className="input" style={{ width: '150px' }}>
                            <option value="">Tất cả trạng thái</option>
                            <option value="in-use">Đang sử dụng</option>
                            <option value="in-stock">Trong kho</option>
                            <option value="maintenance">Bảo trì</option>
                        </select>
                    </div>
                </div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Serial Number</th>
                                <th>Thiết bị</th>
                                <th>SKU</th>
                                <th>Vị trí</th>
                                <th>Ngày SX</th>
                                <th>Bảo hành đến</th>
                                <th>Bảo trì lần cuối</th>
                                <th>Bảo trì tiếp theo</th>
                                <th>Tình trạng</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {equipment.map((item) => (
                                <tr key={item.id}>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                                        {item.serial}
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{item.item}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{item.sku}</td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.location}</td>
                                    <td>{item.mfgDate}</td>
                                    <td>{item.warranty}</td>
                                    <td>{item.lastMaintenance || '-'}</td>
                                    <td style={{ fontWeight: 600 }}>{item.nextMaintenance}</td>
                                    <td>
                                        <span className={`badge ${getConditionBadge(item.condition)}`}>
                                            {getConditionText(item.condition)}
                                        </span>
                                    </td>
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
                        <h3 className="card-title">Lịch bảo trì sắp tới</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {[
                                { equipment: 'Lathe Machine LM-350', serial: 'SN-MC-2022-045', date: '2023-12-25', daysLeft: 5, urgency: 'critical' },
                                { equipment: 'Welding Robot WR-500', serial: 'SN-MC-2023-003', date: '2024-01-05', daysLeft: 16, urgency: 'warning' },
                                { equipment: 'CNC Machine Pro X500', serial: 'SN-MC-2023-001', date: '2024-02-20', daysLeft: 62, urgency: 'normal' },
                                { equipment: 'Hydraulic Press HP-2000', serial: 'SN-MC-2023-002', date: '2024-03-01', daysLeft: 72, urgency: 'normal' },
                            ].map((item) => (
                                <div key={item.serial} style={{
                                    padding: 'var(--spacing-md)',
                                    background: item.urgency === 'critical' ? 'rgba(239, 68, 68, 0.1)' : item.urgency === 'warning' ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-secondary)',
                                    borderRadius: '8px',
                                    borderLeft: `4px solid ${item.urgency === 'critical' ? 'var(--error)' : item.urgency === 'warning' ? 'var(--warning)' : 'var(--success)'}`,
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{item.equipment}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {item.serial}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 600 }}>{item.date}</div>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: item.urgency === 'critical' ? 'var(--error)' : item.urgency === 'warning' ? 'var(--warning)' : 'var(--text-muted)'
                                            }}>
                                                Còn {item.daysLeft} ngày
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Traceability & Warranty</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                            <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>Truy xuất nguồn gốc</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                                    Mỗi thiết bị được gắn serial number duy nhất để theo dõi:
                                </div>
                                <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 'var(--spacing-lg)' }}>
                                    <li>Lịch sử di chuyển giữa các vị trí</li>
                                    <li>Lịch sử bảo trì và sửa chữa</li>
                                    <li>Lịch sử sử dụng và vận hành</li>
                                    <li>Thông tin bảo hành</li>
                                </ul>
                            </div>

                            <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>Quản lý bảo hành</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Hệ thống tự động cảnh báo khi bảo hành sắp hết và theo dõi các yêu cầu bảo hành
                                </div>
                            </div>

                            <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>Lịch bảo trì định kỳ</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Tự động tạo lịch bảo trì dựa trên khuyến nghị nhà sản xuất và lịch sử sử dụng
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
