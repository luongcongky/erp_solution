'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function SLAPage() {
    return (
        <PageTemplate
            title="SLA"
            icon="⏱️"
            breadcrumbs={[
                { label: 'Service' },
                { label: 'SLA' },
            ]}
        >
            <ComingSoon moduleName="SLA" />
        </PageTemplate>
    );
}
