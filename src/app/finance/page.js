'use client';

import { FinanceIcon } from '@/components/icons';

export default function FinancePage() {
    const transactions = [
        { id: 'TXN-001', type: 'income', description: 'Thanh toán đơn hàng SO-001', amount: '₫15,500,000', date: '2025-11-21', category: 'Sales' },
        { id: 'TXN-002', type: 'expense', description: 'Nhập hàng từ nhà cung cấp', amount: '₫8,750,000', date: '2025-11-21', category: 'Procurement' },
        { id: 'TXN-003', type: 'income', description: 'Thanh toán đơn hàng SO-003', amount: '₫22,100,000', date: '2025-11-20', category: 'Sales' },
        { id: 'TXN-004', type: 'expense', description: 'Chi phí vận chuyển', amount: '₫1,250,000', date: '2025-11-20', category: 'Logistics' },
        { id: 'TXN-005', type: 'income', description: 'Thanh toán đơn hàng SO-005', amount: '₫31,450,000', date: '2025-11-19', category: 'Sales' },
        { id: 'TXN-006', type: 'expense', description: 'Lương nhân viên tháng 11', amount: '₫45,000,000', date: '2025-11-15', category: 'Payroll' },
    ];

    const getTypeBadge = (type) => {
        return type === 'income' ? 'badge-success' : 'badge-error';
    };

    const getTypeText = (type) => {
        return type === 'income' ? 'Thu' : 'Chi';
    };

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseInt(t.amount.replace(/[₫,]/g, '')), 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseInt(t.amount.replace(/[₫,]/g, '')), 0);

    const netProfit = totalIncome - totalExpense;

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
                        <FinanceIcon size={32} />
                        Quản lý Tài chính
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Quản lý thu chi, báo cáo tài chính và kế toán
                    </p>
                </div>
                <button className="btn btn-primary">
                    <FinanceIcon size={20} />
                    Tạo giao dịch mới
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tổng thu
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                        ₫{(totalIncome / 1000000).toFixed(1)}M
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tổng chi
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error)' }}>
                        ₫{(totalExpense / 1000000).toFixed(1)}M
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Lợi nhuận ròng
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: netProfit > 0 ? 'var(--success)' : 'var(--error)' }}>
                        ₫{(netProfit / 1000000).toFixed(1)}M
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Giao dịch
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {transactions.length}
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title">Lịch sử giao dịch</h3>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm giao dịch..."
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
                                <th>Mã GD</th>
                                <th>Loại</th>
                                <th>Mô tả</th>
                                <th>Danh mục</th>
                                <th>Số tiền</th>
                                <th>Ngày</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((txn) => (
                                <tr key={txn.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                        {txn.id}
                                    </td>
                                    <td>
                                        <span className={`badge ${getTypeBadge(txn.type)}`}>
                                            {getTypeText(txn.type)}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-primary)' }}>
                                        {txn.description}
                                    </td>
                                    <td>{txn.category}</td>
                                    <td style={{
                                        fontWeight: 600,
                                        color: txn.type === 'income' ? 'var(--success)' : 'var(--error)'
                                    }}>
                                        {txn.type === 'income' ? '+' : '-'}{txn.amount}
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>{txn.date}</td>
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
