'use client';

import { HRIcon } from '@/components/icons';

export default function HRPage() {
    const employees = [
        { id: 'EMP-001', name: 'Nguyễn Văn An', position: 'Giám đốc', department: 'Điều hành', salary: '₫50,000,000', status: 'active', joinDate: '2020-01-15' },
        { id: 'EMP-002', name: 'Trần Thị Bình', position: 'Trưởng phòng Kinh doanh', department: 'Kinh doanh', salary: '₫35,000,000', status: 'active', joinDate: '2020-03-20' },
        { id: 'EMP-003', name: 'Lê Văn Cường', position: 'Kế toán trưởng', department: 'Tài chính', salary: '₫30,000,000', status: 'active', joinDate: '2021-05-10' },
        { id: 'EMP-004', name: 'Phạm Thị Dung', position: 'Nhân viên Kinh doanh', department: 'Kinh doanh', salary: '₫18,000,000', status: 'active', joinDate: '2022-07-01' },
        { id: 'EMP-005', name: 'Hoàng Văn Em', position: 'Nhân viên Kho', department: 'Kho vận', salary: '₫12,000,000', status: 'active', joinDate: '2023-02-15' },
        { id: 'EMP-006', name: 'Võ Thị Phương', position: 'Nhân viên Hành chính', department: 'Hành chính', salary: '₫15,000,000', status: 'on-leave', joinDate: '2023-06-20' },
    ];

    const getStatusBadge = (status) => {
        const statusMap = {
            active: 'badge-success',
            'on-leave': 'badge-warning',
            inactive: 'badge-error',
        };
        return statusMap[status] || 'badge-info';
    };

    const getStatusText = (status) => {
        const textMap = {
            active: 'Đang làm việc',
            'on-leave': 'Nghỉ phép',
            inactive: 'Đã nghỉ việc',
        };
        return textMap[status] || status;
    };

    const totalSalary = employees
        .filter(e => e.status === 'active')
        .reduce((sum, e) => sum + parseInt(e.salary.replace(/[₫,]/g, '')), 0);

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
                        <HRIcon size={32} />
                        Quản lý Nhân sự
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Quản lý nhân viên, chấm công và lương thưởng
                    </p>
                </div>
                <button className="btn btn-primary">
                    <HRIcon size={20} />
                    Thêm nhân viên mới
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tổng nhân viên
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {employees.length}
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Đang làm việc
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                        {employees.filter(e => e.status === 'active').length}
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Nghỉ phép
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                        {employees.filter(e => e.status === 'on-leave').length}
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tổng lương
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                        ₫{(totalSalary / 1000000).toFixed(0)}M
                    </div>
                </div>
            </div>

            {/* Employees Table */}
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title">Danh sách nhân viên</h3>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm nhân viên..."
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
                                <th>Mã NV</th>
                                <th>Họ và tên</th>
                                <th>Chức vụ</th>
                                <th>Phòng ban</th>
                                <th>Lương</th>
                                <th>Trạng thái</th>
                                <th>Ngày vào</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                        {emp.id}
                                    </td>
                                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                        {emp.name}
                                    </td>
                                    <td>{emp.position}</td>
                                    <td>{emp.department}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {emp.salary}
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(emp.status)}`}>
                                            {getStatusText(emp.status)}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>{emp.joinDate}</td>
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
