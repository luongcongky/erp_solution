'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function KhchhngPage() {
    return (
        <PageTemplate
            title="Khách hàng"
            icon="🤝"
            breadcrumbs={[
                { label: 'Sales & CRM' },
                { label: 'Customers' },
            ]}
        >
            <ComingSoon moduleName="Khách hàng" />
        </PageTemplate>
    );
}
