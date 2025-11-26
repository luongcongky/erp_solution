'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function LnhsnxutPage() {
    return (
        <PageTemplate
            title="Lệnh sản xuất"
            icon="🏭"
            breadcrumbs={[
                { label: 'Manufacturing' },
                { label: 'Work Orders' },
            ]}
        >
            <ComingSoon moduleName="Lệnh sản xuất" />
        </PageTemplate>
    );
}
