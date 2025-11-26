'use client';

import DashboardCard from '@/components/DashboardCard';
import { SalesIcon, InventoryIcon, FinanceIcon, HRIcon } from '@/components/icons';

export default function Dashboard() {
  // Sample data - in real app, this would come from API
  const metrics = [
    {
      title: 'Total Revenue',
      value: '₫2,450,000',
      change: '+12.5%',
      trend: 'up',
      icon: SalesIcon,
      color: 'var(--success)',
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: '+8.2%',
      trend: 'up',
      icon: SalesIcon,
      color: 'var(--primary)',
    },
    {
      title: 'Inventory Value',
      value: '₫850,000',
      change: '-3.1%',
      trend: 'down',
      icon: InventoryIcon,
      color: 'var(--warning)',
    },
    {
      title: 'Active Employees',
      value: '156',
      change: '+2.4%',
      trend: 'up',
      icon: HRIcon,
      color: 'var(--info)',
    },
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'Nguyễn Văn A', amount: '₫1,250,000', status: 'completed', date: '2025-11-21' },
    { id: 'ORD-002', customer: 'Trần Thị B', amount: '₫850,000', status: 'pending', date: '2025-11-21' },
    { id: 'ORD-003', customer: 'Lê Văn C', amount: '₫2,100,000', status: 'processing', date: '2025-11-20' },
    { id: 'ORD-004', customer: 'Phạm Thị D', amount: '₫650,000', status: 'completed', date: '2025-11-20' },
    { id: 'ORD-005', customer: 'Hoàng Văn E', amount: '₫1,450,000', status: 'completed', date: '2025-11-19' },
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
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1 style={{ marginBottom: 'var(--spacing-sm)' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Tổng quan về hoạt động kinh doanh của bạn
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-2xl)' }}>
        {metrics.map((metric, index) => (
          <DashboardCard key={index} {...metric} />
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Đơn hàng gần đây</h3>
        </div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {order.id}
                  </td>
                  <td>{order.customer}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {order.amount}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: 'var(--spacing-2xl)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Thao tác nhanh</h3>
        <div className="grid grid-cols-4">
          <button className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
            <SalesIcon size={20} />
            Tạo đơn hàng mới
          </button>
          <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
            <InventoryIcon size={20} />
            Nhập kho
          </button>
          <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
            <FinanceIcon size={20} />
            Tạo hóa đơn
          </button>
          <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
            <HRIcon size={20} />
            Thêm nhân viên
          </button>
        </div>
      </div>
    </div>
  );
}
