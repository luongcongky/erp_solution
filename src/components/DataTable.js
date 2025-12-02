import { useState } from 'react';

export default function DataTable({
    data = [],
    columns = [],
    pageSize = 10,
    selectable = false,
    onSelectionChange,
    selectedIds = [],
    onRowClick,
    loading = false,
    emptyMessage = 'No data found'
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    const handleSort = (columnKey) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
    };

    const handleSelectAll = (e) => {
        if (onSelectionChange) {
            if (e.target.checked) {
                onSelectionChange(data.map(row => row.id));
            } else {
                onSelectionChange([]);
            }
        }
    };

    const handleSelectRow = (id) => {
        if (onSelectionChange) {
            if (selectedIds.includes(id)) {
                onSelectionChange(selectedIds.filter(sid => sid !== id));
            } else {
                onSelectionChange([...selectedIds, id]);
            }
        }
    };

    // Sort data
    let sortedData = [...data];
    if (sortColumn) {
        sortedData.sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Paginate
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

    if (loading) {
        return (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto' }}></div>
                <p className="text-gray-500" style={{ marginTop: '1rem' }}>Loading...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📭</div>
                <p className="text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="card" style={{
            padding: 0,
            overflow: 'hidden',
            border: '1px solid var(--table-outer-border)',
            borderRadius: 'var(--table-border-radius)',
            background: 'var(--table-bg)',
            boxShadow: 'none'
        }}>
            <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--table-header-bg)', borderBottom: '1px solid var(--table-header-border)' }}>
                            {selectable && (
                                <th style={{ padding: '12px 16px', width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        checked={data.length > 0 && selectedIds.length === data.length}
                                        onChange={handleSelectAll}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </th>
                            )}
                            {columns.map((column, colIndex) => (
                                <th
                                    key={column.key || column.field || `col-${colIndex}`}
                                    onClick={() => column.sortable && handleSort(column.key || column.field)}
                                    style={{
                                        padding: '12px 16px',
                                        textAlign: 'left',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        color: 'var(--table-header-text)',
                                        cursor: column.sortable ? 'pointer' : 'default',
                                        userSelect: 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {column.header || column.label}
                                        {column.sortable && sortColumn === (column.key || column.field) && (
                                            <span style={{ fontSize: '0.75rem' }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, index) => (
                            <tr
                                key={row.id || index}
                                onClick={() => onRowClick && onRowClick(row)}
                                style={{
                                    borderBottom: '1px solid var(--table-border)',
                                    cursor: onRowClick ? 'pointer' : 'default',
                                    background: selectedIds.includes(row.id) ? 'rgba(37, 99, 235, 0.1)' : (index % 2 === 0 ? 'var(--table-row-even)' : 'var(--table-row-odd)'),
                                    transition: 'background 0.15s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--table-row-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = selectedIds.includes(row.id) ? 'rgba(37, 99, 235, 0.1)' : (index % 2 === 0 ? 'var(--table-row-even)' : 'var(--table-row-odd)')}
                            >
                                {selectable && (
                                    <td style={{ padding: '12px 16px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(row.id)}
                                            onChange={() => handleSelectRow(row.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </td>
                                )}
                                {columns.map((column, colIndex) => (
                                    <td key={colIndex} style={{ padding: '12px 16px', fontSize: '0.875rem', color: 'var(--table-header-text)' }}>
                                        {column.render
                                            ? column.render(row)
                                            : row[column.key || column.field]
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div style={{
                padding: '12px 16px',
                borderTop: '1px solid var(--table-surface)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--table-surface)'
            }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Showing {startIndex + 1} to {Math.min(startIndex + pageSize, data.length)} of {data.length} results
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="btn btn-sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={{
                            opacity: currentPage === 1 ? 0.3 : 1,
                            color: 'var(--text-primary)',
                            borderColor: 'var(--btn-border)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'var(--pagination-hover)')}
                        onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'transparent')}
                    >
                        Previous
                    </button>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum = i + 1;
                            if (totalPages > 5 && currentPage > 3) {
                                pageNum = currentPage - 2 + i;
                            }
                            if (pageNum > totalPages) return null;

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '4px',
                                        border: pageNum === currentPage ? 'none' : '1px solid var(--btn-border)',
                                        background: pageNum === currentPage ? 'var(--pagination-active-bg)' : 'transparent',
                                        color: pageNum === currentPage ? 'var(--pagination-active-text)' : 'var(--pagination-inactive-text)',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => pageNum !== currentPage && (e.currentTarget.style.background = 'var(--pagination-hover)')}
                                    onMouseLeave={(e) => pageNum !== currentPage && (e.currentTarget.style.background = 'transparent')}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>
                    <button
                        className="btn btn-sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                            opacity: currentPage === totalPages ? 0.3 : 1,
                            color: 'var(--text-primary)',
                            borderColor: 'var(--btn-border)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'var(--pagination-hover)')}
                        onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'transparent')}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
