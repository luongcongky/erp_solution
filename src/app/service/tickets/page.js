'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function TicketsPage() {
    return (
        <PageTemplate
            title="Tickets"
            icon="🎫"
            breadcrumbs={[
                { label: 'Service' },
                { label: 'Tickets' },
            ]}
        >
            <ComingSoon moduleName="Tickets" />
        </PageTemplate>
    );
}
