'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function QunlLeadsPage() {
    return (
        <PageTemplate
            title="Quản lý Leads"
            icon="🎯"
            breadcrumbs={[
                { label: 'Sales & CRM' },
                { label: 'Leads' },
            ]}
        >
            <ComingSoon moduleName="Quản lý Leads" />
        </PageTemplate>
    );
}
