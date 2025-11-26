import { useState } from 'react';
import * as XLSX from 'xlsx';

export const useExcelExport = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);

    const exportData = async ({
        fileName,
        apiEndpoint,
        filters = {},
        headers = {},
        transformData,
        sheetName = 'Sheet1',
        columnWidths = [],
        onSuccess,
        onError
    }) => {
        let fileHandle = null;

        // 1. Try to get File Handle FIRST (to preserve user gesture)
        if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
            try {
                fileHandle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{
                        description: 'Excel Files',
                        accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
                    }]
                });
            } catch (err) {
                // User cancelled the picker
                if (err.name === 'AbortError') {
                    console.log('User cancelled file picker');
                    return;
                }
                console.error('Error picking file:', err);
                // If error is not abort, we will fall back to standard download
            }
        }

        try {
            setIsExporting(true);
            setExportProgress(10);

            // Build query parameters
            const params = new URLSearchParams({
                page: '1',
                limit: '999999', // Get all records
            });

            // Append filters to params
            Object.keys(filters).forEach(key => {
                if (filters[key] !== 'all' && filters[key] !== '') {
                    params.append(key, filters[key]);
                }
            });

            setExportProgress(30);

            // Fetch data
            const response = await fetch(`${apiEndpoint}?${params.toString()}`, { headers });
            const data = await response.json();

            setExportProgress(60);

            if (data.success && data.data.length > 0) {
                // Transform data for Excel
                const excelData = transformData ? data.data.map(transformData) : data.data;

                setExportProgress(80);

                // Create workbook and worksheet
                const ws = XLSX.utils.json_to_sheet(excelData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, sheetName);

                // Set column widths if provided
                if (columnWidths.length > 0) {
                    ws['!cols'] = columnWidths;
                }

                // Style header row
                if (ws['!ref']) {
                    const range = XLSX.utils.decode_range(ws['!ref']);
                    for (let C = range.s.c; C <= range.e.c; ++C) {
                        const address = XLSX.utils.encode_col(C) + "1";
                        if (!ws[address]) continue;
                        ws[address].s = {
                            font: { bold: true },
                            fill: { fgColor: { rgb: "4F81BD" } },
                            alignment: { horizontal: "center" }
                        };
                    }
                }

                setExportProgress(90);

                // Write file
                if (fileHandle) {
                    // Write to the selected file handle
                    const writable = await fileHandle.createWritable();
                    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                    await writable.write(buffer);
                    await writable.close();

                    console.log('File saved successfully to:', fileHandle.name);
                } else {
                    // Fallback for browsers that don't support File System Access API or if picker failed
                    XLSX.writeFile(wb, fileName);
                }

                setExportProgress(100);

                if (onSuccess) {
                    onSuccess(data.data.length);
                }
            } else {
                if (onError) {
                    onError('No data to export');
                }
            }
        } catch (err) {
            console.error('Error exporting to Excel:', err);
            if (onError) {
                onError(err.message || 'Export failed');
            }
        } finally {
            // Reset state after a short delay to show 100% progress
            setTimeout(() => {
                setIsExporting(false);
                setExportProgress(0);
            }, 500);
        }
    };

    return {
        isExporting,
        exportProgress,
        exportData
    };
};
