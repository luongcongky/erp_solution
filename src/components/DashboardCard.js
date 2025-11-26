export default function DashboardCard({ title, value, change, trend, icon: Icon, color = 'var(--primary)' }) {
    const isPositive = trend === 'up';

    return (
        <div className="card" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-md)',
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
            }}>
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)',
                        marginBottom: 'var(--spacing-sm)',
                    }}>
                        {title}
                    </div>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        lineHeight: 1,
                    }}>
                        {value}
                    </div>
                </div>

                {Icon && (
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-md)',
                        background: `${color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: color,
                    }}>
                        <Icon size={24} />
                    </div>
                )}
            </div>

            {change && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-xs)',
                    fontSize: '0.875rem',
                }}>
                    <span style={{
                        color: isPositive ? 'var(--success)' : 'var(--error)',
                        fontWeight: 600,
                    }}>
                        {isPositive ? '↑' : '↓'} {change}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                        vs last month
                    </span>
                </div>
            )}
        </div>
    );
}
