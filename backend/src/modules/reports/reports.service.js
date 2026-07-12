import fs from 'fs';
import path from 'path';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import * as repo from './reports.repository.js';
import { createNotification as centralCreateNotification } from '../notifications/notifications.service.js';

// Ensure public/exports directory exists
const EXPORTS_DIR = path.join(process.cwd(), 'public', 'exports');
if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}

export const getAssetReport = async (filters) => repo.getAssetReportData(filters);
export const getMaintenanceReport = async (filters) => repo.getMaintenanceReportData(filters);
export const getAuditReport = async (filters) => repo.getAuditReportData(filters);
export const getBookingReport = async (filters) => repo.getBookingReportData(filters);
export const getExpenseReport = async (filters) => repo.getExpenseReportData(filters);
export const getReportHistory = async () => repo.getReportHistory();

// Helper to fetch report raw dataset depending on report type
const getReportRawDataset = async (type, filters) => {
  switch (type) {
    case 'ASSET_REPORT': {
      const res = await repo.getAssetReportData(filters);
      return res.data.map(item => ({
        'Asset Tag': item.asset_tag,
        'Asset Name': item.name,
        'Manufacturer': item.manufacturer || '—',
        'Model': item.model || '—',
        'Serial Number': item.serial_number || '—',
        'Status': item.status,
        'Purchase Cost ($)': item.acquisition_cost,
        'Purchase Date': item.acquisition_date ? new Date(item.acquisition_date).toLocaleDateString() : '—',
        'Location': item.current_location || '—',
        'Category': item.category_name || '—',
        'Department': item.department_name || '—'
      }));
    }
    case 'MAINTENANCE_REPORT': {
      const res = await repo.getMaintenanceReportData(filters);
      return res.data.map(item => ({
        'Asset Name': item.asset_name,
        'Asset Tag': item.asset_tag,
        'Description': item.description,
        'Priority': item.priority,
        'Status': item.status,
        'Est. Cost ($)': item.estimated_cost,
        'Actual Cost ($)': item.actual_cost,
        'Completed Date': item.completed_date ? new Date(item.completed_date).toLocaleDateString() : '—'
      }));
    }
    case 'AUDIT_REPORT': {
      const res = await repo.getAuditReportData();
      return res.data.map(item => ({
        'Audit Code': item.audit_code,
        'Audit Name': item.audit_name,
        'Status': item.status,
        'Audit Type': item.audit_type,
        'Start Date': item.start_date ? new Date(item.start_date).toLocaleDateString() : '—',
        'End Date': item.end_date ? new Date(item.end_date).toLocaleDateString() : '—',
        'Total Assets': item.total_assets,
        'Verified': item.verified,
        'Missing': item.missing,
        'Damaged': item.damaged,
        'Relocated': item.relocated
      }));
    }
    case 'BOOKING_REPORT': {
      const res = await repo.getBookingReportData();
      return res.data.map(item => ({
        'Asset Name': item.asset_name,
        'Asset Tag': item.asset_tag,
        'Employee': item.employee_name,
        'Start Time': new Date(item.start_time).toLocaleString(),
        'End Time': new Date(item.end_time).toLocaleString(),
        'Purpose': item.purpose,
        'Status': item.status
      }));
    }
    case 'EXPENSE_REPORT': {
      const res = await repo.getExpenseReportData();
      return [
        { 'Expense Category': 'Physical Assets Purchase', 'Cost ($)': res.purchase_cost },
        { 'Expense Category': 'Maintenance & Service Requests', 'Cost ($)': res.maintenance_cost },
        { 'Expense Category': 'Total Cumulative Operational Spend', 'Cost ($)': res.total_expense }
      ];
    }
    default:
      throw new Error('Unsupported report type');
  }
};

