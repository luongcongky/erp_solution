'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function BohnhPage() {
    return (
        <PageTemplate
            title="Bảo hành"
            icon="🛡️"
            breadcrumbs={[
                { label: 'Service' },
                { label: 'Warranty' },
            ]}
        >
            <ComingSoon moduleName="Bảo hành" />
        </PageTemplate>
    );
}
