'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function CngnphithuPage() {
    return (
        <PageTemplate
            title="Công nợ phải thu"
            icon="💵"
            breadcrumbs={[
                { label: 'Finance' },
                { label: 'Accounts Receivable' },
            ]}
        >
            <ComingSoon moduleName="Công nợ phải thu" />
        </PageTemplate>
    );
}
