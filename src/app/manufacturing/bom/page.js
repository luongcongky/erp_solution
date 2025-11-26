'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function BOMPage() {
    return (
        <PageTemplate
            title="BOM"
            icon="📋"
            breadcrumbs={[
                { label: 'Manufacturing' },
                { label: 'BOM' },
            ]}
        >
            <ComingSoon moduleName="BOM" />
        </PageTemplate>
    );
}
