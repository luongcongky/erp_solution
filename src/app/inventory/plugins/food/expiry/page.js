'use client';

import { useState } from 'react';
import { InventoryIcon } from '@/components/icons';

export default function FoodExpiryPage() {
    const expiringItems = [
        { id: 1, item: 'Fresh Milk A', sku: 'FD-MILK-A', batch: 'LOT-20231115', qty: 250, uom: 'liters', mfgDate: '2023-11-15', expiryDate: '2024-01-15', daysLeft: 14, location: 'WH-MAIN/ZONE-COLD/RACK-C1', status: 'expiring-soon' },
        { id: 2, item: 'Yogurt Premium', sku: 'FD-YOGURT-P', batch: 'LOT-20231201', qty: 180, uom: 'kg', mfgDate: '2023-12-01', expiryDate: '2024-01-01', daysLeft: 1, location: 'WH-MAIN/ZONE-COLD/RACK-C2', status: 'critical' },
        { id: 3, item: 'Cheese Slices', sku: 'FD-CHEESE-S', batch: 'LOT-20231120', qty: 120, uom: 'kg', mfgDate: '2023-11-20', expiryDate: '2024-02-20', daysLeft: 51, location: 'WH-MAIN/ZONE-COLD/RACK-C3', status: 'normal' },
        { id: 4, item: 'Butter Blocks', sku: 'FD-BUTTER-B', batch: 'LOT-20231110', qty: 85, uom: 'kg', mfgDate: '2023-11-10', expiryDate: '2024-01-10', daysLeft: 9, location: 'WH-MAIN/ZONE-COLD/RACK-C1', status: 'expiring-soon' },
    ];

    const getStatusBadge = (status) => {
        const statusMap = {
            'critical': 'badge-error',
            'expiring-soon': 'badge-warning',
            'normal': 'badge-success',
        };
        return statusMap[status] || 'badge-info';
    };

    const getStatusText = (status) => {
        const textMap = {
            'critical': 'Khẩn cấp',
            'expiring-soon': 'Sắp hết hạn',
            'normal': 'Bình thường',
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
                        Quản lý Ngày Hết Hạn
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Theo dõi FEFO và cảnh báo sản phẩm sắp hết hạn
                    </p>
                </div>
                <button className="btn btn-primary">
                    <InventoryIcon size={20} />
                    Xem lịch hết hạn
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Hết hạn trong 7 ngày
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error)' }}>
                        8
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: 'var(--spacing-xs)' }}>
                        Cần xử lý ngay
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Hết hạn trong 30 ngày
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                        24
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Đã hết hạn
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error)' }}>
                        2
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                        Cần loại bỏ
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Giá trị sắp hết hạn
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                        ₫85M
                    </div>
                </div>
            </div>

            {/* Expiring Items Table */}
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title">Sản phẩm sắp hết hạn</h3>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <select className="input" style={{ width: '150px' }}>
                            <option value="">Tất cả mức độ</option>
                            <option value="critical">Khẩn cấp (≤3 ngày)</option>
                            <option value="expiring-soon">Sắp hết hạn (≤14 ngày)</option>
                            <option value="normal">Bình thường</option>
                        </select>
                        <select className="input" style={{ width: '200px' }}>
                            <option value="">Tất cả vị trí</option>
                            <option value="ZONE-COLD">Kho lạnh</option>
                            <option value="ZONE-DRY">Kho khô</option>
                        </select>
                    </div>
                </div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Sản phẩm</th>
                                <th>Batch</th>
                                <th>Số lượng</th>
                                <th>Ngày SX</th>
                                <th>Hạn sử dụng</th>
                                <th>Còn lại</th>
                                <th>Vị trí</th>
                                <th>Mức độ</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expiringItems.map((item) => (
                                <tr key={item.id} style={{
                                    background: item.status === 'critical' ? 'rgba(239, 68, 68, 0.1)' : item.status === 'expiring-soon' ? 'rgba(245, 158, 11, 0.05)' : 'transparent'
                                }}>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                                        {item.sku}
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{item.item}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{item.batch}</td>
                                    <td style={{ fontWeight: 600 }}>
                                        {item.qty} {item.uom}
                                    </td>
                                    <td>{item.mfgDate}</td>
                                    <td style={{ fontWeight: 600 }}>{item.expiryDate}</td>
                                    <td style={{
                                        fontWeight: 600,
                                        fontSize: '1.1rem',
                                        color: item.daysLeft <= 3 ? 'var(--error)' : item.daysLeft <= 14 ? 'var(--warning)' : 'var(--success)'
                                    }}>
                                        {item.daysLeft} ngày
                                    </td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.location}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(item.status)}`}>
                                            {getStatusText(item.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                            {item.status === 'critical' && (
                                                <button className="btn btn-error" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                                                    Giảm giá
                                                </button>
                                            )}
                                            <button className="btn btn-outline" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                                                Chi tiết
                                            </button>
                                        </div>
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
                        <h3 className="card-title">FEFO - First Expired First Out</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: 'var(--spacing-md)' }}>
                            <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>Quy tắc xuất kho</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Hệ thống tự động ưu tiên xuất batch có hạn sử dụng gần nhất để giảm thiểu hao phí
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            <div style={{ fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>Thứ tự xuất kho được đề xuất:</div>
                            {[
                                { item: 'Yogurt Premium', batch: 'LOT-20231201', expiry: '2024-01-01', priority: 1 },
                                { item: 'Butter Blocks', batch: 'LOT-20231110', expiry: '2024-01-10', priority: 2 },
                                { item: 'Fresh Milk A', batch: 'LOT-20231115', expiry: '2024-01-15', priority: 3 },
                            ].map((item) => (
                                <div key={item.batch} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'var(--spacing-sm)',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: '4px',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 600,
                                        }}>
                                            {item.priority}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{item.item}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {item.batch}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--error)' }}>
                                            {item.expiry}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Hành động khuyến nghị</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {[
                                { action: 'Giảm giá 30% cho Yogurt Premium', urgency: 'critical', daysLeft: 1 },
                                { action: 'Chuyển Butter Blocks lên kệ trưng bày', urgency: 'warning', daysLeft: 9 },
                                { action: 'Thông báo bộ phận sales về Fresh Milk A', urgency: 'warning', daysLeft: 14 },
                                { action: 'Kiểm tra nhiệt độ kho lạnh', urgency: 'info', daysLeft: null },
                            ].map((item, idx) => (
                                <div key={idx} style={{
                                    padding: 'var(--spacing-md)',
                                    background: item.urgency === 'critical' ? 'rgba(239, 68, 68, 0.1)' : item.urgency === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-secondary)',
                                    borderRadius: '8px',
                                    borderLeft: `4px solid ${item.urgency === 'critical' ? 'var(--error)' : item.urgency === 'warning' ? 'var(--warning)' : 'var(--info)'}`,
                                }}>
                                    <div style={{ fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>{item.action}</div>
                                    {item.daysLeft !== null && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            Còn {item.daysLeft} ngày
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
