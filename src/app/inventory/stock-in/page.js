'use client';

import { useState } from 'react';
import { InventoryIcon } from '@/components/icons';

export default function StockInPage() {
    const [formData, setFormData] = useState({
        referenceNo: '',
        date: new Date().toISOString().split('T')[0],
        warehouse: '',
        supplier: '',
        items: []
    });

    const [showItemForm, setShowItemForm] = useState(false);

    const recentReceipts = [
        { id: 'RCV-001', date: '2025-12-01', supplier: 'ABC Steel Co.', items: 3, status: 'completed', total: '₫125,000,000' },
        { id: 'RCV-002', date: '2025-12-01', supplier: 'XYZ Plastics', items: 5, status: 'pending', total: '₫85,000,000' },
        { id: 'RCV-003', date: '2025-11-30', supplier: 'Tech Supplies Ltd', items: 2, status: 'completed', total: '₫45,000,000' },
        { id: 'RCV-004', date: '2025-11-30', supplier: 'Global Materials', items: 4, status: 'draft', total: '₫95,000,000' },
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
                        Nhập Kho
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Quản lý phiếu nhập kho và tiếp nhận hàng hóa
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowItemForm(true)}>
                    <InventoryIcon size={20} />
                    Tạo phiếu nhập mới
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Hôm nay
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        8
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: 'var(--spacing-xs)' }}>
                        ↑ 25% so với hôm qua
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tuần này
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                        42
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: 'var(--spacing-xs)' }}>
                        ↑ 12% so với tuần trước
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Chờ xử lý
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                        5
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Giá trị nhập
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                        ₫1.2B
                    </div>
                </div>
            </div>

            {/* Recent Receipts Table */}
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title">Phiếu nhập kho gần đây</h3>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm phiếu nhập..."
                            className="input"
                            style={{ width: '300px' }}
                        />
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
                                <th>Ngày nhập</th>
                                <th>Nhà cung cấp</th>
                                <th>Số items</th>
                                <th>Tổng giá trị</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentReceipts.map((receipt) => (
                                <tr key={receipt.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                        {receipt.id}
                                    </td>
                                    <td>{receipt.date}</td>
                                    <td style={{ fontWeight: 500 }}>{receipt.supplier}</td>
                                    <td>{receipt.items}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>
                                        {receipt.total}
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(receipt.status)}`}>
                                            {getStatusText(receipt.status)}
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
                        <h3 className="card-title">Top nhà cung cấp</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {['ABC Steel Co.', 'XYZ Plastics', 'Tech Supplies Ltd', 'Global Materials'].map((supplier, idx) => (
                                <div key={supplier} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{supplier}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {[15, 12, 8, 6][idx]} phiếu nhập
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 600, color: 'var(--success)' }}>
                                        {['₫450M', '₫380M', '₫220M', '₫180M'][idx]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Nhập kho theo danh mục</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {['Nguyên vật liệu', 'Thành phẩm', 'Phụ kiện', 'Công cụ'].map((category, idx) => (
                                <div key={category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{category}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {[25, 18, 12, 8][idx]} items
                                        </div>
                                    </div>
                                    <div style={{ width: '100px', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${[85, 65, 45, 30][idx]}%`, height: '100%', background: 'var(--primary)' }}></div>
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
