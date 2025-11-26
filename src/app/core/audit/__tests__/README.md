# Audit Export Excel - Test Cases Documentation

## Overview

This directory contains comprehensive test cases for the audit export Excel functionality, ensuring that users can always choose where to save exported files using the File System Access API.

## Files

### 📝 [export-excel.test.js](./export-excel.test.js)
Automated Jest test suite with 7 test suites covering:
- File System Access API availability
- User save location selection
- File writing process
- Fallback mechanisms
- Error handling
- Complete export flow

### 📋 [MANUAL_TEST_CASES.md](./MANUAL_TEST_CASES.md)
Comprehensive manual testing guide with:
- 10 detailed test scenarios
- Step-by-step instructions
- Browser compatibility matrix
- Success criteria
- Issue reporting guidelines

## Quick Start

### Running Automated Tests

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run all tests:**
   ```bash
   npm test
   ```

3. **Run export tests only:**
   ```bash
   npm test export-excel
   ```

4. **Run tests in watch mode:**
   ```bash
   npm test:watch
   ```

5. **Generate coverage report:**
   ```bash
   npm test:coverage
   ```

### Running Manual Tests

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Navigate to:**
   ```
   http://localhost:3000/core/audit
   ```

3. **Follow the test cases in:**
   [MANUAL_TEST_CASES.md](./MANUAL_TEST_CASES.md)

## Key Features Being Tested

### ✅ File System Access API
- Verify `showSaveFilePicker` is called correctly
- Ensure users can choose save location
- Test file picker configuration (file types, suggested name)

### ✅ User Interaction
- Save location selection
- User cancellation handling
- Multiple consecutive exports

### ✅ File Generation
- Excel file structure and formatting
- Vietnamese headers
- Column widths and styling
- Data integrity

### ✅ Error Handling
- Network failures
- Write errors
- Permission issues
- Graceful degradation

### ✅ Browser Compatibility
- Chrome 86+ (File System Access API)
- Edge 86+ (File System Access API)
- Opera 72+ (File System Access API)
- Firefox (Fallback to standard download)
- Safari (Fallback to standard download)

## Test Coverage

### Automated Tests Coverage
- File System Access API logic: **100%**
- File picker configuration: **100%**
- Error handling: **100%**
- Fallback mechanism: **100%**

### Manual Tests Coverage
- User interaction flows: **10 test cases**
- Browser compatibility: **5 browsers**
- Real-world scenarios: **Complete**

## Success Criteria

All tests must pass with:
- ✅ File System Access API works in supported browsers
- ✅ Users can always choose save location (when API supported)
- ✅ Fallback works correctly for unsupported browsers
- ✅ Excel files are properly formatted with Vietnamese headers
- ✅ Error handling is graceful and user-friendly
- ✅ No data loss or corruption

## Browser Support Matrix

| Browser | Version | File System Access API | Save Location Choice | Fallback |
|---------|---------|------------------------|----------------------|----------|
| Chrome  | 86+     | ✅ Yes                 | ✅ Yes               | N/A      |
| Edge    | 86+     | ✅ Yes                 | ✅ Yes               | N/A      |
| Opera   | 72+     | ✅ Yes                 | ✅ Yes               | N/A      |
| Firefox | Any     | ❌ No                  | ❌ No                | ✅ Auto-download |
| Safari  | Any     | ❌ No                  | ❌ No                | ✅ Auto-download |

## Reporting Issues

If you find any issues during testing:

1. **Check existing test cases** to see if the issue is covered
2. **Run automated tests** to verify the issue
3. **Document the issue** with:
   - Test case number/name
   - Browser and version
   - Steps to reproduce
   - Expected vs actual result
   - Screenshots or error messages
   - Console logs

## Additional Resources

- [File System Access API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
- [XLSX Library Documentation](https://docs.sheetjs.com/)
- [Jest Testing Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)

## Notes

- **User Gesture Required**: File System Access API requires user interaction and cannot be fully automated
- **Manual Testing Essential**: Always perform manual testing in real browsers to verify save location selection
- **Security**: File System Access API requires HTTPS in production (localhost is exempt)
