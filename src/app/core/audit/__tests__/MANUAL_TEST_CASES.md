/**
 * Manual Test Cases for Audit Export Excel
 * 
 * These test cases should be executed manually in a browser to verify
 * the File System Access API and save location selection functionality.
 */

# Manual Test Cases - Audit Export Excel

## Prerequisites
- Modern browser (Chrome 86+, Edge 86+, or Opera 72+)
- Application running on localhost
- At least 1 audit log record in the database

---

## Test Case 1: File System Access API - Save Location Selection

### Objective
Verify that users can always choose where to save the exported Excel file.

### Steps
1. Navigate to the Audit Logs page (`/core/audit`)
2. Click the "Export Excel" button
3. In the dialog, enter filename: `test_audit_export`
4. Click "Export" button
5. **VERIFY**: Browser's native "Save As" dialog appears
6. **VERIFY**: Dialog shows suggested filename: `test_audit_export.xlsx`
7. **VERIFY**: You can navigate to different folders
8. Select a specific folder (e.g., Desktop or Documents)
9. Click "Save" in the browser dialog
10. **VERIFY**: Progress bar shows export progress (0% → 100%)
11. **VERIFY**: Success message appears: "Xuất file thành công! Đã xuất X bản ghi."
12. **VERIFY**: File is saved in the selected location
13. Open the Excel file
14. **VERIFY**: File contains audit log data with Vietnamese headers

### Expected Results
✅ Native browser "Save As" dialog appears
✅ User can choose any folder location
✅ File is saved to the selected location
✅ Excel file contains correct data

---

## Test Case 2: User Cancels File Selection

### Objective
Verify graceful handling when user cancels the save dialog.

### Steps
1. Navigate to the Audit Logs page
2. Click "Export Excel" button
3. Enter filename: `cancelled_export`
4. Click "Export" button
5. When browser's "Save As" dialog appears, click "Cancel"
6. **VERIFY**: No error message appears
7. **VERIFY**: Export dialog closes
8. **VERIFY**: No file is created
9. **VERIFY**: Page remains functional

### Expected Results
✅ No errors when user cancels
✅ Application remains in working state
✅ User can retry export

---

## Test Case 3: Different File Locations

### Objective
Verify file can be saved to various locations.

### Steps
1. Navigate to the Audit Logs page
2. Click "Export Excel" button
3. Test saving to different locations:
   - **Test 3.1**: Save to Desktop
   - **Test 3.2**: Save to Documents
   - **Test 3.3**: Save to Downloads
   - **Test 3.4**: Save to a custom folder
   - **Test 3.5**: Save to a network drive (if available)

For each location:
- Enter unique filename (e.g., `audit_desktop`, `audit_documents`)
- Click "Export"
- Select the target location in browser dialog
- Click "Save"
- **VERIFY**: File appears in selected location

### Expected Results
✅ File can be saved to any accessible location
✅ Each file is saved to its respective location
✅ All files contain correct data

---

## Test Case 4: Filename Validation

### Objective
Verify filename handling and .xlsx extension.

### Steps
1. Navigate to the Audit Logs page
2. Test different filename scenarios:

   **Test 4.1**: Filename without extension
   - Enter: `my_audit_logs`
   - **VERIFY**: Browser suggests: `my_audit_logs.xlsx`

   **Test 4.2**: Filename with .xlsx extension
   - Enter: `my_audit_logs.xlsx`
   - **VERIFY**: Browser suggests: `my_audit_logs.xlsx`

   **Test 4.3**: Empty filename
   - Leave filename empty
   - Click "Export"
   - **VERIFY**: Alert appears: "Vui lòng nhập tên file"

   **Test 4.4**: Special characters in filename
   - Enter: `audit_logs_2025-11-25`
   - **VERIFY**: Filename is accepted

### Expected Results
✅ .xlsx extension is automatically added
✅ Empty filename is rejected
✅ Valid filenames are accepted

---

## Test Case 5: Export with Filters Applied

### Objective
Verify export works correctly with filtered data.

### Steps
1. Navigate to the Audit Logs page
2. Apply filters:
   - Action: "CREATE"
   - Date Range: "Last 7 Days"
3. Click "Export Excel" button
4. Enter filename: `filtered_audit_logs`
5. Click "Export"
6. Select save location
7. Click "Save"
8. **VERIFY**: Export completes successfully
9. Open the Excel file
10. **VERIFY**: File contains only filtered records
11. **VERIFY**: Record count matches the filtered view

### Expected Results
✅ Export respects applied filters
✅ Only filtered data is exported
✅ Record count is accurate

---

## Test Case 6: Large Dataset Export

### Objective
Verify export works with large datasets.

### Prerequisites
- Database with 100+ audit log records

### Steps
1. Navigate to the Audit Logs page
2. Remove all filters (select "All Time", "All Actions", etc.)
3. Click "Export Excel" button
4. Enter filename: `large_audit_export`
5. Click "Export"
6. **VERIFY**: Progress bar updates smoothly (10% → 30% → 60% → 80% → 90% → 100%)
7. Select save location and save
8. **VERIFY**: Export completes without errors
9. Open the Excel file
10. **VERIFY**: All records are present
11. **VERIFY**: File size is reasonable
12. **VERIFY**: Excel opens without performance issues

