'use client';

import { SalesIcon } from '@/components/icons';

export default function SalesPage() {
    const salesOrders = [
        { id: 'SO-001', customer: 'Công ty TNHH ABC', amount: '₫15,500,000', status: 'completed', date: '2025-11-21', items: 12 },
        { id: 'SO-002', customer: 'Công ty CP XYZ', amount: '₫8,750,000', status: 'pending', date: '2025-11-21', items: 8 },
        { id: 'SO-003', customer: 'Doanh nghiệp DEF', amount: '₫22,100,000', status: 'processing', date: '2025-11-20', items: 15 },
        { id: 'SO-004', customer: 'Công ty TNHH GHI', amount: '₫6,250,000', status: 'completed', date: '2025-11-20', items: 5 },
        { id: 'SO-005', customer: 'Tập đoàn JKL', amount: '₫31,450,000', status: 'completed', date: '2025-11-19', items: 24 },
        { id: 'SO-006', customer: 'Công ty MNO', amount: '₫12,800,000', status: 'processing', date: '2025-11-19', items: 10 },
    ];

    const getStatusBadge = (status) => {
        const statusMap = {
            completed: 'badge-success',
            pending: 'badge-warning',
            processing: 'badge-info',
            cancelled: 'badge-error',
        };
        return statusMap[status] || 'badge-info';
    };

    const getStatusText = (status) => {
        const textMap = {
            completed: 'Hoàn thành',
            pending: 'Chờ xử lý',
            processing: 'Đang xử lý',
            cancelled: 'Đã hủy',
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
                        <SalesIcon size={32} />
                        Quản lý Bán hàng
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Quản lý đơn hàng, khách hàng và doanh thu
                    </p>
                </div>
                <button className="btn btn-primary">
                    <SalesIcon size={20} />
                    Tạo đơn hàng mới
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tổng đơn hàng
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {salesOrders.length}
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Doanh thu
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                        ₫96.85M
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Đang xử lý
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--info)' }}>
                        2
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Hoàn thành
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                        3
                    </div>
                </div>
            </div>

            {/* Sales Orders Table */}
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title">Danh sách đơn hàng</h3>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
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
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Số lượng SP</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesOrders.map((order) => (
                                <tr key={order.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                        {order.id}
                                    </td>
                                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                        {order.customer}
                                    </td>
                                    <td>{order.items} sản phẩm</td>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {order.amount}
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>{order.date}</td>
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
        </div>
    );
}
