'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function NhcungcpPage() {
    return (
        <PageTemplate
            title="Nhà cung cấp"
            icon="🏢"
            breadcrumbs={[
                { label: 'Purchase' },
                { label: 'Suppliers' },
            ]}
        >
            <ComingSoon moduleName="Nhà cung cấp" />
        </PageTemplate>
    );
}
