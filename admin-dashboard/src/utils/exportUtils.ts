/* eslint-disable @typescript-eslint/no-unused-vars */
// src/utils/exportUtils.ts
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GridColDef } from '@mui/x-data-grid';

/**
 * Format a value for export based on its type and field name
 */
const formatValueForExport = (value: any, field: string): string => {
  // Handle date fields specifically
  if (field === 'createdAt' || field.includes('Date')) {
    if (value) {
      try {
        // Try to parse as date
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleString();
        }
      } catch (e) {
        // If parsing fails, return the original value
        return value;
      }
    }
    return value || '';
  }
  
  // For other fields, just convert to string
  return value !== null && value !== undefined ? String(value) : '';
};

/**
 * A helper function to prepare data for export.
 * It takes the raw data array and the column definitions, and returns:
 * - The headers as an array of strings.
 * - The body as an array of arrays of strings.
 */
const prepareDataForExport = (data: any[], columns: GridColDef[]) => {
  const exportableColumns = columns.filter(col => col.field !== 'actions' && !col.hide); // Exclude actions column

  const headers = exportableColumns.map(col => col.headerName || col.field);
  
  const body = data.map(row => {
    return exportableColumns.map(col => {
      // Format the value based on its type and field name
      return formatValueForExport(row[col.field], col.field);
    });
  });

  return { headers, body };
};

/**
 * Exports data to a CSV file.
 */
export const exportToCsv = (data: any[], columns: GridColDef[], filename: string) => {
  const { headers, body } = prepareDataForExport(data, columns);
  const worksheetData = [headers, ...body];
  
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // We're using the xlsx library to generate the CSV content and then creating a download link.
  // This is a more modern approach than trying to use writeFile for CSV.
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};


/**
 * Exports data to an XLSX (Excel) file.
 */
export const exportToXlsx = (data: any[], columns: GridColDef[], filename: string) => {
    const { headers, body } = prepareDataForExport(data, columns);
    const worksheetData = [headers, ...body];
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * Exports data to a PDF document.
 */
export const exportToPdf = (data: any[], columns: GridColDef[], title: string) => {
  const doc = new jsPDF();
  const { headers, body } = prepareDataForExport(data, columns);

  // Apply the autoTable plugin
  autoTable(doc, {
    head: [headers],
    body: body,
    startY: 20, // Give some space for a title
    didDrawPage: (data: any) => {
        // Add a title to each page
        doc.text(title, 14, 15);
    }
  });

  doc.save(`${title}.pdf`);
};