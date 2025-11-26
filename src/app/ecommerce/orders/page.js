'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function nhngonlinePage() {
    return (
        <PageTemplate
            title="Đơn hàng online"
            icon="🛒"
            breadcrumbs={[
                { label: 'E-commerce' },
                { label: 'Online Orders' },
            ]}
        >
            <ComingSoon moduleName="Đơn hàng online" />
        </PageTemplate>
    );
}
