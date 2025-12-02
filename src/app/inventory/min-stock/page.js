'use client';

import { useState } from 'react';
import { InventoryIcon } from '@/components/icons';

export default function MinStockPage() {
    const [activeTab, setActiveTab] = useState('rules'); // rules or alerts

    const minStockRules = [
        { id: 1, item: 'Stainless Steel Sheet 304', sku: 'RM-STEEL-001', minStock: 1000, maxStock: 8000, reorderPoint: 1500, reorderQty: 5000, uom: 'kg', currentStock: 5000, status: 'ok' },
        { id: 2, item: 'Polypropylene Granules', sku: 'RM-PLASTIC-001', minStock: 500, maxStock: 3000, reorderPoint: 700, reorderQty: 2000, uom: 'kg', currentStock: 450, status: 'below-min' },
        { id: 3, item: 'Super Widget X', sku: 'FG-WIDGET-X', minStock: 50, maxStock: 500, reorderPoint: 80, reorderQty: 200, uom: 'pcs', currentStock: 35, status: 'below-min' },
        { id: 4, item: 'Aluminum Rods', sku: 'RM-ALU-001', minStock: 800, maxStock: 5000, reorderPoint: 1000, reorderQty: 3000, uom: 'kg', currentStock: 0, status: 'out-of-stock' },
        { id: 5, item: 'Copper Wire', sku: 'RM-COPPER-001', minStock: 600, maxStock: 4000, reorderPoint: 900, reorderQty: 2500, uom: 'kg', currentStock: 2500, status: 'ok' },
    ];

    const alerts = [
        { id: 1, item: 'Aluminum Rods', sku: 'RM-ALU-001', currentStock: 0, minStock: 800, shortage: 800, severity: 'critical', daysOut: 0, suggestedAction: 'Đặt hàng khẩn cấp' },
        { id: 2, item: 'Polypropylene Granules', sku: 'RM-PLASTIC-001', currentStock: 450, minStock: 500, shortage: 50, severity: 'warning', daysOut: 5, suggestedAction: 'Đặt hàng trong tuần' },
        { id: 3, item: 'Super Widget X', sku: 'FG-WIDGET-X', currentStock: 35, minStock: 50, shortage: 15, severity: 'warning', daysOut: 3, suggestedAction: 'Sản xuất thêm' },
        { id: 4, item: 'Steel Bolts M8', sku: 'HW-BOLT-M8', currentStock: 120, minStock: 200, shortage: 80, severity: 'info', daysOut: 8, suggestedAction: 'Theo dõi' },
    ];

    const getStatusBadge = (status) => {
        const statusMap = {
            'ok': 'badge-success',
            'below-min': 'badge-warning',
            'out-of-stock': 'badge-error',
        };
        return statusMap[status] || 'badge-info';
    };

    const getStatusText = (status) => {
        const textMap = {
            'ok': 'Bình thường',
            'below-min': 'Dưới mức tối thiểu',
            'out-of-stock': 'Hết hàng',
        };
        return textMap[status] || status;
    };

    const getSeverityBadge = (severity) => {
        const severityMap = {
            'critical': 'badge-error',
            'warning': 'badge-warning',
            'info': 'badge-info',
        };
        return severityMap[severity] || 'badge-info';
    };

    const getSeverityText = (severity) => {
        const textMap = {
            'critical': 'Nghiêm trọng',
            'warning': 'Cảnh báo',
            'info': 'Thông tin',
        };
        return textMap[severity] || severity;
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
                        Quản lý Tồn Kho Tối Thiểu
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Cấu hình mức tồn kho tối thiểu và cảnh báo tự động
                    </p>
                </div>
                <button className="btn btn-primary">
                    <InventoryIcon size={20} />
                    Cấu hình quy tắc mới
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tổng quy tắc
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        248
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Cảnh báo nghiêm trọng
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--error)' }}>
                        5
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: 'var(--spacing-xs)' }}>
                        Cần xử lý ngay
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Cảnh báo thường
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                        12
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Giá trị cần đặt hàng
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                        ₫450M
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', borderBottom: '2px solid var(--border-color)' }}>
                    {[
                        { id: 'rules', label: 'Quy tắc tồn kho' },
                        { id: 'alerts', label: 'Cảnh báo' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: 'var(--spacing-md) var(--spacing-lg)',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: activeTab === tab.id ? 600 : 400,
                                cursor: 'pointer',
                                marginBottom: '-2px',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Min Stock Rules Table */}
            {activeTab === 'rules' && (
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="card-title">Quy tắc tồn kho tối thiểu</h3>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="input"
                                style={{ width: '300px' }}
                            />
                            <select className="input" style={{ width: '150px' }}>
                                <option value="">Tất cả trạng thái</option>
                                <option value="ok">Bình thường</option>
                                <option value="below-min">Dưới mức</option>
                                <option value="out-of-stock">Hết hàng</option>
                            </select>
                        </div>
                    </div>
                    <div className="card-body">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Sản phẩm</th>
                                    <th>Tồn hiện tại</th>
                                    <th>Tồn tối thiểu</th>
                                    <th>Tồn tối đa</th>
                                    <th>Reorder Point</th>
                                    <th>Reorder Qty</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {minStockRules.map((rule) => (
                                    <tr key={rule.id}>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                                            {rule.sku}
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{rule.item}</td>
                                        <td style={{ fontWeight: 600 }}>
                                            {rule.currentStock} {rule.uom}
                                        </td>
                                        <td>{rule.minStock} {rule.uom}</td>
                                        <td>{rule.maxStock} {rule.uom}</td>
                                        <td>{rule.reorderPoint} {rule.uom}</td>
                                        <td>{rule.reorderQty} {rule.uom}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(rule.status)}`}>
                                                {getStatusText(rule.status)}
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
            )}

            {/* Alerts Table */}
            {activeTab === 'alerts' && (
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="card-title">Cảnh báo tồn kho</h3>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                            <select className="input" style={{ width: '150px' }}>
                                <option value="">Tất cả mức độ</option>
                                <option value="critical">Nghiêm trọng</option>
                                <option value="warning">Cảnh báo</option>
                                <option value="info">Thông tin</option>
                            </select>
                            <button className="btn btn-primary">
                                Tạo Purchase Request
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Sản phẩm</th>
                                    <th>Tồn hiện tại</th>
                                    <th>Tồn tối thiểu</th>
                                    <th>Thiếu hụt</th>
                                    <th>Dự kiến hết trong</th>
                                    <th>Mức độ</th>
                                    <th>Hành động đề xuất</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alerts.map((alert) => (
                                    <tr key={alert.id} style={{
                                        background: alert.severity === 'critical' ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                                    }}>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                                            {alert.sku}
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{alert.item}</td>
                                        <td style={{ fontWeight: 600, color: alert.currentStock === 0 ? 'var(--error)' : 'var(--text-primary)' }}>
                                            {alert.currentStock}
                                        </td>
                                        <td>{alert.minStock}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--error)' }}>
                                            -{alert.shortage}
                                        </td>
                                        <td>
                                            {alert.daysOut === 0 ? (
                                                <span style={{ color: 'var(--error)', fontWeight: 600 }}>Đã hết</span>
                                            ) : (
                                                <span>{alert.daysOut} ngày</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${getSeverityBadge(alert.severity)}`}>
                                                {getSeverityText(alert.severity)}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.85rem' }}>{alert.suggestedAction}</td>
                                        <td>
                                            <button className="btn btn-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                                                Đặt hàng
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
