'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function CngnphitrPage() {
    return (
        <PageTemplate
            title="Công nợ phải trả"
            icon="💸"
            breadcrumbs={[
                { label: 'Finance' },
                { label: 'Accounts Payable' },
            ]}
        >
            <ComingSoon moduleName="Công nợ phải trả" />
        </PageTemplate>
    );
}
