import {
  SoldItemDetail,
  AuditSession,
  AuditStatus,
} from '../types';
import { StorageManager } from './StorageManager';
import { Utils } from '../utils/Utils';
import { Validator, ValidationResult } from '../utils/Validator';

export interface RekapHarianData {
  date: string;
  modalAwal: number;
  soldItems: SoldItemDetail[];
  totalQtySold: number;
  omzetCash: number;
  omzetQris: number;
  totalOmzet: number;
  totalProfit: number;
  uangCashSeharusnya: number; // modalAwal + omzetCash
  uangQrisSeharusnya: number; // omzetQris
  uangSeharusnya: number; // modalAwal + totalOmzet
  isClosed: boolean;
  closingSession?: AuditSession;
}

export class AuditManager {
  /**
   * Set Daily Modal (Command: audit modal)
   */
  static setModalHarian(nominal: number): { success: boolean; message: string } {
    const val: ValidationResult = Validator.validateDailyModal(nominal);
    if (!val.isValid) {
      return { success: false, message: val.message };
    }

    StorageManager.pushUndoState(`Set Modal Harian: Rp ${nominal.toLocaleString()}`);
    StorageManager.setTodayModalNominal(nominal);

    return {
      success: true,
      message: `Modal harian hari ini berhasil dicatat: ${Utils.formatRupiah(nominal)}.`,
    };
  }

  /**
   * Calculate Remaining Stock (Command: audit sisa)
   * User chooses item, inputs sisaFisik.
   * Auto calculates: stokAwal, qtySold, omzet, profit.
   * Automatically reduces inventory stock to sisaFisik.
   */
  static hitungSisaBarang(
    itemId: string,
    sisaFisik: number
  ): { success: boolean; message: string; soldDetail?: SoldItemDetail } {
    const inventory = StorageManager.getInventory();
    const item = inventory.find((i) => i.id === itemId);

    if (!item) {
      return { success: false, message: 'Barang tidak ditemukan.' };
    }

    const stokAwal = item.stock;

    // Validation
    const val: ValidationResult = Validator.validateSisaFisik(sisaFisik, stokAwal);
    if (!val.isValid) {
      return { success: false, message: val.message };
    }

    const qtySold = stokAwal - sisaFisik;

    if (qtySold === 0) {
      return {
        success: true,
        message: `Sisa fisik "${item.name}" sama dengan stok awal (${stokAwal}). Stok masih utuh, tidak ada barang terjual.`,
      };
    }

    StorageManager.pushUndoState(`Hitung Sisa: ${item.name} (Sisa: ${sisaFisik})`);

    const omzet = qtySold * item.hargaJual;
    const profit = qtySold * (item.hargaJual - item.modalSatuan);
    const todayStr = Utils.getTodayDateString();

    const soldDetail: SoldItemDetail = {
      id: Utils.generateId('sold'),
      itemId: item.id,
      itemName: item.name,
      qtySold: qtySold,
      sisaFisik: sisaFisik,
      modalSatuan: item.modalSatuan,
      hargaJual: item.hargaJual,
      omzet: omzet,
      profit: profit,
      timestamp: new Date().toISOString(),
      timeOnly: Utils.formatTime(),
      dateOnly: todayStr,
    };

    // Save sold detail history
    const soldHistory = StorageManager.getSoldHistory();
    soldHistory.unshift(soldDetail);
    StorageManager.saveSoldHistory(soldHistory);

    // Update inventory item stock to sisaFisik
    item.stock = sisaFisik;
    item.potensiProfit = (item.hargaJual - item.modalSatuan) * sisaFisik;
    item.updatedAt = new Date().toISOString();
    StorageManager.saveInventory(inventory);

    return {
      success: true,
      message: `Perhitungan sisa "${item.name}" berhasil! Terjual: ${qtySold} PCS, Omzet: ${Utils.formatRupiah(omzet)}, Profit: ${Utils.formatRupiah(profit)}. Stok tersisa: ${sisaFisik} PCS.`,
      soldDetail,
    };
  }

