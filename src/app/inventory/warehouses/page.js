'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function KhohngPage() {
    return (
        <PageTemplate
            title="Kho hàng"
            icon="🏪"
            breadcrumbs={[
                { label: 'Inventory' },
                { label: 'Warehouses' },
            ]}
        >
            <ComingSoon moduleName="Kho hàng" />
        </PageTemplate>
    );
}
