'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function KimsotchtlngPage() {
    return (
        <PageTemplate
            title="Kiểm soát chất lượng"
            icon="✅"
            breadcrumbs={[
                { label: 'Manufacturing' },
                { label: 'Quality Control' },
            ]}
        >
            <ComingSoon moduleName="Kiểm soát chất lượng" />
        </PageTemplate>
    );
}
