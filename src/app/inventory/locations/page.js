'use client';

import { useState, useEffect } from 'react';
import { InventoryIcon } from '@/components/icons';
import AddWarehouseLocationModal from '@/components/AddWarehouseLocationModal';

export default function LocationsPage() {
    const [expandedNodes, setExpandedNodes] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const getAuthHeaders = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                const tenId = user.ten_id || user.company?.ten_id || '1000';
                const stgId = user.stg_id || user.company?.stg_id || 'DEV';
                return {
                    'x-tenant-id': tenId,
                    'x-stage-id': stgId,
                    'Content-Type': 'application/json'
                };
            }
        } catch (e) {
            console.error('Error parsing user from localStorage', e);
        }
        return {
            'x-tenant-id': '1000',
            'x-stage-id': 'DEV',
            'Content-Type': 'application/json'
        };
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/warehouses', {
                headers: getAuthHeaders()
            });
            const result = await response.json();

            if (result.success) {
                // Fetch locations for each warehouse
                const warehousesWithLocations = await Promise.all(
                    result.data.map(async (warehouse) => {
                        const locResponse = await fetch(`/api/warehouses/${warehouse.id}/locations`, {
                            headers: getAuthHeaders()
                        });
                        const locResult = await locResponse.json();

                        return {
                            ...warehouse,
                            locations: locResult.success ? locResult.data : []
                        };
                    })
                );
                setWarehouses(warehousesWithLocations);
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleModalSuccess = () => {
        fetchWarehouses(); // Refresh data after creating new warehouse/location
    };

    const toggleNode = (nodeId) => {
        setExpandedNodes(prev =>
            prev.includes(nodeId)
                ? prev.filter(id => id !== nodeId)
                : [...prev, nodeId]
        );
    };

    const getTypeIcon = (type) => {
        const icons = {
            warehouse: '🏢',
            zone: '📦',
            rack: '📋',
        };
        return icons[type] || '📁';
    };

    const getUtilizationColor = (utilization) => {
        if (utilization >= 80) return 'var(--error)';
        if (utilization >= 60) return 'var(--warning)';
        return 'var(--success)';
    };

    const renderTree = (nodes, level = 0) => {
        return nodes.map(node => (
            <div key={node.id} style={{ marginLeft: `${level * 24}px` }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: 'var(--spacing-md)',
                        background: level === 0 ? 'var(--bg-secondary)' : 'transparent',
                        borderRadius: '4px',
                        marginBottom: 'var(--spacing-xs)',
                        cursor: node.children ? 'pointer' : 'default',
                    }}
                    onClick={() => node.children && toggleNode(node.id)}
                >
                    {node.children && (
                        <span style={{ marginRight: 'var(--spacing-sm)', fontSize: '0.75rem' }}>
                            {expandedNodes.includes(node.id) ? '▼' : '▶'}
                        </span>
                    )}
                    <span style={{ marginRight: 'var(--spacing-sm)', fontSize: '1.25rem' }}>
                        {getTypeIcon(node.type)}
                    </span>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{node.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {node.id} • {node.capacity}
                            {node.items && ` • ${node.items} items`}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', marginRight: 'var(--spacing-md)' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: getUtilizationColor(node.utilization) }}>
                            {node.utilization}%
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Sử dụng
                        </div>
                    </div>
                    <div style={{ width: '120px', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${node.utilization}%`,
                            height: '100%',
                            background: getUtilizationColor(node.utilization)
                        }}></div>
                    </div>
                </div>
                {node.children && expandedNodes.includes(node.id) && renderTree(node.children, level + 1)}
            </div>
        ));
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
                        Quản lý Vị trí Kho
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Cấu trúc phân cấp kho hàng và theo dõi công suất
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <InventoryIcon size={20} />
                    Thêm vị trí mới
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tổng kho
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {warehouses.length}
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Kho FG
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {warehouses.filter(w => w.warehouseType === 'FG').length}
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Kho RM
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--info)' }}>
                        {warehouses.filter(w => w.warehouseType === 'RM').length}
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tổng vị trí
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                        {warehouses.reduce((sum, w) => sum + w.locations.length, 0)}
                    </div>
                </div>
            </div>

            {/* Location Tree */}
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="card-title">Cấu trúc kho hàng</h3>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <button className="btn btn-outline" onClick={() => setExpandedNodes([])}>
                            Thu gọn tất cả
                        </button>
                        <button className="btn btn-outline" onClick={() => {
                            const allIds = [];
                            const collectIds = (nodes) => {
                                nodes.forEach(node => {
                                    allIds.push(node.id);
                                    if (node.children && node.children.length > 0) collectIds(node.children);
                                });
                            };
                            collectIds(transformWarehousesToTree(warehouses));
                            setExpandedNodes(allIds);
                        }}>
                            Mở rộng tất cả
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            Đang tải dữ liệu...
                        </div>
                    ) : warehouses.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            Chưa có kho nào. Nhấn "Thêm vị trí mới" để tạo kho đầu tiên.
                        </div>
                    ) : (
                        renderTree(transformWarehousesToTree(warehouses))
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2" style={{ marginTop: 'var(--spacing-2xl)', gap: 'var(--spacing-xl)' }}>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Vị trí sử dụng cao</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {[
                                { name: 'RACK-A1 - Steel', utilization: 90, capacity: '500 m³' },
                                { name: 'ZONE-A - Raw Materials', utilization: 85, capacity: '5,000 m³' },
                                { name: 'RACK-B1 - Electronics', utilization: 70, capacity: '400 m³' },
                            ].map((loc) => (
                                <div key={loc.name} style={{
                                    padding: 'var(--spacing-sm)',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    borderRadius: '4px',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)' }}>
                                        <div style={{ fontWeight: 500 }}>{loc.name}</div>
                                        <div style={{ fontWeight: 600, color: 'var(--error)' }}>{loc.utilization}%</div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {loc.capacity} • Cần mở rộng hoặc sắp xếp lại
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Vị trí còn trống</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {[
                                { name: 'ZONE-C - Quarantine', utilization: 25, capacity: '1,000 m³', available: '750 m³' },
                                { name: 'RACK-A3 - Metals', utilization: 40, capacity: '500 m³', available: '300 m³' },
                                { name: 'RACK-B2 - Widgets', utilization: 55, capacity: '400 m³', available: '180 m³' },
                            ].map((loc) => (
                                <div key={loc.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{loc.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            Còn trống: {loc.available}
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 600, color: 'var(--success)' }}>
                                        {loc.utilization}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Warehouse/Location Modal */}
            <AddWarehouseLocationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={handleModalSuccess}
                warehouses={warehouses}
            />
        </div>
    );
}

// Helper function to transform warehouses to tree structure
function transformWarehousesToTree(warehouses) {
    return warehouses.map(warehouse => {
        // Build location tree from flat locations array
        const locationMap = {};
        const rootLocations = [];

        // First pass: create map of all locations
        warehouse.locations.forEach(loc => {
            locationMap[loc.id] = {
                id: loc.id,
                name: loc.name,
                code: loc.code,
                type: 'location',
                children: []
            };
        });

        // Second pass: build hierarchy
        warehouse.locations.forEach(loc => {
            if (loc.parentLocationId && locationMap[loc.parentLocationId]) {
                locationMap[loc.parentLocationId].children.push(locationMap[loc.id]);
            } else {
                rootLocations.push(locationMap[loc.id]);
            }
        });

        return {
            id: warehouse.id,
            name: `${warehouse.name} (${warehouse.warehouseType})`,
            code: warehouse.code,
            type: 'warehouse',
            warehouseType: warehouse.warehouseType,
            allowNegativeStock: warehouse.allowNegativeStock,
            children: rootLocations
        };
    });
}
