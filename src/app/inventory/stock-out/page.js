'use client';

import { useState } from 'react';
import { InventoryIcon } from '@/components/icons';

export default function StockOutPage() {
    const recentIssues = [
        { id: 'ISS-001', date: '2025-12-02', customer: 'Production Dept', items: 4, status: 'completed', total: '₫85,000,000', type: 'production' },
        { id: 'ISS-002', date: '2025-12-02', customer: 'Customer A', items: 2, status: 'pending', total: '₫125,000,000', type: 'sales' },
        { id: 'ISS-003', date: '2025-12-01', customer: 'Warehouse B', items: 3, status: 'completed', total: '₫65,000,000', type: 'transfer' },
        { id: 'ISS-004', date: '2025-12-01', customer: 'Customer B', items: 5, status: 'draft', total: '₫95,000,000', type: 'sales' },
    ];

    const getStatusBadge = (status) => {
        const statusMap = {
            'completed': 'badge-success',
            'pending': 'badge-warning',
            'draft': 'badge-info',
        };
        return statusMap[status] || 'badge-info';
    };

    const getStatusText = (status) => {
        const textMap = {
            'completed': 'Hoàn thành',
            'pending': 'Chờ xử lý',
            'draft': 'Nháp',
        };
        return textMap[status] || status;
    };

    const getTypeText = (type) => {
        const typeMap = {
            'production': 'Sản xuất',
            'sales': 'Bán hàng',
            'transfer': 'Chuyển kho',
        };
        return typeMap[type] || type;
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
                        Xuất Kho
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Quản lý phiếu xuất kho và giao hàng
                    </p>
                </div>
                <button className="btn btn-primary">
                    <InventoryIcon size={20} />
                    Tạo phiếu xuất mới
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Hôm nay
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        12
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: 'var(--spacing-xs)' }}>
                        ↓ 8% so với hôm qua
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tuần này
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                        58
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: 'var(--spacing-xs)' }}>
                        ↑ 15% so với tuần trước
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Chờ xử lý
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                        7
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Giá trị xuất
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error)' }}>
                        ₫980M
                    </div>
                </div>
            </div>

            {/* Recent Issues Table */}
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title">Phiếu xuất kho gần đây</h3>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm phiếu xuất..."
                            className="input"
                            style={{ width: '300px' }}
                        />
                        <select className="input" style={{ width: '150px' }}>
                            <option value="">Tất cả loại</option>
                            <option value="production">Sản xuất</option>
                            <option value="sales">Bán hàng</option>
                            <option value="transfer">Chuyển kho</option>
                        </select>
                        <select className="input" style={{ width: '150px' }}>
                            <option value="">Tất cả trạng thái</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="draft">Nháp</option>
                        </select>
                    </div>
                </div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Mã phiếu</th>
                                <th>Ngày xuất</th>
                                <th>Loại xuất</th>
                                <th>Đích đến</th>
                                <th>Số items</th>
                                <th>Tổng giá trị</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentIssues.map((issue) => (
                                <tr key={issue.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                        {issue.id}
                                    </td>
                                    <td>{issue.date}</td>
                                    <td>
                                        <span className="badge badge-info">
                                            {getTypeText(issue.type)}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{issue.customer}</td>
                                    <td>{issue.items}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--error)' }}>
                                        {issue.total}
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(issue.status)}`}>
                                            {getStatusText(issue.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                            <button className="btn btn-outline" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                                                Xem
                                            </button>
                                            <button className="btn btn-outline" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                                                In
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2" style={{ marginTop: 'var(--spacing-2xl)', gap: 'var(--spacing-xl)' }}>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Xuất kho theo loại</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {[
                                { type: 'Sản xuất', count: 28, value: '₫520M', percent: 75 },
                                { type: 'Bán hàng', count: 18, value: '₫380M', percent: 55 },
                                { type: 'Chuyển kho', count: 12, value: '₫80M', percent: 35 },
                            ].map((item) => (
                                <div key={item.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500 }}>{item.type}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {item.count} phiếu xuất
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', marginRight: 'var(--spacing-md)' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--error)' }}>
                                            {item.value}
                                        </div>
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
                        <h3 className="card-title">Sản phẩm xuất nhiều nhất</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {[
                                { name: 'Stainless Steel Sheet', qty: '2,500 kg', value: '₫250M' },
                                { name: 'Polypropylene Granules', qty: '1,800 kg', value: '₫180M' },
                                { name: 'Super Widget X', qty: '450 pcs', value: '₫135M' },
                                { name: 'Aluminum Rods', qty: '1,200 kg', value: '₫96M' },
                            ].map((product) => (
                                <div key={product.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{product.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {product.qty}
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 600, color: 'var(--error)' }}>
                                        {product.value}
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
