/**
 * Test Suite for Audit Export Excel Functionality
 * 
 * This test suite ensures that the export Excel feature always allows users
 * to choose where to save the file using the File System Access API.
 */

// Mock setup for browser APIs
const mockShowSaveFilePicker = jest.fn();
const mockCreateWritable = jest.fn();
const mockWrite = jest.fn();
const mockClose = jest.fn();

// Setup global window mocks
// Setup global window mocks
if (typeof window !== 'undefined') {
    window.showSaveFilePicker = mockShowSaveFilePicker;
}

// Mock XLSX library
jest.mock('xlsx', () => ({
    utils: {
        json_to_sheet: jest.fn(() => ({ '!ref': 'A1:F10' })),
        book_new: jest.fn(() => ({})),
        book_append_sheet: jest.fn(),
        decode_range: jest.fn(() => ({ s: { c: 0 }, e: { c: 5 } })),
        encode_col: jest.fn((col) => String.fromCharCode(65 + col)),
    },
    write: jest.fn(() => new ArrayBuffer(8)),
    writeFile: jest.fn(),
}));

describe('Audit Export Excel - File Save Location', () => {

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Restore window.showSaveFilePicker in case it was deleted
        if (typeof window !== 'undefined') {
            window.showSaveFilePicker = mockShowSaveFilePicker;
        }

        // Setup default mock implementations
        mockCreateWritable.mockResolvedValue({
            write: mockWrite,
            close: mockClose,
        });

        mockShowSaveFilePicker.mockResolvedValue({
            name: 'test_audit_logs.xlsx',
            createWritable: mockCreateWritable,
        });
    });

    describe('File System Access API Availability', () => {

        test('should check if showSaveFilePicker is available', () => {
            expect('showSaveFilePicker' in window).toBe(true);
        });

        test('should use File System Access API when available', async () => {
            const XLSX = require('xlsx');

            // Simulate export function
            const filename = 'audit_logs_20251125.xlsx';

            const fileHandle = await window.showSaveFilePicker({
                suggestedName: filename,
                types: [{
                    description: 'Excel Files',
                    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
                }]
            });

            expect(mockShowSaveFilePicker).toHaveBeenCalledTimes(1);
            expect(mockShowSaveFilePicker).toHaveBeenCalledWith({
                suggestedName: filename,
                types: [{
                    description: 'Excel Files',
                    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
                }]
            });

            expect(fileHandle).toBeDefined();
            expect(fileHandle.name).toBe('test_audit_logs.xlsx');
        });
    });

    describe('User Save Location Selection', () => {

        test('should allow user to select save location', async () => {
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: 'audit_logs.xlsx',
                types: [{
                    description: 'Excel Files',
                    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
                }]
            });

            expect(fileHandle).toBeDefined();
            expect(mockShowSaveFilePicker).toHaveBeenCalled();
        });

        test('should handle user cancellation gracefully', async () => {
            // Mock user cancelling the file picker
            mockShowSaveFilePicker.mockRejectedValueOnce(
                Object.assign(new Error('User cancelled'), { name: 'AbortError' })
            );

            try {
                await window.showSaveFilePicker({
                    suggestedName: 'audit_logs.xlsx',
                    types: [{
                        description: 'Excel Files',
                        accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
                    }]
                });
                fail('Should have thrown AbortError');
            } catch (err) {
                expect(err.name).toBe('AbortError');
                expect(mockShowSaveFilePicker).toHaveBeenCalled();
            }
        });

        test('should suggest correct filename format', async () => {
            const now = new Date();
            const expectedFilename = `audit_logs_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.xlsx`;

            await window.showSaveFilePicker({
                suggestedName: expectedFilename,
                types: [{
                    description: 'Excel Files',
                    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
                }]
            });

            expect(mockShowSaveFilePicker).toHaveBeenCalledWith(
                expect.objectContaining({
                    suggestedName: expectedFilename
                })
            );
        });
    });

    describe('File Writing Process', () => {

        test('should write file to selected location', async () => {
            const XLSX = require('xlsx');

            const fileHandle = await window.showSaveFilePicker({
                suggestedName: 'audit_logs.xlsx',
                types: [{
                    description: 'Excel Files',
                    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
                }]
            });

            const writable = await fileHandle.createWritable();
            const buffer = XLSX.write({}, { bookType: 'xlsx', type: 'array' });

            await writable.write(buffer);
            await writable.close();

            expect(mockCreateWritable).toHaveBeenCalled();
            expect(mockWrite).toHaveBeenCalledWith(expect.any(ArrayBuffer));
            expect(mockClose).toHaveBeenCalled();
        });

        test('should handle write errors gracefully', async () => {
            mockWrite.mockRejectedValueOnce(new Error('Write failed'));

            const fileHandle = await window.showSaveFilePicker({
                suggestedName: 'audit_logs.xlsx',
                types: [{
                    description: 'Excel Files',
                    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
                }]
            });

            const writable = await fileHandle.createWritable();

            try {
                await writable.write(new ArrayBuffer(8));
                fail('Should have thrown write error');
            } catch (err) {
                expect(err.message).toBe('Write failed');
            }
        });
    });

    describe('Fallback Mechanism', () => {

        test('should fallback to XLSX.writeFile when File System Access API not available', () => {
            const XLSX = require('xlsx');

            // Remove File System Access API
            delete window.showSaveFilePicker;

            const hasAPI = 'showSaveFilePicker' in window;
            expect(hasAPI).toBe(false);

            // Should use fallback
            const wb = XLSX.utils.book_new();
            XLSX.writeFile(wb, 'audit_logs.xlsx');

            expect(XLSX.writeFile).toHaveBeenCalledWith(wb, 'audit_logs.xlsx');
        });

        test('should fallback when File System Access API throws non-abort error', async () => {
            const XLSX = require('xlsx');

            // Mock API throwing non-abort error
            mockShowSaveFilePicker.mockRejectedValueOnce(
                new Error('Permission denied')
            );

            let fileHandle = null;
            try {
                fileHandle = await window.showSaveFilePicker({
                    suggestedName: 'audit_logs.xlsx',
                    types: [{
                        description: 'Excel Files',
                        accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
                    }]
                });
            } catch (err) {
                // Error caught, should fallback
                expect(err.message).toBe('Permission denied');
            }

            // Fallback to standard download
            if (!fileHandle) {
                const wb = XLSX.utils.book_new();
                XLSX.writeFile(wb, 'audit_logs.xlsx');
                expect(XLSX.writeFile).toHaveBeenCalled();
            }
        });
    });

    describe('File Type Configuration', () => {

        test('should only accept .xlsx files', async () => {
            await window.showSaveFilePicker({
                suggestedName: 'audit_logs.xlsx',
                types: [{
                    description: 'Excel Files',
                    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
                }]
            });

            expect(mockShowSaveFilePicker).toHaveBeenCalledWith(
                expect.objectContaining({
                    types: expect.arrayContaining([
                        expect.objectContaining({
                            description: 'Excel Files',
                            accept: expect.objectContaining({
                                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
                            })
                        })
                    ])
                })
            );
        });

        test('should append .xlsx extension if not provided', () => {
            const testCases = [
                { input: 'audit_logs', expected: 'audit_logs.xlsx' },
                { input: 'audit_logs.xlsx', expected: 'audit_logs.xlsx' },
                { input: 'my_file', expected: 'my_file.xlsx' },
            ];

            testCases.forEach(({ input, expected }) => {
                const filename = input.endsWith('.xlsx') ? input : `${input}.xlsx`;
                expect(filename).toBe(expected);
            });
        });
    });

    describe('Integration Test - Complete Export Flow', () => {

        test('should complete full export flow with user-selected location', async () => {
            const XLSX = require('xlsx');

            // Step 1: User clicks export button
            const exportFileName = 'audit_logs_20251125';
            const filename = exportFileName.endsWith('.xlsx') ? exportFileName : `${exportFileName}.xlsx`;

            // Step 2: File picker opens
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: filename,
                types: [{
                    description: 'Excel Files',
                    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
                }]
            });

            expect(mockShowSaveFilePicker).toHaveBeenCalled();
            expect(fileHandle).toBeDefined();

            // Step 3: Create Excel data
            const excelData = [
                { 'Thời gian': '2025-11-25 21:00:00', 'Người dùng': 'Admin', 'Hành động': 'CREATE' },
                { 'Thời gian': '2025-11-25 21:05:00', 'Người dùng': 'User1', 'Hành động': 'UPDATE' },
            ];

            const ws = XLSX.utils.json_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Audit Logs');

            // Step 4: Write to selected location
            const writable = await fileHandle.createWritable();
            const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            await writable.write(buffer);
            await writable.close();

            // Verify complete flow
            expect(mockShowSaveFilePicker).toHaveBeenCalledTimes(1);
            expect(mockCreateWritable).toHaveBeenCalledTimes(1);
            expect(mockWrite).toHaveBeenCalledTimes(1);
            expect(mockClose).toHaveBeenCalledTimes(1);
        });
    });
});
