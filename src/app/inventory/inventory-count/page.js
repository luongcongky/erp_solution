'use client';

import { useState } from 'react';
import { InventoryIcon } from '@/components/icons';

export default function InventoryCountPage() {
    const counts = [
        { id: 'CNT-2023-12-001', name: 'Kiểm kê cuối năm 2023', date: '2023-12-15', warehouse: 'WH-MAIN', items: 248, counted: 248, discrepancies: 12, status: 'completed', value: '₫3.2B' },
        { id: 'CNT-2023-12-002', name: 'Kiểm kê Zone A', date: '2023-12-20', warehouse: 'WH-MAIN/ZONE-A', items: 125, counted: 98, discrepancies: 0, status: 'in-progress', value: '₫1.8B' },
        { id: 'CNT-2023-11-001', name: 'Kiểm kê tháng 11', date: '2023-11-30', warehouse: 'WH-MAIN', items: 235, counted: 235, discrepancies: 8, status: 'completed', value: '₫3.0B' },
        { id: 'CNT-2024-01-001', name: 'Kiểm kê đầu năm 2024', date: '2024-01-05', warehouse: 'WH-MAIN', items: 250, counted: 0, discrepancies: 0, status: 'draft', value: '₫3.3B' },
    ];

    const getStatusBadge = (status) => {
        const statusMap = {
            'completed': 'badge-success',
            'in-progress': 'badge-warning',
            'draft': 'badge-info',
        };
        return statusMap[status] || 'badge-info';
    };

    const getStatusText = (status) => {
        const textMap = {
            'completed': 'Hoàn thành',
            'in-progress': 'Đang thực hiện',
            'draft': 'Nháp',
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
                        Kiểm Kê Kho
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Lập kế hoạch và thực hiện kiểm kê định kỳ
                    </p>
                </div>
                <button className="btn btn-primary">
                    <InventoryIcon size={20} />
                    Tạo kế hoạch kiểm kê
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tổng đợt kiểm kê
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        24
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                        Năm 2023
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Đang thực hiện
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                        2
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Độ chính xác TB
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                        96.5%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: 'var(--spacing-xs)' }}>
                        ↑ 2% so với năm trước
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Chênh lệch phát hiện
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error)' }}>
                        45
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                        Năm 2023
                    </div>
                </div>
            </div>

            {/* Inventory Counts Table */}
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title">Danh sách kiểm kê</h3>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="input"
                            style={{ width: '300px' }}
                        />
                        <select className="input" style={{ width: '150px' }}>
                            <option value="">Tất cả trạng thái</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="in-progress">Đang thực hiện</option>
                            <option value="draft">Nháp</option>
                        </select>
                    </div>
                </div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Mã kiểm kê</th>
                                <th>Tên đợt kiểm kê</th>
                                <th>Ngày thực hiện</th>
                                <th>Kho/Vị trí</th>
                                <th>Items</th>
                                <th>Đã kiểm</th>
                                <th>Chênh lệch</th>
                                <th>Giá trị</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {counts.map((count) => (
                                <tr key={count.id}>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                                        {count.id}
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{count.name}</td>
                                    <td>{count.date}</td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{count.warehouse}</td>
                                    <td>{count.items}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                            <span style={{ fontWeight: 600 }}>{count.counted}</span>
                                            <div style={{ width: '60px', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${(count.counted / count.items) * 100}%`,
                                                    height: '100%',
                                                    background: count.counted === count.items ? 'var(--success)' : 'var(--warning)'
                                                }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {count.discrepancies > 0 ? (
                                            <span style={{ color: 'var(--error)', fontWeight: 600 }}>{count.discrepancies}</span>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)' }}>-</span>
                                        )}
                                    </td>
                                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>{count.value}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(count.status)}`}>
                                            {getStatusText(count.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                            <button className="btn btn-outline" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                                                {count.status === 'draft' ? 'Bắt đầu' : count.status === 'in-progress' ? 'Tiếp tục' : 'Xem'}
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
                        <h3 className="card-title">Lịch sử kiểm kê</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {[
                                { month: 'Tháng 12/2023', counts: 2, accuracy: 95.2, discrepancies: 12 },
                                { month: 'Tháng 11/2023', counts: 1, accuracy: 94.8, discrepancies: 8 },
                                { month: 'Tháng 10/2023', counts: 2, accuracy: 96.5, discrepancies: 6 },
                                { month: 'Tháng 9/2023', counts: 2, accuracy: 97.1, discrepancies: 4 },
                            ].map((history) => (
                                <div key={history.month} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{history.month}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {history.counts} đợt kiểm kê • {history.discrepancies} chênh lệch
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 600, color: history.accuracy >= 96 ? 'var(--success)' : 'var(--warning)' }}>
                                            {history.accuracy}%
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            Độ chính xác
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Chênh lệch phổ biến</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {[
                                { reason: 'Sai sót nhập liệu', count: 18, percent: 40 },
                                { reason: 'Hao hụt tự nhiên', count: 12, percent: 27 },
                                { reason: 'Chưa cập nhật xuất kho', count: 10, percent: 22 },
                                { reason: 'Lý do khác', count: 5, percent: 11 },
                            ].map((reason) => (
                                <div key={reason.reason} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500 }}>{reason.reason}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {reason.count} trường hợp
                                        </div>
                                    </div>
                                    <div style={{ width: '100px', textAlign: 'right', marginRight: 'var(--spacing-md)' }}>
                                        <span style={{ fontWeight: 600 }}>{reason.percent}%</span>
                                    </div>
                                    <div style={{ width: '60px', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${reason.percent}%`, height: '100%', background: 'var(--error)' }}></div>
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
