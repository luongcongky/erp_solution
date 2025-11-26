'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function ChmcngPage() {
    return (
        <PageTemplate
            title="Chấm công"
            icon="📅"
            breadcrumbs={[
                { label: 'HR' },
                { label: 'Attendance' },
            ]}
        >
            <ComingSoon moduleName="Chấm công" />
        </PageTemplate>
    );
}
