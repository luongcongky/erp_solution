'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function ThuPage() {
    return (
        <PageTemplate
            title="Thuế"
            icon="📊"
            breadcrumbs={[
                { label: 'Finance' },
                { label: 'Tax' },
            ]}
        >
            <ComingSoon moduleName="Thuế" />
        </PageTemplate>
    );
}
