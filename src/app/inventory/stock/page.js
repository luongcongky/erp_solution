'use client';

import { useState } from 'react';
import { InventoryIcon } from '@/components/icons';

export default function StockBalancePage() {
    const [viewMode, setViewMode] = useState('location'); // location, batch, serial

    const stockByLocation = [
        { item: 'Stainless Steel Sheet 304', sku: 'RM-STEEL-001', location: 'WH-MAIN/ZONE-A/RACK-A1', batch: 'LOT-20231201', qty: 5000, uom: 'kg', status: 'in-stock', minStock: 1000 },
        { item: 'Polypropylene Granules', sku: 'RM-PLASTIC-001', location: 'WH-MAIN/ZONE-A/RACK-A2', batch: 'LOT-20231205', qty: 450, uom: 'kg', status: 'low-stock', minStock: 500 },
        { item: 'Super Widget X', sku: 'FG-WIDGET-X', location: 'WH-MAIN/ZONE-B/RACK-B1', batch: 'SN-001-050', qty: 35, uom: 'pcs', status: 'low-stock', minStock: 50 },
        { item: 'Aluminum Rods', sku: 'RM-ALU-001', location: 'WH-MAIN/ZONE-A/RACK-A3', batch: 'LOT-20231210', qty: 0, uom: 'kg', status: 'out-of-stock', minStock: 800 },
        { item: 'Copper Wire', sku: 'RM-COPPER-001', location: 'WH-MAIN/ZONE-A/RACK-A1', batch: 'LOT-20231208', qty: 2500, uom: 'kg', status: 'in-stock', minStock: 600 },
    ];

    const getStatusBadge = (status) => {
        const statusMap = {
            'in-stock': 'badge-success',
            'low-stock': 'badge-warning',
            'out-of-stock': 'badge-error',
        };
        return statusMap[status] || 'badge-info';
    };

    const getStatusText = (status) => {
        const textMap = {
            'in-stock': 'Còn hàng',
            'low-stock': 'Sắp hết',
            'out-of-stock': 'Hết hàng',
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
                        Tồn Kho
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Theo dõi tồn kho theo vị trí, batch và serial number
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                    <button className="btn btn-outline">
                        Xuất báo cáo
                    </button>
                    <button className="btn btn-primary">
                        <InventoryIcon size={20} />
                        Kiểm kê
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tổng items
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        248
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                        Trong 3 kho
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Giá trị tồn kho
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                        ₫3.2B
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: 'var(--spacing-xs)' }}>
                        ↑ 5% so với tháng trước
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Sắp hết hàng
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                        12
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: 'var(--spacing-xs)' }}>
                        Cần đặt hàng
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Hết hàng
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error)' }}>
                        5
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: 'var(--spacing-xs)' }}>
                        Cần xử lý ngay
                    </div>
                </div>
            </div>

            {/* View Mode Tabs */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', borderBottom: '2px solid var(--border-color)' }}>
                    {[
                        { id: 'location', label: 'Theo vị trí' },
                        { id: 'batch', label: 'Theo Batch/Lot' },
                        { id: 'serial', label: 'Theo Serial' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setViewMode(tab.id)}
                            style={{
                                padding: 'var(--spacing-md) var(--spacing-lg)',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: viewMode === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                                color: viewMode === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: viewMode === tab.id ? 600 : 400,
                                cursor: 'pointer',
                                marginBottom: '-2px',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stock Table */}
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title">Tồn kho chi tiết</h3>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            className="input"
                            style={{ width: '300px' }}
                        />
                        <select className="input" style={{ width: '150px' }}>
                            <option value="">Tất cả kho</option>
                            <option value="WH-MAIN">Kho chính</option>
                            <option value="WH-02">Kho phụ</option>
                        </select>
                        <select className="input" style={{ width: '150px' }}>
                            <option value="">Tất cả trạng thái</option>
                            <option value="in-stock">Còn hàng</option>
                            <option value="low-stock">Sắp hết</option>
                            <option value="out-of-stock">Hết hàng</option>
                        </select>
                    </div>
                </div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Tên sản phẩm</th>
                                <th>Vị trí</th>
                                <th>Batch/Lot</th>
                                <th>Số lượng</th>
                                <th>Tồn tối thiểu</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockByLocation.map((stock, idx) => (
                                <tr key={idx}>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                                        {stock.sku}
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{stock.item}</td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {stock.location}
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                        {stock.batch}
                                    </td>
                                    <td style={{ fontWeight: 600 }}>
                                        {stock.qty} {stock.uom}
                                    </td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {stock.minStock} {stock.uom}
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(stock.status)}`}>
                                            {getStatusText(stock.status)}
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

            {/* Bottom Stats */}
            <div className="grid grid-cols-2" style={{ marginTop: 'var(--spacing-2xl)', gap: 'var(--spacing-xl)' }}>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Tồn kho theo danh mục</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {[
                                { category: 'Nguyên vật liệu', items: 125, value: '₫1.8B', percent: 85 },
                                { category: 'Thành phẩm', items: 68, value: '₫980M', percent: 65 },
                                { category: 'Bán thành phẩm', items: 42, value: '₫320M', percent: 45 },
                                { category: 'Phụ kiện', items: 13, value: '₫100M', percent: 25 },
                            ].map((cat) => (
                                <div key={cat.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500 }}>{cat.category}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {cat.items} items
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', marginRight: 'var(--spacing-md)' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--success)' }}>
                                            {cat.value}
                                        </div>
                                    </div>
                                    <div style={{ width: '80px', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${cat.percent}%`, height: '100%', background: 'var(--primary)' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Cảnh báo tồn kho</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {[
                                { item: 'Aluminum Rods', status: 'Hết hàng', severity: 'error', action: 'Đặt hàng ngay' },
                                { item: 'Polypropylene Granules', status: 'Sắp hết', severity: 'warning', action: 'Cần đặt hàng' },
                                { item: 'Super Widget X', status: 'Sắp hết', severity: 'warning', action: 'Cần đặt hàng' },
                                { item: 'Copper Wire', status: 'Bình thường', severity: 'success', action: 'Theo dõi' },
                            ].map((alert) => (
                                <div key={alert.item} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'var(--spacing-sm)',
                                    background: alert.severity === 'error' ? 'rgba(239, 68, 68, 0.1)' : alert.severity === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                                    borderRadius: '4px',
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{alert.item}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {alert.status}
                                        </div>
                                    </div>
                                    <button
                                        className={`btn ${alert.severity === 'error' ? 'btn-error' : alert.severity === 'warning' ? 'btn-warning' : 'btn-outline'}`}
                                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                                    >
                                        {alert.action}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
