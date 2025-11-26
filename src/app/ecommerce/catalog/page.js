'use client';

import PageTemplate, { ComingSoon } from '@/components/PageTemplate';

export default function CatalogsnphmPage() {
    return (
        <PageTemplate
            title="Catalog sản phẩm"
            icon="📚"
            breadcrumbs={[
                { label: 'E-commerce' },
                { label: 'Product Catalog' },
            ]}
        >
            <ComingSoon moduleName="Catalog sản phẩm" />
        </PageTemplate>
    );
}
