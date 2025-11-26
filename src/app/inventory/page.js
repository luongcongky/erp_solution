'use client';

import { InventoryIcon } from '@/components/icons';

export default function InventoryPage() {
    const products = [
        { id: 'PRD-001', name: 'Laptop Dell XPS 15', sku: 'DELL-XPS-15', stock: 45, price: '₫25,000,000', category: 'Electronics', status: 'in-stock' },
        { id: 'PRD-002', name: 'iPhone 15 Pro Max', sku: 'IP-15-PM', stock: 12, price: '₫32,000,000', category: 'Electronics', status: 'low-stock' },
        { id: 'PRD-003', name: 'Samsung Galaxy S24', sku: 'SAM-S24', stock: 0, price: '₫22,000,000', category: 'Electronics', status: 'out-of-stock' },
        { id: 'PRD-004', name: 'MacBook Pro M3', sku: 'MBP-M3', stock: 28, price: '₫45,000,000', category: 'Electronics', status: 'in-stock' },
        { id: 'PRD-005', name: 'iPad Air', sku: 'IPAD-AIR', stock: 8, price: '₫18,000,000', category: 'Electronics', status: 'low-stock' },
        { id: 'PRD-006', name: 'AirPods Pro', sku: 'APP-PRO', stock: 67, price: '₫6,500,000', category: 'Accessories', status: 'in-stock' },
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
                        Quản lý Kho hàng
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Quản lý sản phẩm, tồn kho và nhập xuất hàng
                    </p>
                </div>
                <button className="btn btn-primary">
                    <InventoryIcon size={20} />
                    Thêm sản phẩm mới
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tổng sản phẩm
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {products.length}
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Giá trị kho
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                        ₫3.2B
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Sắp hết hàng
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                        2
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Hết hàng
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error)' }}>
                        1
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title">Danh sách sản phẩm</h3>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            className="input"
                            style={{ width: '300px' }}
                        />
                        <button className="btn btn-outline">Lọc</button>
                    </div>
                </div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Mã SP</th>
                                <th>Tên sản phẩm</th>
                                <th>SKU</th>
                                <th>Danh mục</th>
                                <th>Tồn kho</th>
                                <th>Giá bán</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                        {product.id}
                                    </td>
                                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                        {product.name}
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                        {product.sku}
                                    </td>
                                    <td>{product.category}</td>
                                    <td style={{ fontWeight: 600 }}>
                                        {product.stock}
                                    </td>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {product.price}
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(product.status)}`}>
                                            {getStatusText(product.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-outline" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                                            Sửa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
