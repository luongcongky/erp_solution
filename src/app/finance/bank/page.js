'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function NgnhngTinmtPage() {
    return (
        <PageTemplate
            title="Ngân hàng & Tiền mặt"
            icon="🏦"
            breadcrumbs={[
                { label: 'Finance' },
                { label: 'Bank & Cash' },
            ]}
        >
            <ComingSoon moduleName="Ngân hàng & Tiền mặt" />
        </PageTemplate>
    );
}
