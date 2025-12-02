'use client';

import PageTemplate from '@/components/PageTemplate';
import { useTranslations } from '@/hooks/useTranslations';
import { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';

export default function InventoryDashboard() {
    const { t } = useTranslations();

    // Mock Data for KPI Cards
    const kpiData = [
        { title: 'Total Inventory Value', value: '$1,250,000', change: '+5.2%', isPositive: true, icon: '💰' },
        { title: 'Low Stock Items', value: '12', change: '+2', isPositive: false, icon: '⚠️', alert: true },
        { title: 'Pending Receipts', value: '5', change: '-1', isPositive: true, icon: '📥' },
        { title: 'Pending Deliveries', value: '8', change: '+3', isPositive: false, icon: '📤' },
    ];

    // Mock Data for Charts
    const stockMovementData = [
        { name: 'Mon', receipts: 4000, deliveries: 2400 },
        { name: 'Tue', receipts: 3000, deliveries: 1398 },
        { name: 'Wed', receipts: 2000, deliveries: 9800 },
        { name: 'Thu', receipts: 2780, deliveries: 3908 },
        { name: 'Fri', receipts: 1890, deliveries: 4800 },
        { name: 'Sat', receipts: 2390, deliveries: 3800 },
        { name: 'Sun', receipts: 3490, deliveries: 4300 },
    ];

    return (
        <PageTemplate
            breadcrumbs={[
                { label: t('modules.inventory', 'Inventory') },
                { label: t('pages.dashboard.title', 'Dashboard') },
            ]}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>

                {/* KPI Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 'var(--spacing-lg)'
                }}>
                    {kpiData.map((kpi, index) => (
                        <div key={index} className="card" style={{
                            padding: 'var(--spacing-lg)',
                            borderLeft: kpi.alert ? '4px solid var(--error)' : '4px solid var(--primary)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--spacing-sm)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{kpi.title}</span>
                                <span style={{ fontSize: '1.5rem' }}>{kpi.icon}</span>
                            </div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                {kpi.value}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: kpi.isPositive ? 'var(--success)' : 'var(--error)' }}>
                                {kpi.change} <span style={{ color: 'var(--text-muted)' }}>vs last week</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 'var(--spacing-lg)' }}>

                    {/* Stock Movement Chart */}
                    <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                        <h3 style={{ marginBottom: 'var(--spacing-lg)', fontSize: '1.125rem', fontWeight: '600' }}>
                            Weekly Stock Movements
                        </h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stockMovementData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                    <XAxis dataKey="name" stroke="var(--text-secondary)" />
                                    <YAxis stroke="var(--text-secondary)" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="receipts" fill="var(--success)" name="Receipts" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="deliveries" fill="var(--primary)" name="Deliveries" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Moving Items (Placeholder for now) */}
                    <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                        <h3 style={{ marginBottom: 'var(--spacing-lg)', fontSize: '1.125rem', fontWeight: '600' }}>
                            Top Moving Items
                        </h3>
                        <table className="dataTable" style={{ width: '100%' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                    <th style={{ padding: '10px', color: 'var(--text-secondary)' }}>Item</th>
                                    <th style={{ padding: '10px', color: 'var(--text-secondary)' }}>Stock</th>
                                    <th style={{ padding: '10px', color: 'var(--text-secondary)' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { name: 'Laptop Dell XPS 15', stock: 45, status: 'High' },
                                    { name: 'Wireless Mouse', stock: 120, status: 'Normal' },
                                    { name: 'HDMI Cable 2m', stock: 8, status: 'Low' },
                                    { name: 'Monitor 27"', stock: 32, status: 'Normal' },
                                    { name: 'USB-C Hub', stock: 15, status: 'Low' },
                                ].map((item, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px 10px' }}>{item.name}</td>
                                        <td style={{ padding: '12px 10px' }}>{item.stock}</td>
                                        <td style={{ padding: '12px 10px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                background: item.status === 'Low' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                                color: item.status === 'Low' ? 'var(--error)' : 'var(--success)'
                                            }}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </PageTemplate>
    );
}
