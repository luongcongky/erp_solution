'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function LngPage() {
    return (
        <PageTemplate
            title="Lương"
            icon="💰"
            breadcrumbs={[
                { label: 'HR' },
                { label: 'Payroll' },
            ]}
        >
            <ComingSoon moduleName="Lương" />
        </PageTemplate>
    );
}
