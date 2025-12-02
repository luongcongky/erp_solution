'use client';

import { useState } from 'react';
import { InventoryIcon } from '@/components/icons';

export default function DiscrepancyPage() {
    const discrepancies = [
        { id: 'DISC-2023-12-001', item: 'Stainless Steel Sheet 304', sku: 'RM-STEEL-001', systemQty: 5000, actualQty: 4950, difference: -50, uom: 'kg', source: 'Inventory Count', date: '2023-12-15', status: 'pending', value: '₫5,000,000' },
        { id: 'DISC-2023-12-002', item: 'Polypropylene Granules', sku: 'RM-PLASTIC-001', systemQty: 500, actualQty: 450, difference: -50, uom: 'kg', source: 'Inventory Count', date: '2023-12-15', status: 'approved', value: '₫2,500,000' },
        { id: 'DISC-2023-12-003', item: 'Super Widget X', sku: 'FG-WIDGET-X', systemQty: 50, actualQty: 52, difference: 2, uom: 'pcs', source: 'Cycle Count', date: '2023-12-18', status: 'pending', value: '₫600,000' },
        { id: 'DISC-2023-12-004', item: 'Aluminum Rods', sku: 'RM-ALU-001', systemQty: 100, actualQty: 0, difference: -100, uom: 'kg', source: 'Manual Adjustment', date: '2023-12-10', status: 'rejected', value: '₫8,000,000' },
    ];

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': 'badge-warning',
            'approved': 'badge-success',
            'rejected': 'badge-error',
        };
        return statusMap[status] || 'badge-info';
    };

    const getStatusText = (status) => {
        const textMap = {
            'pending': 'Chờ duyệt',
            'approved': 'Đã duyệt',
            'rejected': 'Từ chối',
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
                        Xử lý Chênh Lệch Kho
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Quản lý và phê duyệt các chênh lệch tồn kho
                    </p>
                </div>
                <button className="btn btn-primary">
                    <InventoryIcon size={20} />
                    Tạo điều chỉnh thủ công
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tổng chênh lệch
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        45
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                        Năm 2023
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Chờ duyệt
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                        8
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Đã duyệt
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                        32
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Giá trị chênh lệch
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error)' }}>
                        ₫125M
                    </div>
                </div>
            </div>

            {/* Discrepancies Table */}
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title">Danh sách chênh lệch</h3>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="input"
                            style={{ width: '300px' }}
                        />
                        <select className="input" style={{ width: '150px' }}>
                            <option value="">Tất cả nguồn</option>
                            <option value="inventory-count">Inventory Count</option>
                            <option value="cycle-count">Cycle Count</option>
                            <option value="manual">Manual Adjustment</option>
                        </select>
                        <select className="input" style={{ width: '150px' }}>
                            <option value="">Tất cả trạng thái</option>
                            <option value="pending">Chờ duyệt</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="rejected">Từ chối</option>
                        </select>
                    </div>
                </div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Mã chênh lệch</th>
                                <th>SKU</th>
                                <th>Sản phẩm</th>
                                <th>Số lượng hệ thống</th>
                                <th>Số lượng thực tế</th>
                                <th>Chênh lệch</th>
                                <th>Nguồn</th>
                                <th>Ngày phát hiện</th>
                                <th>Giá trị</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {discrepancies.map((disc) => (
                                <tr key={disc.id}>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                                        {disc.id}
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{disc.sku}</td>
                                    <td style={{ fontWeight: 500 }}>{disc.item}</td>
                                    <td>{disc.systemQty} {disc.uom}</td>
                                    <td>{disc.actualQty} {disc.uom}</td>
                                    <td style={{
                                        fontWeight: 600,
                                        color: disc.difference < 0 ? 'var(--error)' : 'var(--success)'
                                    }}>
                                        {disc.difference > 0 ? '+' : ''}{disc.difference} {disc.uom}
                                    </td>
                                    <td style={{ fontSize: '0.85rem' }}>{disc.source}</td>
                                    <td>{disc.date}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--error)' }}>{disc.value}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(disc.status)}`}>
                                            {getStatusText(disc.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                            {disc.status === 'pending' && (
                                                <>
                                                    <button className="btn btn-success" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                                                        Duyệt
                                                    </button>
                                                    <button className="btn btn-error" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                                                        Từ chối
                                                    </button>
                                                </>
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
                        <h3 className="card-title">Nguyên nhân chênh lệch</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {[
                                { reason: 'Sai sót nhập liệu', count: 18, percent: 40, value: '₫45M' },
                                { reason: 'Hao hụt tự nhiên', count: 12, percent: 27, value: '₫35M' },
                                { reason: 'Chưa cập nhật xuất kho', count: 10, percent: 22, value: '₫30M' },
                                { reason: 'Lý do khác', count: 5, percent: 11, value: '₫15M' },
                            ].map((item) => (
                                <div key={item.reason} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500 }}>{item.reason}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {item.count} trường hợp • {item.value}
                                        </div>
                                    </div>
                                    <div style={{ width: '100px', textAlign: 'right', marginRight: 'var(--spacing-md)' }}>
                                        <span style={{ fontWeight: 600 }}>{item.percent}%</span>
                                    </div>
                                    <div style={{ width: '80px', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${item.percent}%`, height: '100%', background: 'var(--error)' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Workflow phê duyệt</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                            <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>Bước 1: Phát hiện chênh lệch</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Hệ thống tự động tạo bản ghi chênh lệch từ kiểm kê hoặc điều chỉnh thủ công
                                </div>
                            </div>
                            <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>Bước 2: Phân tích nguyên nhân</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Người phụ trách điền thông tin nguyên nhân và đề xuất xử lý
                                </div>
                            </div>
                            <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>Bước 3: Phê duyệt</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Quản lý kho phê duyệt và tạo phiếu điều chỉnh tồn kho
                                </div>
                            </div>
                            <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>Bước 4: Cập nhật hệ thống</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Số liệu tồn kho được cập nhật tự động sau khi phê duyệt
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