// ─── Export CSV ───────────────────────────────────────────────────────────────
export const exportCSV = async (type, filters, userId) => {
  const data = await getReportRawDataset(type, filters || {});
  const parser = new Parser();
  const csv = parser.parse(data);

  const timestamp = Date.now();
  const fileName = `${type.toLowerCase()}_report_${timestamp}.csv`;
  const filePath = path.join(EXPORTS_DIR, fileName);

  fs.writeFileSync(filePath, csv);

  // Save in history logs
  await repo.saveReportHistory({
    userId,
    reportType: type,
    fileFormat: 'CSV',
    filters,
    fileName
  });

  // Trigger Notification
  await centralCreateNotification(userId, {
    title: 'CSV Export Completed',
    message: `${type.replace('_', ' ')} report has been exported to CSV format successfully.`,
    category: 'REPORT',
    priority: 'MEDIUM',
    actionUrl: `/exports/${fileName}`,
    actionLabel: 'Download CSV'
  });

  return {
    fileName,
    downloadUrl: `/exports/${fileName}`
  };
};

// ─── Export PDF ───────────────────────────────────────────────────────────────
export const exportPDF = async (type, filters, userId) => {
  const dataset = await getReportRawDataset(type, filters || {});
  
  const timestamp = Date.now();
  const fileName = `${type.toLowerCase()}_report_${timestamp}.pdf`;
  const filePath = path.join(EXPORTS_DIR, fileName);

  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // 1. Report Title & Header
  doc.fontSize(18).text('AssetFlow Enterprise Report Sheet', { align: 'center' });
  doc.fontSize(11).text(`Report Type: ${type.replace('_', ' ')}`, { align: 'center' });
  doc.text(`Generated On: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown(1.5);

  // 2. Report Details Summary Block
  doc.fontSize(13).text('Summary Metadata', { underline: true });
  doc.fontSize(10).text(`Total Records Extracted: ${dataset.length}`);
  doc.moveDown(1);

  // 3. Grid Table Details
  doc.fontSize(13).text('Operational Data Grid', { underline: true });
  doc.moveDown(0.5);

  if (dataset.length === 0) {
    doc.fontSize(10).text('No records match query parameters.');
  } else {
    // Extract headers from keys
    const headers = Object.keys(dataset[0]);
    
    // Draw simple column header row
    const startX = doc.x;
    let currentY = doc.y;
    const colWidth = 500 / headers.length;

    doc.font('Helvetica-Bold').fontSize(8);
    headers.forEach((h, i) => {
      doc.text(h, startX + (i * colWidth), currentY, { width: colWidth - 5, truncate: true });
    });
    
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(7.5);
    
    // Draw rows
    dataset.forEach((row) => {
      currentY = doc.y;
      // Page wrapping check
      if (currentY > 700) {
        doc.addPage();
        currentY = doc.y;
        
        // Re-draw headers on new page
        doc.font('Helvetica-Bold').fontSize(8);
        headers.forEach((h, i) => {
          doc.text(h, startX + (i * colWidth), currentY, { width: colWidth - 5, truncate: true });
        });
        doc.moveDown(0.5);
        currentY = doc.y;
        doc.font('Helvetica').fontSize(7.5);
      }

      headers.forEach((h, i) => {
        const cellVal = String(row[h] ?? '');
        doc.text(cellVal, startX + (i * colWidth), currentY, { width: colWidth - 5, truncate: true });
      });
      doc.moveDown(0.5);
    });
  }

  doc.end();

  // Return a promise that resolves when stream completes writing
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  // Save history
  await repo.saveReportHistory({
    userId,
    reportType: type,
    fileFormat: 'PDF',
    filters,
    fileName
  });

  // Trigger Notification
  await centralCreateNotification(userId, {
    title: 'PDF Export Completed',
    message: `${type.replace('_', ' ')} report has been exported to PDF format successfully.`,
    category: 'REPORT',
    priority: 'MEDIUM',
    actionUrl: `/exports/${fileName}`,
    actionLabel: 'Download PDF'
  });

  return {
    fileName,
    downloadUrl: `/exports/${fileName}`
  };
};
