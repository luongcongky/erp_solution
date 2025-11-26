'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function SciPage() {
    return (
        <PageTemplate
            title="Sổ cái"
            icon="📚"
            breadcrumbs={[
                { label: 'Finance' },
                { label: 'General Ledger' },
            ]}
        >
            <ComingSoon moduleName="Sổ cái" />
        </PageTemplate>
    );
}
