'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function RFQPage() {
    return (
        <PageTemplate
            title="RFQ"
            icon="💬"
            breadcrumbs={[
                { label: 'Purchase' },
                { label: 'RFQ' },
            ]}
        >
            <ComingSoon moduleName="RFQ" />
        </PageTemplate>
    );
}
