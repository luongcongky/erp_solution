'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function TnkhoPage() {
    return (
        <PageTemplate
            title="Tồn kho"
            icon="📊"
            breadcrumbs={[
                { label: 'Inventory' },
                { label: 'Stock Movements' },
            ]}
        >
            <ComingSoon moduleName="Tồn kho" />
        </PageTemplate>
    );
}
