'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function BogiPage() {
    return (
        <PageTemplate
            title="Báo giá"
            icon="📄"
            breadcrumbs={[
                { label: 'Sales & CRM' },
                { label: 'Quotations' },
            ]}
        >
            <ComingSoon moduleName="Báo giá" />
        </PageTemplate>
    );
}
