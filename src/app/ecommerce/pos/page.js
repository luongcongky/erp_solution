'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function POSPage() {
    return (
        <PageTemplate
            title="POS"
            icon="🖥️"
            breadcrumbs={[
                { label: 'E-commerce' },
                { label: 'POS' },
            ]}
        >
            <ComingSoon moduleName="POS" />
        </PageTemplate>
    );
}
