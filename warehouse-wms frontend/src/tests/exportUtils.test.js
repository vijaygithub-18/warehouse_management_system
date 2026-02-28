import { describe, it, expect, vi } from 'vitest';
import { exportToExcel, exportToCSV, exportToPDF } from '../utils/exportUtils';

describe('Export Functionality Tests', () => {
  const testData = [
    { id: 1, name: 'Paper Cups', code: 'PC', description: 'Disposable cups' },
    { id: 2, name: 'Plastic Plates', code: 'PP', description: 'Reusable plates' },
    { id: 3, name: 'Cutlery', code: 'CT', description: 'Forks and spoons' }
  ];

  describe('exportToExcel', () => {
    it('should return success with valid data', () => {
      const result = exportToExcel(testData, 'test-categories');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Excel file downloaded successfully');
    });

    it('should return error with empty data', () => {
      const result = exportToExcel([], 'test-categories');
      expect(result.success).toBe(false);
      expect(result.message).toBe('No data to export');
    });

    it('should return error with null data', () => {
      const result = exportToExcel(null, 'test-categories');
      expect(result.success).toBe(false);
      expect(result.message).toBe('No data to export');
    });
  });

  describe('exportToCSV', () => {
    it('should return success with valid data', () => {
      const result = exportToCSV(testData, 'test-categories');
      expect(result.success).toBe(true);
      expect(result.message).toBe('CSV file downloaded successfully');
    });

    it('should return error with empty data', () => {
      const result = exportToCSV([], 'test-categories');
      expect(result.success).toBe(false);
      expect(result.message).toBe('No data to export');
    });
  });

  describe('exportToPDF', () => {
    it('should return success with valid data', () => {
      const result = exportToPDF(testData, 'test-categories', 'Categories List');
      expect(result.success).toBe(true);
      expect(result.message).toBe('PDF file downloaded successfully');
    });

    it('should return error with empty data', () => {
      const result = exportToPDF([], 'test-categories', 'Categories List');
      expect(result.success).toBe(false);
      expect(result.message).toBe('No data to export');
    });
  });
});
