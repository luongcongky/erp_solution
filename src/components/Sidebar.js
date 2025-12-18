'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    DashboardIcon,
    SalesIcon,
    InventoryIcon,
    FinanceIcon,
    HRIcon,
    SettingsIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    MenuIcon,
    ProductIcon,
    MapPinIcon,
    BarcodeIcon,
    ClipboardIcon,
    AlertIcon,
    WarningIcon,
    PluginIcon,
    WarehouseIcon,
    ScaleIcon,
    ProjectsIcon,
    CoreIcon,
    UserIcon,
    StockManagementIcon,
    StockInIcon,
    StockOutIcon,
    StockBalanceIcon,
    BuildingIcon
} from './icons';
import { isMenuItemOrChildActive, MODULE_COLORS } from '@/lib/utils/menuHelpers';
import styles from './Sidebar.module.css';
import { useAuth } from '@/components/AuthProvider';

// Icon mapping for dynamic menu items
const iconMap = {
    DashboardIcon,
    SalesIcon,
    InventoryIcon,
    FinanceIcon,
    HRIcon,
    SettingsIcon,
    ProductIcon,
    MapPinIcon,
    BarcodeIcon,
    ClipboardIcon,
    AlertIcon,
    WarningIcon,
    PluginIcon,
    WarehouseIcon,
    ScaleIcon,
    ProjectsIcon,
    CoreIcon,
    UserIcon,
    MenuIcon,
    StockManagementIcon,
    StockInIcon,
    StockOutIcon,
    StockBalanceIcon,
    BuildingIcon
};

