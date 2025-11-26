'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function iuchnhkhoPage() {
    return (
        <PageTemplate
            title="Điều chỉnh kho"
            icon="⚖️"
            breadcrumbs={[
                { label: 'Inventory' },
                { label: 'Adjustments' },
            ]}
        >
            <ComingSoon moduleName="Điều chỉnh kho" />
        </PageTemplate>
    );
}