  /**
   * Get Daily Rekap Summary (Command: audit cek)
   */
  static getRekapHarian(targetDate?: string): RekapHarianData {
    const date = targetDate || Utils.getTodayDateString();
    const modalAwal = StorageManager.getTodayModalNominal();
    const soldHistory = StorageManager.getSoldHistory();
    const sessions = StorageManager.getAuditSessions();

    const soldToday = soldHistory.filter((s) => s.dateOnly === date);

    let totalQtySold = 0;
    let omzetCash = 0;
    let omzetQris = 0;
    let totalProfit = 0;

    soldToday.forEach((s) => {
      totalQtySold += s.qtySold;
      totalProfit += s.profit;
      if (s.paymentMethod === 'QRIS') {
        omzetQris += s.omzet;
      } else {
        omzetCash += s.omzet;
      }
    });

    const totalOmzet = omzetCash + omzetQris;
    const uangCashSeharusnya = modalAwal + omzetCash;
    const uangQrisSeharusnya = omzetQris;
    const uangSeharusnya = modalAwal + totalOmzet;

    const closingSession = sessions.find((s) => s.date === date && s.isClosed);

    return {
      date,
      modalAwal,
      soldItems: soldToday,
      totalQtySold,
      omzetCash,
      omzetQris,
      totalOmzet,
      totalProfit,
      uangCashSeharusnya,
      uangQrisSeharusnya,
      uangSeharusnya,
      isClosed: !!closingSession,
      closingSession,
    };
  }

  /**
   * Close Register / Cash Box & Digital QRIS Audit (Command: audit laci & qris)
   * User inputs physical cash amount in drawer AND reported digital QRIS balance.
   */
  static tutupKas(
    uangFisik: number,
    uangQris: number = 0,
    notes?: string
  ): { success: boolean; message: string; session?: AuditSession } {
    const valCash = Validator.validateUangFisik(uangFisik);
    if (!valCash.isValid) {
      return { success: false, message: valCash.message };
    }

    const rekap = this.getRekapHarian();
    const selisihCash = uangFisik - rekap.uangCashSeharusnya;
    const selisihQris = uangQris - rekap.uangQrisSeharusnya;
    const selisihTotal = selisihCash + selisihQris;

    const statusCash: AuditStatus = Utils.getAuditStatus(selisihCash);
    const statusQris: AuditStatus = Utils.getAuditStatus(selisihQris);
    const overallStatus: AuditStatus = Utils.getAuditStatus(selisihTotal);

    StorageManager.pushUndoState(
      `Tutup Kas: Cash ${Utils.formatRupiah(uangFisik)}, QRIS ${Utils.formatRupiah(uangQris)}`
    );

    const session: AuditSession = {
      id: Utils.generateId('session'),
      date: rekap.date,
      modalAwal: rekap.modalAwal,
      omzetCash: rekap.omzetCash,
      omzetQris: rekap.omzetQris,
      totalOmzet: rekap.totalOmzet,
      totalProfit: rekap.totalProfit,
      uangCashSeharusnya: rekap.uangCashSeharusnya,
      uangQrisSeharusnya: rekap.uangQrisSeharusnya,
      uangSeharusnya: rekap.uangSeharusnya,
      uangFisik: uangFisik,
      uangQris: uangQris,
      selisihCash: selisihCash,
      selisihQris: selisihQris,
      selisih: selisihTotal,
      statusCash: statusCash,
      statusQris: statusQris,
      status: overallStatus,
      soldItems: rekap.soldItems,
      isClosed: true,
      closedAt: new Date().toISOString(),
      notes: notes || '',
    };

    const sessions = StorageManager.getAuditSessions();
    const existingIndex = sessions.findIndex((s) => s.date === rekap.date);

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session);
    }

    StorageManager.saveAuditSessions(sessions);

    return {
      success: true,
      message: `Audit Tutup Kas Selesai! Kas Laci: ${statusCash}, QRIS Bank: ${statusQris}. Total Audit: ${overallStatus}`,
      session,
    };
  }

  /**
   * Search and filter past audit history
   */
  static getAuditHistory(
    year?: string,
    month?: string,
    statusFilter?: string,
    searchQuery?: string
  ): AuditSession[] {
    let sessions = StorageManager.getAuditSessions();

    if (year) {
      sessions = sessions.filter((s) => s.date.startsWith(year));
    }

    if (month && year) {
      const monthPrefix = `${year}-${month.padStart(2, '0')}`;
      sessions = sessions.filter((s) => s.date.startsWith(monthPrefix));
    }

    if (statusFilter && statusFilter !== 'ALL') {
      sessions = sessions.filter((s) => s.status === statusFilter);
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      sessions = sessions.filter(
        (s) =>
          s.date.includes(q) ||
          s.notes?.toLowerCase().includes(q) ||
          s.soldItems.some((item) => item.itemName.toLowerCase().includes(q))
      );
    }

    return sessions.sort((a, b) => b.date.localeCompare(a.date));
  }
}
