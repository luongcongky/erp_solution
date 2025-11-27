'use client';

import PageTemplate from '@/components/PageTemplate';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useEventTracking } from '@/hooks/useEventTracking';
import { ACTION_TYPES } from '@/config/action.config';
import Modal from '@/components/Modal';
import appConfig from '@/config/app.config';
import '@/styles/datatable-common.css';
import './languages.css';

export default function LanguagesPage() {
    const [translations, setTranslations] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(appConfig.pagination.defaultPageSize);
    const [filters, setFilters] = useState({
        search: '',
        language: 'all',
        module: 'all'
    });
    const [showModal, setShowModal] = useState(false);
    const [editingKey, setEditingKey] = useState(null);
    const [formData, setFormData] = useState({
        key: '',
        module: 'core',
        description: '',
        vi: '',
        en: '',
        ko: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const languages = [
        { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'ko', name: 'Korean', flag: '🇰🇷' }
    ];
    const { t, loading: loadingTranslations } = useTranslations();
    const { trackEvent } = useEventTracking();
    const MODULE_NAME = 'LANGUAGES';

    useEffect(() => {
        fetchTranslations();
    }, [currentPage, pageSize, filters]);

    const fetchTranslations = async () => {
        try {
            setLoadingData(true);
            setError(null);

            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: pageSize.toString(),
            });

            if (filters.search) params.append('search', filters.search);
            if (filters.language !== 'all') params.append('language', filters.language);
            if (filters.module !== 'all') params.append('module', filters.module);

            const response = await fetch(`/api/translations?${params.toString()}`);
            const data = await response.json();

            if (data.success) {
                setTranslations(data.data);
                setTotalRecords(data.pagination.total);
            } else {
                setError(data.error || 'Failed to fetch translations');
            }
        } catch (err) {
            console.error('Error fetching translations:', err);
            setError('Failed to load translations. Please try again.');
        } finally {
            setLoadingData(false);
        }
    };

    const handleAdd = () => {
        trackEvent({
            action: ACTION_TYPES.CREATE,
            module: MODULE_NAME,
            object_type: 'Translation',
            details: 'Opened Add Translation modal'
        });
        setEditingKey(null);
        setFormData({
            key: '',
            module: 'core',
            description: '',
            vi: '',
            en: '',
            ko: ''
        });
        setShowModal(true);
    };

    const handleEdit = (item) => {
        trackEvent({
            action: ACTION_TYPES.UPDATE,
            module: MODULE_NAME,
            object_type: 'Translation',
            object_id: item.key,
            details: `Opened Edit Translation modal for key: ${item.key}`
        });
        setEditingKey(item.key);
        setFormData({
            key: item.key,
            module: item.module || 'core',
            description: item.description || '',
            vi: item.translations.vi || '',
            en: item.translations.en || '',
            ko: item.translations.ko || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (key) => {
        if (!confirm(`Are you sure you want to delete translation key "${key}"?`)) {
            return;
        }

        trackEvent({
            action: ACTION_TYPES.DELETE,
            module: MODULE_NAME,
            object_type: 'Translation',
            object_id: key,
            details: `Deleted translation key: ${key}`
        });

        try {
            const response = await fetch(`/api/translations?key=${encodeURIComponent(key)}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (data.success) {
                fetchTranslations();
            } else {
                alert('Failed to delete translation: ' + data.error);
            }
        } catch (err) {
            console.error('Error deleting translation:', err);
            alert('Failed to delete translation');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            key: formData.key,
            module: formData.module,
            description: formData.description,
            translations: {
                vi: formData.vi,
                en: formData.en,
                ko: formData.ko
            }
        };

        try {
            const method = editingKey ? 'PUT' : 'POST';
            const response = await fetch('/api/translations', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                setShowModal(false);
                fetchTranslations();
            } else {
                alert('Failed to save translation: ' + data.error);
            }
        } catch (err) {
            console.error('Error saving translation:', err);
            alert('Failed to save translation');
        } finally {
            setSubmitting(false);
        }
    };

    const totalPages = Math.ceil(totalRecords / pageSize);

    if (loadingTranslations) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <>
            <PageTemplate
                breadcrumbs={[
                    { label: 'Core' },
                    { label: 'Languages' },
                ]}
                actions={
                    <button className="btn btn-primary" onClick={handleAdd}>
                        + Add Translation
                    </button>
                }
                filters={
                    <div className="filterBar">
                        <div className="searchInputWrapper">
                            <span className="searchIcon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search by key or value..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="searchInput"
                            />
                        </div>

                        <select
                            value={filters.language}
                            onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
                            className="filterSelect"
                        >
                            <option value="all">All Languages</option>
                            <option value="vi">Vietnamese (VI)</option>
                            <option value="en">English (EN)</option>
                            <option value="ko">Korean (KO)</option>
                        </select>

                        <select
                            value={filters.module}
                            onChange={(e) => setFilters(prev => ({ ...prev, module: e.target.value }))}
                            className="filterSelect"
                        >
                            <option value="all">All Modules</option>
                            <option value="core">Core</option>
                            <option value="sales">Sales</option>
                            <option value="inventory">Inventory</option>
                            <option value="finance">Finance</option>
                            <option value="hr">HR</option>
                        </select>

                        {(filters.search || filters.language !== 'all' || filters.module !== 'all') && (
                            <button
                                onClick={() => {
                                    setFilters({ search: '', language: 'all', module: 'all' });
                                    trackEvent({
                                        action: ACTION_TYPES.FILTER,
                                        module: MODULE_NAME,
                                        details: 'Cleared all filters'
                                    });
                                }}
                                className="clearFiltersBtn"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                }
            >

                {error && (
                    <div style={{ padding: '20px', background: '#fee', color: '#c00', borderRadius: '8px', marginBottom: '20px' }}>
                        {error}
                    </div>
                )}

                {/* Translations Table */}
                <div className="tableContainer">
                    <div style={{ overflowX: 'auto' }}>
                        <table className="dataTable languagesTable">
                            <thead className="tableHeader">
                                <tr>
                                    <th className="tableHeaderCell" style={{ width: '250px' }}>KEY</th>
                                    <th className="tableHeaderCell" style={{ width: '100px' }}>MODULE</th>
                                    <th className="tableHeaderCell" style={{ width: '200px' }}>VIETNAMESE (VI)</th>
                                    <th className="tableHeaderCell" style={{ width: '200px' }}>ENGLISH (EN)</th>
                                    <th className="tableHeaderCell" style={{ width: '200px' }}>KOREAN (KO)</th>
                                    <th className="tableHeaderCell noSort" style={{ width: '120px' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingData ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                            <div className="spinner"></div>
                                        </td>
                                    </tr>
                                ) : translations.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                            No translations found
                                        </td>
                                    </tr>
                                ) : (
                                    translations.map((item, index) => (
                                        <tr
                                            key={item.key}
                                            className={`tableRow ${index % 2 === 0 ? 'even' : 'odd'}`}
                                        >
                                            <td className="tableCell">
                                                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                                    {item.key}
                                                </div>
                                                {item.description && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                        {item.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="tableCell">
                                                <span className="moduleBadge">{item.module || '-'}</span>
                                            </td>
                                            <td className="tableCell">{item.translations.vi || '-'}</td>
                                            <td className="tableCell">{item.translations.en || '-'}</td>
                                            <td className="tableCell">{item.translations.ko || '-'}</td>
                                            <td className="tableCell">
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        className="editButton"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="deleteButton"
                                                        onClick={() => handleDelete(item.key)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="paginationContainer">
                        <div className="paginationInfo">
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} results
                        </div>
                        <div className="paginationControls">
                            <button
                                onClick={() => {
                                    setCurrentPage(p => Math.max(1, p - 1));
                                    trackEvent({
                                        action: ACTION_TYPES.NAVIGATE,
                                        module: MODULE_NAME,
                                        details: 'Navigated to previous page'
                                    });
                                }}
                                disabled={currentPage === 1}
                                className="paginationButton"
                            >
                                Previous
                            </button>
                            <div className="paginationNumbers">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum = i + 1;
                                    if (totalPages > 5 && currentPage > 3) {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    if (pageNum > totalPages) return null;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => {
                                                setCurrentPage(pageNum);
                                                trackEvent({
                                                    action: ACTION_TYPES.NAVIGATE,
                                                    module: MODULE_NAME,
                                                    details: `Navigated to page ${pageNum}`
                                                });
                                            }}
                                            className={`pageNumber ${pageNum === currentPage ? 'active' : ''}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => {
                                    setCurrentPage(p => Math.min(totalPages, p + 1));
                                    trackEvent({
                                        action: ACTION_TYPES.NAVIGATE,
                                        module: MODULE_NAME,
                                        details: 'Navigated to next page'
                                    });
                                }}
                                disabled={currentPage === totalPages}
                                className="paginationButton"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </PageTemplate>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingKey ? 'Edit Translation' : 'Add New Translation'}
                maxWidth="800px"
                footer={
                    <>
                        <button
                            type="button"
                            className="btn secondary"
                            onClick={() => setShowModal(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn primary"
                            disabled={submitting}
                            onClick={handleSubmit}
                        >
                            {submitting ? 'Saving...' : (editingKey ? 'Save Changes' : 'Create Translation')}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit}>
                    <div className="formGroup">
                        <label>Translation Key *</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.key}
                            onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                            placeholder="e.g., pages.users.title"
                            required
                            disabled={!!editingKey}
                        />
                    </div>

                    <div className="formGroup">
                        <label>Module</label>
                        <select
                            className="input"
                            value={formData.module}
                            onChange={(e) => setFormData(prev => ({ ...prev, module: e.target.value }))}
                        >
                            <option value="core">Core</option>
                            <option value="sales">Sales</option>
                            <option value="inventory">Inventory</option>
                            <option value="finance">Finance</option>
                            <option value="hr">HR</option>
                        </select>
                    </div>

                    <div className="formGroup">
                        <label>Description</label>
                        <textarea
                            className="input"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Description for translators"
                            rows="2"
                        />
                    </div>

                    <div className="translationsGrid">
                        {languages.map(lang => (
                            <div key={lang.code} className="formGroup">
                                <label className="langLabel">
                                    <span className="langFlag">{lang.flag}</span>
                                    {lang.name}
                                </label>
                                <textarea
                                    className="input"
                                    value={formData[lang.code] || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        [lang.code]: e.target.value
                                    }))}
                                    placeholder={`Translation in ${lang.name}`}
                                    rows="3"
                                />
                            </div>
                        ))}
                    </div>
                </form>
            </Modal>
        </>
    );
}
