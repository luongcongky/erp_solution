'use client';

import { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import {
    TrendingUpIcon,
    TrendingDownIcon,
    SalesIcon,
    InventoryIcon,
    UserIcon,
    BellIcon
} from '@/components/icons';
import { useTranslations } from '@/hooks/useTranslations';
import '../../styles/design-system.css';

// Mock Data for Charts
const revenueData = [
    { name: 'Jan', value: 40000000 },
    { name: 'Feb', value: 30000000 },
    { name: 'Mar', value: 20000000 },
    { name: 'Apr', value: 27800000 },
    { name: 'May', value: 18900000 },
    { name: 'Jun', value: 23900000 },
    { name: 'Jul', value: 34900000 },
];

const categoryData = [
    { name: 'Electronics', value: 400 },
    { name: 'Clothing', value: 300 },
    { name: 'Home', value: 300 },
    { name: 'Books', value: 200 },
];

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
    const { t } = useTranslations();
    const [stats, setStats] = useState({
        totalSales: 0,
        activeUsers: 0,
        newOrders: 0,
        pendingIssues: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API fetch
        setTimeout(() => {
            setStats({
                totalSales: 450000000,
                activeUsers: 1234,
                newOrders: 45,
                pendingIssues: 12
            });
            setLoading(false);
        }, 1000);
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100vh - var(--header-height))'
            }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ padding: 'var(--spacing-xl)', maxWidth: '1600px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-xl)'
            }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {t('dashboard.title', 'Dashboard')}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {t('dashboard.welcome', 'Welcome back to your overview')}
                    </p>
                </div>
                <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-md)',
                    background: 'var(--surface)',
                    padding: '4px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)'
                }}>
                    <select style={{
                        border: 'none',
                        background: 'transparent',
                        padding: '8px 12px',
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        outline: 'none'
                    }}>
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Year</option>
                    </select>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-xl)'
            }}>
                <StatCard
                    title={t('dashboard.total_sales', 'Total Sales')}
                    value={formatCurrency(stats.totalSales)}
                    trend="+12.5%"
                    trendUp={true}
                    icon={<SalesIcon size={24} style={{ color: 'white' }} />}
                    color="var(--primary)"
                />
                <StatCard
                    title={t('dashboard.active_users', 'Active Users')}
                    value={stats.activeUsers.toLocaleString()}
                    trend="+5.2%"
                    trendUp={true}
                    icon={<UserIcon size={24} style={{ color: 'white' }} />}
                    color="#10b981"
                />
                <StatCard
                    title={t('dashboard.new_orders', 'New Orders')}
                    value={stats.newOrders}
                    trend="-2.4%"
                    trendUp={false}
                    icon={<InventoryIcon size={24} style={{ color: 'white' }} />}
                    color="#f59e0b"
                />
                <StatCard
                    title={t('dashboard.pending_issues', 'Pending Issues')}
                    value={stats.pendingIssues}
                    trend="+4"
                    trendUp={false} // Bad if issues go up
                    icon={<BellIcon size={24} style={{ color: 'white' }} />}
                    color="#ef4444"
                />
            </div>

            {/* Charts Section */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                gap: 'var(--spacing-xl)',
                marginBottom: 'var(--spacing-xl)'
            }}>
                {/* Revenue Chart */}
                <div style={{
                    background: 'var(--surface)',
                    padding: 'var(--spacing-xl)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
                        {t('dashboard.revenue_over_time', 'Revenue Over Time')}
                    </h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickFormatter={(value) => `${value / 1000000}M`} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sales by Category */}
                <div style={{
                    background: 'var(--surface)',
                    padding: 'var(--spacing-xl)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
                        {t('dashboard.sales_by_category', 'Sales by Category')}
                    </h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={100} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div style={{
                background: 'var(--surface)',
                padding: 'var(--spacing-xl)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                        {t('dashboard.recent_activity', 'Recent Activity')}
                    </h3>
                    <button style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                        {t('common.view_all', 'View All')}
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-md)',
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--background)',
                            transition: 'transform 0.2s'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'var(--surface-light)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary)',
                                fontWeight: 600
                            }}>
                                JD
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                    John Doe created a new order #ORD-2024-{100 + item}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                    2 hours ago
                                </div>
                            </div>
                            <div style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                color: '#10b981',
                                fontSize: '0.75rem',
                                fontWeight: 500
                            }}>
                                Completed
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, trendUp, icon, color }) {
    return (
        <div style={{
            background: 'var(--surface)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-md)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>{title}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{value}</div>
                </div>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${color}40`
                }}>
                    {icon}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                <span style={{
                    color: trendUp ? '#10b981' : '#ef4444',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                }}>
                    {trendUp ? <TrendingUpIcon size={14} /> : <TrendingDownIcon size={14} />}
                    {trend}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>vs last month</span>
            </div>
        </div>
    );
}
