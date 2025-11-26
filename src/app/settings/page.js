'use client';

import { SettingsIcon } from '@/components/icons';

export default function SettingsPage() {
    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1 style={{ marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <SettingsIcon size={32} />
                    Cài đặt Hệ thống
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Quản lý cấu hình hệ thống và tài khoản
                </p>
            </div>

            <div className="grid grid-cols-2">
                {/* Company Settings */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Thông tin Công ty</h3>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                                Tên công ty
                            </label>
                            <input type="text" className="input" defaultValue="Default Company" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                                Mã công ty (Tenant ID)
                            </label>
                            <input type="text" className="input" defaultValue="1000" disabled />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                                Môi trường (Stage ID)
                            </label>
                            <input type="text" className="input" defaultValue="DEV" disabled />
                        </div>
                        <button className="btn btn-primary">Lưu thay đổi</button>
                    </div>
                </div>

                {/* User Settings */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Thông tin Tài khoản</h3>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                                Họ và tên
                            </label>
                            <input type="text" className="input" defaultValue="Admin User" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                                Email
                            </label>
                            <input type="email" className="input" defaultValue="admin@gmail.com" disabled />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                                Vai trò
                            </label>
                            <input type="text" className="input" defaultValue="Admin" disabled />
                        </div>
                        <button className="btn btn-primary">Cập nhật thông tin</button>
                    </div>
                </div>
            </div>

            {/* System Info */}
            <div className="card" style={{ marginTop: 'var(--spacing-2xl)' }}>
                <div className="card-header">
                    <h3 className="card-title">Thông tin Hệ thống</h3>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-3">
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                                Phiên bản
                            </div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                1.0.0
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                                Database
                            </div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--success)' }}>
                                MongoDB
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                                Trạng thái
                            </div>
                            <div>
                                <span className="badge badge-success">Hoạt động</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
