'use client';

import {
    InventoryIcon,
    DashboardIcon,
    ProductIcon,
    WarehouseIcon,
    ScaleIcon
} from '@/components/icons';
import { MODULE_COLORS } from '@/lib/utils/menuHelpers';
import { useState } from 'react';

export default function TestIconsPage() {
    const [color, setColor] = useState('#667eea'); // Core/Inventory color

    const icons = [
        { name: 'InventoryIcon', Component: InventoryIcon },
        { name: 'DashboardIcon', Component: DashboardIcon },
        { name: 'ProductIcon', Component: ProductIcon },
        { name: 'WarehouseIcon', Component: WarehouseIcon },
        { name: 'ScaleIcon', Component: ScaleIcon },
    ];

    return (
        <div style={{ padding: '40px', background: '#1a1a1a', minHeight: '100vh', color: '#fff' }}>
            <h1>Icon Verification Page</h1>

            <div style={{ marginBottom: '20px' }}>
                <label>Test Color: </label>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />
                <span style={{ marginLeft: '10px' }}>{color}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {icons.map(({ name, Component }) => (
                    <div key={name} style={{
                        border: '1px solid #333',
                        padding: '20px',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <h3>{name}</h3>

                        {/* Render with style prop (what Sidebar uses) */}
                        <div style={{ marginBottom: '10px' }}>
                            <small>style prop:</small>
                            <div>
                                <Component size={32} style={{ color: color }} />
                            </div>
                        </div>

                        {/* Render with color prop (checking if supported directly) */}
                        <div style={{ marginBottom: '10px' }}>
                            <small>inherited color:</small>
                            <div style={{ color: color }}>
                                <Component size={32} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '40px' }}>
                <h2>Debug Info</h2>
                <pre style={{ background: '#000', padding: '20px' }}>
                    {JSON.stringify({
                        MODULE_COLORS,
                        inventoryColor: MODULE_COLORS['Inventory']
                    }, null, 2)}
                </pre>
            </div>
        </div>
    );
}
