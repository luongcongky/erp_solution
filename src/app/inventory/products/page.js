'use client';

import PageTemplate from '@/components/PageTemplate';
import { useTranslations } from '@/hooks/useTranslations';
import { useState } from 'react';
import Link from 'next/link';
import '@/styles/datatable-common.css'; // Reuse existing compact styles

export default function ProductListPage() {
    const { t } = useTranslations();

    // Mock Data for Products
    const [products] = useState([
        { id: 1, sku: 'RAW-001', name: 'Steel Sheet 2mm', type: 'Raw Material', uom: 'kg', stock: 1500, tracking: 'Batch' },
        { id: 2, sku: 'RAW-002', name: 'Plastic Granules', type: 'Raw Material', uom: 'kg', stock: 5000, tracking: 'Batch' },
        { id: 3, sku: 'SUB-001', name: 'Motor Assembly', type: 'Semi-Finished', uom: 'pcs', stock: 200, tracking: 'Serial' },
        { id: 4, sku: 'FIN-001', name: 'Industrial Fan Model A', type: 'Finished', uom: 'pcs', stock: 50, tracking: 'Serial' },
        { id: 5, sku: 'SRV-001', name: 'Installation Service', type: 'Service', uom: 'hr', stock: 0, tracking: 'None' },
    ]);

    return (
        <PageTemplate
            breadcrumbs={[
                { label: t('modules.inventory', 'Inventory') },
                { label: t('pages.products.title', 'Products') },
            ]}
            actions={
                <button className="btn btn-primary">
                    + {t('common.create', 'Create Product')}
                </button>
            }
            filters={
                <div className="filterBar">
                    <div className="searchInputWrapper">
                        <span className="searchIcon">🔍</span>
                        <input
                            type="text"
                            placeholder={t('common.search', 'Search products...')}
                            className="searchInput"
                        />
                    </div>
                    <select className="filterSelect">
                        <option value="all">All Types</option>
                        <option value="raw">Raw Material</option>
                        <option value="finished">Finished Goods</option>
                    </select>
                </div>
            }
        >
            <div className="tableContainer">
                <table className="dataTable">
                    <thead className="tableHeader">
                        <tr>
                            <th className="tableHeaderCell">SKU</th>
                            <th className="tableHeaderCell">Name</th>
                            <th className="tableHeaderCell">Type</th>
                            <th className="tableHeaderCell">UoM</th>
                            <th className="tableHeaderCell">On Hand</th>
                            <th className="tableHeaderCell">Tracking</th>
                            <th className="tableHeaderCell">Status</th>
                            <th className="tableHeaderCell">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product, index) => (
                            <tr key={product.id} className={`tableRow ${index % 2 === 0 ? 'even' : 'odd'}`}>
                                <td className="tableCell" style={{ fontWeight: '600', color: 'var(--primary)' }}>
                                    {product.sku}
                                </td>
                                <td className="tableCell">{product.name}</td>
                                <td className="tableCell">
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid var(--border)'
                                    }}>
                                        {product.type}
                                    </span>
                                </td>
                                <td className="tableCell">{product.uom}</td>
                                <td className="tableCell" style={{ fontWeight: '600' }}>{product.stock}</td>
                                <td className="tableCell">
                                    {product.tracking !== 'None' && (
                                        <span style={{
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontSize: '0.7rem',
                                            background: product.tracking === 'Serial' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                            color: product.tracking === 'Serial' ? '#d8b4fe' : '#93c5fd'
                                        }}>
                                            {product.tracking}
                                        </span>
                                    )}
                                </td>
                                <td className="tableCell">
                                    <span className="roleBadge admin" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
                                        Active
                                    </span>
                                </td>
                                <td className="tableCell">
                                    <div className="actionButtons">
                                        <button className="editButton">Edit</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination (Reusing existing structure) */}
                <div className="paginationContainer">
                    <div className="paginationInfo">Showing 1 to 5 of 5 results</div>
                    <div className="paginationControls">
                        <button className="paginationButton" disabled>Previous</button>
                        <div className="paginationNumbers">
                            <button className="pageNumber active">1</button>
                        </div>
                        <button className="paginationButton" disabled>Next</button>
                    </div>
                </div>
            </div>
        </PageTemplate>
    );
}
