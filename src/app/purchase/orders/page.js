'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function nmuahngPage() {
    return (
        <PageTemplate
            title="Đơn mua hàng"
            icon="📋"
            breadcrumbs={[
                { label: 'Purchase' },
                { label: 'Purchase Orders' },
            ]}
        >
            <ComingSoon moduleName="Đơn mua hàng" />
        </PageTemplate>
    );
}
