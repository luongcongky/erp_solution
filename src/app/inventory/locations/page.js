'use client';

import { useState } from 'react';
import { InventoryIcon } from '@/components/icons';

export default function LocationsPage() {
    const [expandedNodes, setExpandedNodes] = useState(['WH-MAIN', 'ZONE-A', 'ZONE-B']);

    const locationTree = [
        {
            id: 'WH-MAIN',
            name: 'Main Central Warehouse',
            type: 'warehouse',
            capacity: '10,000 m³',
            utilization: 75,
            children: [
                {
                    id: 'ZONE-A',
                    name: 'Raw Materials Zone',
                    type: 'zone',
                    capacity: '5,000 m³',
                    utilization: 85,
                    children: [
                        { id: 'RACK-A1', name: 'Rack A1 - Steel', type: 'rack', capacity: '500 m³', utilization: 90, items: 45 },
                        { id: 'RACK-A2', name: 'Rack A2 - Plastics', type: 'rack', capacity: '500 m³', utilization: 65, items: 32 },
                        { id: 'RACK-A3', name: 'Rack A3 - Metals', type: 'rack', capacity: '500 m³', utilization: 40, items: 28 },
                    ]
                },
                {
                    id: 'ZONE-B',
                    name: 'Finished Goods Zone',
                    type: 'zone',
                    capacity: '3,000 m³',
                    utilization: 60,
                    children: [
                        { id: 'RACK-B1', name: 'Rack B1 - Electronics', type: 'rack', capacity: '400 m³', utilization: 70, items: 58 },
                        { id: 'RACK-B2', name: 'Rack B2 - Widgets', type: 'rack', capacity: '400 m³', utilization: 55, items: 42 },
                    ]
                },
                {
                    id: 'ZONE-C',
                    name: 'Quarantine Zone',
                    type: 'zone',
                    capacity: '1,000 m³',
                    utilization: 25,
                    children: [
                        { id: 'RACK-C1', name: 'Rack C1 - QC Hold', type: 'rack', capacity: '200 m³', utilization: 30, items: 12 },
                    ]
                }
            ]
        }
    ];

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
                <button className="btn btn-primary">
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
                        3
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tổng zones
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                        8
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Tổng racks
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--info)' }}>
                        42
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-sm)' }}>
                        Công suất TB
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>
                        68%
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
                                    if (node.children) collectIds(node.children);
                                });
                            };
                            collectIds(locationTree);
                            setExpandedNodes(allIds);
                        }}>
                            Mở rộng tất cả
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    {renderTree(locationTree)}
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
        </div>
    );
}