// Recursive menu item component
function MenuItem({ item, pathname, level = 1, expandedItems, toggleExpand, moduleColor }) {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.id] || false;
    const isActive = item.href === pathname;
    const isChildActive = isMenuItemOrChildActive(item, pathname);
    const IconComponent = item.icon && iconMap[item.icon] ? iconMap[item.icon] : null;

    const handleClick = (e) => {
        if (hasChildren) {
            e.preventDefault();
            toggleExpand(item.id);
        }
    };

    // Compute style based on level and state
    const getLevelStyles = () => {
        const basePadding = 'var(--spacing-lg)';
        let paddingLeft = basePadding;
        let fontSize = '0.9375rem';
        let fontWeight = isActive ? 700 : 600;
        let iconSize = 22;
        let marginBottom = '2px';
        let background = isActive ? `${moduleColor}20` : 'transparent'; // Hex + 20 opacity
        let borderLeft = isActive ? `4px solid ${moduleColor}` : '4px solid transparent';
        let hoverBackground = `${moduleColor}10`; // Hex + 10 opacity

        if (level === 2) {
            paddingLeft = 'calc(var(--spacing-lg) + 28px)';
            fontSize = '0.8125rem';
            fontWeight = isActive ? 600 : 500;
            iconSize = 18;
            marginBottom = '1px';
            background = isActive ? `${moduleColor}15` : 'rgba(0, 0, 0, 0.02)';
            borderLeft = isActive ? `3px solid ${moduleColor}` : `3px solid ${moduleColor}20`;
            hoverBackground = `${moduleColor}08`;
        } else if (level === 3) {
            paddingLeft = 'calc(var(--spacing-lg) + 56px)';
            fontSize = '0.75rem';
            fontWeight = isActive ? 600 : 400;
            iconSize = 16;
            marginBottom = '0px';
            background = isActive ? `${moduleColor}10` : 'rgba(0, 0, 0, 0.01)';
            borderLeft = isActive ? `2px solid ${moduleColor}` : `2px solid ${moduleColor}15`;
            hoverBackground = `${moduleColor}05`;
        }

        return {
            paddingLeft,
            fontSize,
            fontWeight,
            iconSize,
            marginBottom,
            background,
            borderLeft,
            hoverBackground,
            color: isActive ? moduleColor : isChildActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        };
    };

    const currentStyle = getLevelStyles();

    const itemStyle = {
        gap: level === 1 ? 'var(--spacing-md)' : 'var(--spacing-sm)',
        padding: level === 1 ? 'var(--spacing-md) var(--spacing-lg)' : 'var(--spacing-sm) var(--spacing-md)',
        paddingLeft: currentStyle.paddingLeft,
        color: currentStyle.color,
        background: currentStyle.background,
        borderLeft: currentStyle.borderLeft,
        fontWeight: currentStyle.fontWeight,
        fontSize: currentStyle.fontSize,
        marginBottom: currentStyle.marginBottom,
    };

    const content = (
        <>
            {level === 3 && !IconComponent && !item.icon && (
                <MenuIcon size={currentStyle.iconSize} className={styles.dotLevel3} style={{ color: isActive ? moduleColor : 'var(--text-muted)' }} />
            )}
            {IconComponent && <IconComponent size={currentStyle.iconSize} style={{ color: moduleColor }} />}
            {!IconComponent && item.icon && (
                <span style={{ fontSize: `${currentStyle.iconSize}px`, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: moduleColor }}>
                    {item.icon}
                </span>
            )}
            <span className={styles.label} style={{ letterSpacing: level === 1 ? '0.01em' : level === 2 ? '0.005em' : '0em' }}>
                {item.label}
            </span>
            {hasChildren && (
                <div className={styles.expandIcon} style={{ color: level === 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {isExpanded ? (
                        <ChevronDownIcon size={level === 1 ? 16 : 14} />
                    ) : (
                        <ChevronRightIcon size={level === 1 ? 16 : 14} />
                    )}
                </div>
            )}
        </>
    );

    return (
        <>
            <li className={styles.menuItem}>
                {item.href ? (
                    <Link
                        href={item.href}
                        className={styles.link}
                        style={itemStyle}
                        onClick={hasChildren ? handleClick : undefined}
                        onMouseEnter={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.background = currentStyle.hoverBackground;
                                e.currentTarget.style.color = 'var(--text-primary)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.background = currentStyle.background;
                                e.currentTarget.style.color = isChildActive ? 'var(--text-primary)' : 'var(--text-secondary)';
                            }
                        }}
                    >
                        {content}
                    </Link>
                ) : (
                    <div
                        className={styles.button}
                        style={itemStyle}
                        onClick={handleClick}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentStyle.hoverBackground;
                            e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = currentStyle.background;
                            e.currentTarget.style.color = isChildActive ? 'var(--text-primary)' : 'var(--text-secondary)';
                        }}
                    >
                        {content}
                    </div>
                )}
            </li>
            {hasChildren && isExpanded && (
                <div className={styles.childrenContainer} style={{
                    background: level === 1 ? 'rgba(0, 0, 0, 0.015)' : 'transparent',
                    borderLeft: level === 1 ? `2px solid ${moduleColor}30` : 'none',
                    marginLeft: level === 1 ? 'var(--spacing-lg)' : '0',
                    paddingTop: level === 1 ? '2px' : '0',
                    paddingBottom: level === 1 ? '4px' : '0',
                }}>
                    {item.children.map((child) => (
                        <MenuItem
                            key={child.id}
                            item={child}
                            pathname={pathname}
                            level={level + 1}
                            expandedItems={expandedItems}
                            toggleExpand={toggleExpand}
                            moduleColor={moduleColor}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

export default function Sidebar() {
    const pathname = usePathname();
    const { user, activeRole } = useAuth();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedItems, setExpandedItems] = useState({});

    // Fetch menu items from API
    useEffect(() => {
        async function fetchMenus() {
            try {
                setLoading(true);
                const headers = { 'Content-Type': 'application/json' };
                if (user) {
                    // Only set x-user-role if user is authenticated and has a role
                    if (activeRole) {
                        headers['x-user-role'] = activeRole;
                    }

                    // Prioritize ten_id/stg_id from user object, then company object, then defaults
                    const tenId = user.ten_id || user.company?.ten_id || '1000';
                    const stgId = user.stg_id || user.company?.stg_id || 'DEV';

                    headers['x-tenant-id'] = tenId;
                    headers['x-stage-id'] = stgId;
                }
                const response = await fetch('/api/menus', { headers });
                if (!response.ok) throw new Error('Failed to fetch menus');
                const data = await response.json();
                if (data.success) {
                    setMenuItems(data.data);
                    const expanded = {};
                    data.data.forEach((item) => {
                        if (isMenuItemOrChildActive(item, pathname)) {
                            expanded[item.id] = true;
                            if (item.children) {
                                item.children.forEach((child) => {
                                    if (isMenuItemOrChildActive(child, pathname)) {
                                        expanded[child.id] = true;
                                    }
                                });
                            }
                        }
                    });
                    setExpandedItems(expanded);
                } else {
                    throw new Error(data.error || 'Failed to fetch menus');
                }
            } catch (err) {
                console.error('Error fetching menus:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchMenus();
    }, [pathname, user, activeRole]);

    const toggleExpand = (itemId) => {
        setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    // Don't show sidebar on auth page and api-docs page
    if (pathname === '/auth' || pathname === '/api-docs' || pathname.startsWith('/api-docs')) {
        return null;
    }

    return (
        <aside className={styles.sidebar}>
            <nav>
                {loading && <div className={styles.loading}>Loading menu...</div>}
                {error && <div className={styles.error}>Error loading menu</div>}
                {!loading && !error && (
                    <ul className={styles.menuList}>
                        {menuItems.map((item) => (
                            <MenuItem
                                key={item.id}
                                item={item}
                                pathname={pathname}
                                level={1}
                                expandedItems={expandedItems}
                                toggleExpand={toggleExpand}
                                moduleColor={MODULE_COLORS[item.label] || 'var(--primary)'}
                            />
                        ))}
                    </ul>
                )}
            </nav>
        </aside>
    );
}
