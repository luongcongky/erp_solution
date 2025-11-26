'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function RoutingPage() {
    return (
        <PageTemplate
            title="Routing"
            icon="🔄"
            breadcrumbs={[
                { label: 'Manufacturing' },
                { label: 'Routing' },
            ]}
        >
            <ComingSoon moduleName="Routing" />
        </PageTemplate>
    );
}
