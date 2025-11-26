'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function YucumuahngPage() {
    return (
        <PageTemplate
            title="Yêu cầu mua hàng"
            icon="📝"
            breadcrumbs={[
                { label: 'Purchase' },
                { label: 'Purchase Requests' },
            ]}
        >
            <ComingSoon moduleName="Yêu cầu mua hàng" />
        </PageTemplate>
    );
}