### Expected Results
✅ Large datasets export successfully
✅ Progress bar provides feedback
✅ No timeout or memory errors
✅ Excel file is properly formatted

---

## Test Case 7: Fallback to Standard Download (Unsupported Browser)

### Objective
Verify fallback mechanism for browsers without File System Access API.

### Prerequisites
- Browser without File System Access API support (Firefox, Safari)
- OR disable the API in Chrome DevTools

### Steps to Disable API in Chrome (for testing):
1. Open Chrome DevTools (F12)
2. Go to Console
3. Run: `delete window.showSaveFilePicker`

### Test Steps
1. Navigate to the Audit Logs page
2. Click "Export Excel" button
3. Enter filename: `fallback_export`
4. Click "Export"
5. **VERIFY**: File downloads automatically to default Downloads folder
6. **VERIFY**: No "Save As" dialog appears
7. **VERIFY**: File is named correctly
8. Check Downloads folder
9. **VERIFY**: File exists and contains correct data

### Expected Results
✅ Export works without File System Access API
✅ File downloads to default location
✅ Data is correct

---

## Test Case 8: Excel File Content Validation

### Objective
Verify exported Excel file structure and content.

### Steps
1. Export an audit log file (any method from previous tests)
2. Open the Excel file in Microsoft Excel or Google Sheets
3. **VERIFY**: Headers are in Vietnamese:
   - Column A: "Thời gian"
   - Column B: "Người dùng"
   - Column C: "Hành động"
   - Column D: "Tài nguyên"
   - Column E: "Địa chỉ IP"
   - Column F: "Chi tiết"
4. **VERIFY**: Header row has styling (bold, colored background, centered)
5. **VERIFY**: Column widths are appropriate for content
6. **VERIFY**: Data rows contain correct information
7. **VERIFY**: Timestamps are formatted correctly
8. **VERIFY**: No truncated data

### Expected Results
✅ Headers are in Vietnamese
✅ Headers are styled (bold, colored)
✅ Columns are properly sized
✅ All data is complete and accurate

---

## Test Case 9: Multiple Consecutive Exports

### Objective
Verify multiple exports work correctly.

### Steps
1. Navigate to the Audit Logs page
2. Export file 1:
   - Filename: `export_1`
   - Save to Desktop
3. Immediately export file 2:
   - Filename: `export_2`
   - Save to Documents
4. Export file 3:
   - Filename: `export_3`
   - Save to Downloads
5. **VERIFY**: All three exports complete successfully
6. **VERIFY**: Each file is in its respective location
7. **VERIFY**: No conflicts or errors

### Expected Results
✅ Multiple exports work consecutively
✅ Each file is saved correctly
✅ No performance degradation

---

## Test Case 10: Export During Network Issues

### Objective
Verify error handling when network fails during export.

### Steps
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Set throttling to "Offline" AFTER clicking Export but BEFORE data loads
4. Navigate to Audit Logs page
5. Click "Export Excel"
6. Enter filename: `network_test`
7. Click "Export"
8. Immediately set Network to "Offline" in DevTools
9. **VERIFY**: Error message appears: "Xuất file thất bại. Vui lòng thử lại."
10. **VERIFY**: Loading overlay disappears
11. Set Network back to "Online"
12. Click "Export Excel" again
13. **VERIFY**: Export works correctly

### Expected Results
✅ Network errors are handled gracefully
✅ User receives clear error message
✅ Can retry after network is restored

---

## Browser Compatibility Matrix

Test the export functionality on different browsers:

| Browser | Version | File System Access API | Expected Behavior |
|---------|---------|------------------------|-------------------|
| Chrome  | 86+     | ✅ Supported           | Save dialog appears |
| Edge    | 86+     | ✅ Supported           | Save dialog appears |
| Opera   | 72+     | ✅ Supported           | Save dialog appears |
| Firefox | Any     | ❌ Not supported       | Auto-download to Downloads |
| Safari  | Any     | ❌ Not supported       | Auto-download to Downloads |

### Test Steps
1. Open application in each browser
2. Perform basic export test (Test Case 1)
3. Document results in the matrix above
4. Verify appropriate behavior for each browser

---

## Success Criteria

All test cases should pass with the following criteria:
- ✅ File System Access API is used when available
- ✅ Users can always choose save location (when API supported)
- ✅ Fallback works correctly for unsupported browsers
- ✅ Error handling is graceful and user-friendly
- ✅ Excel files are properly formatted
- ✅ Data integrity is maintained
- ✅ Performance is acceptable for large datasets

---

## Reporting Issues

If any test case fails, report with:
1. Test case number and name
2. Browser and version
3. Steps to reproduce
4. Expected vs actual result
5. Screenshots or error messages
6. Console logs (if applicable)
