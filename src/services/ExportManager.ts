import * as XLSX from 'xlsx';
import QRCode from 'qrcode';
import { StorageManager } from './StorageManager';
import { AuditManager } from './AuditManager';
import { Utils } from '../utils/Utils';

export class ExportManager {
  /**
   * Export Professional Excel (.xlsx) with 3 Sheets:
   * Sheet 1: Rekap Audit Harian
   * Sheet 2: Detail Barang Terjual
   * Sheet 3: Inventory / Stok Gudang
   */
  static exportExcel(): void {
    const workbook = XLSX.utils.book_new();

    // --- SHEET 1: REKAP AUDIT HARIAN ---
    const auditSessions = StorageManager.getAuditSessions();
    const sheet1Data = auditSessions.map((s) => ({
      'Tanggal Audit': Utils.formatDateIndonesian(s.date),
      'Modal Awal': s.modalAwal,
      'Total Omzet': s.totalOmzet,
      'Total Profit': s.totalProfit,
      'Uang Seharusnya': s.uangSeharusnya,
      'Uang Fisik Laci': s.uangFisik,
      'Selisih Kas': s.selisih,
      'Status Audit': s.status,
      Catatan: s.notes || '-',
    }));

    if (sheet1Data.length === 0) {
      // Add current day live rekap if no closed session exists
      const rekapToday = AuditManager.getRekapHarian();
      sheet1Data.push({
        'Tanggal Audit': Utils.formatDateIndonesian(rekapToday.date) + ' (Aktif)',
        'Modal Awal': rekapToday.modalAwal,
        'Total Omzet': rekapToday.totalOmzet,
        'Total Profit': rekapToday.totalProfit,
        'Uang Seharusnya': rekapToday.uangSeharusnya,
        'Uang Fisik Laci': 0,
        'Selisih Kas': 0,
        'Status Audit': 'BELUM_TUTUP',
        Catatan: 'Proses Audit Berjalan',
      });
    }

    const worksheet1 = XLSX.utils.json_to_sheet(sheet1Data);
    // Set Column Widths for Sheet 1
    worksheet1['!cols'] = [
      { wch: 22 }, // Tanggal
      { wch: 16 }, // Modal
      { wch: 16 }, // Omzet
      { wch: 16 }, // Profit
      { wch: 18 }, // Uang Seharusnya
      { wch: 18 }, // Uang Fisik
      { wch: 16 }, // Selisih
      { wch: 16 }, // Status
      { wch: 25 }, // Catatan
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet1, 'Rekap Audit Harian');

    // --- SHEET 2: DETAIL BARANG TERJUAL ---
    const soldHistory = StorageManager.getSoldHistory();
    const sheet2Data = soldHistory.map((item) => ({
      Tanggal: item.dateOnly,
      Jam: item.timeOnly,
      'Nama Barang': item.itemName,
      'Qty Terjual': item.qtySold,
      'Modal Satuan': item.modalSatuan,
      'Harga Jual': item.hargaJual,
      'Total Omzet': item.omzet,
      'Total Profit': item.profit,
      'Sisa Stok Fisik': item.sisaFisik,
    }));

    const worksheet2 = XLSX.utils.json_to_sheet(
      sheet2Data.length > 0
        ? sheet2Data
        : [{ Tanggal: '-', Jam: '-', 'Nama Barang': 'Belum ada transaksi', 'Qty Terjual': 0 }]
    );
    worksheet2['!cols'] = [
      { wch: 14 },
      { wch: 10 },
      { wch: 30 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 16 },
      { wch: 16 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet2, 'Detail Barang Terjual');

    // --- SHEET 3: INVENTORY STOK GUDANG ---
    const inventory = StorageManager.getInventory();
    const sheet3Data = inventory.map((i) => ({
      'Nama Barang': i.name,
      Stok: i.stock,
      'Harga Modal / Pcs': i.modalSatuan,
      'Harga Jual / Pcs': i.hargaJual,
      'Profit / Pcs': i.hargaJual - i.modalSatuan,
      'Potensi Profit Total': i.potensiProfit,
      'Tanggal Ditambahkan': Utils.formatDateIndonesian(i.createdAt),
    }));

    const worksheet3 = XLSX.utils.json_to_sheet(sheet3Data);
    worksheet3['!cols'] = [
      { wch: 32 },
      { wch: 10 },
      { wch: 18 },
      { wch: 18 },
      { wch: 16 },
      { wch: 22 },
      { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet3, 'Inventory');

    // Trigger Download
    const fileName = `Audit_Warung_Report_${Utils.getTodayDateString()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Export CSV format for Inventory
   */
  static exportCSV(): void {
    const inventory = StorageManager.getInventory();
    const worksheet = XLSX.utils.json_to_sheet(inventory);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Inventory_Warung_${Utils.getTodayDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Download JSON Backup
   */
  static exportJSON(): void {
    const jsonStr = StorageManager.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Backup_Audit_Warung_${Utils.getTodayDateString()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Generate QR Code Data URL for instant daily audit summary sharing
   */
  static async generateAuditQRCode(summaryText: string): Promise<string> {
    try {
      return await QRCode.toDataURL(summaryText, {
        width: 250,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff',
        },
      });
    } catch (err) {
      console.error('Failed to generate QR Code', err);
      return '';
    }
  }
}
