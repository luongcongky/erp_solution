'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function NghphpPage() {
    return (
        <PageTemplate
            title="Nghỉ phép"
            icon="🏖️"
            breadcrumbs={[
                { label: 'HR' },
                { label: 'Leave Management' },
            ]}
        >
            <ComingSoon moduleName="Nghỉ phép" />
        </PageTemplate>
    );
}
