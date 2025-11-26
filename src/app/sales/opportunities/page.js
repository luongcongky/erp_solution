'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function QunlOpportunitiesPage() {
    return (
        <PageTemplate
            title="Quản lý Opportunities"
            icon="💡"
            breadcrumbs={[
                { label: 'Sales & CRM' },
                { label: 'Opportunities' },
            ]}
        >
            <ComingSoon moduleName="Quản lý Opportunities" />
        </PageTemplate>
    );
}
