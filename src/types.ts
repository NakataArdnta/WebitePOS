export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  initialStockToday?: number; // Stock level at the start of the current opname period
  modalSatuan: number; // Cost price per piece
  totalModalPembelian: number; // Total purchase modal for batch
  hargaJual: number; // Selling price per piece
  potensiProfit: number; // (hargaJual - modalSatuan) * stock
  category?: string; // Optional product category (e.g. Sembako, Minuman, Snak)
  code?: string; // Barcode or SKU
  createdAt: string; // ISO date string
  updatedAt: string;
}

export interface SoldItemDetail {
  id: string;
  itemId: string;
  itemName: string;
  qtySold: number;
  sisaFisik: number;
  modalSatuan: number;
  hargaJual: number;
  omzet: number; // qtySold * hargaJual
  profit: number; // qtySold * (hargaJual - modalSatuan)
  timestamp: string; // ISO string
  timeOnly: string; // e.g. "18:30"
  dateOnly: string; // e.g. "2026-08-05"
  category?: string;
  paymentMethod?: 'CASH' | 'QRIS';
}

export interface PosCartItem {
  id: string;
  itemId: string;
  name: string;
  type: 'RETAIL';
  hargaJual: number;
  modalSatuan: number;
  qty: number;
  subtotal: number;
  category?: string;
}

export interface DailyModal {
  date: string; // YYYY-MM-DD
  nominal: number;
  inputTime: string; // ISO string or format
}

export type AuditStatus = 'PAS' | 'LEBIH' | 'MINUS' | 'BELUM_TUTUP';

export interface AuditSession {
  id: string;
  date: string; // YYYY-MM-DD
  modalAwal: number;
  omzetCash: number;
  omzetQris: number;
  totalOmzet: number;
  totalProfit: number;
  uangCashSeharusnya: number; // modalAwal + omzetCash
  uangQrisSeharusnya: number; // omzetQris
  uangSeharusnya: number; // modalAwal + totalOmzet
  uangFisik: number; // Uang fisik laci kas
  uangQris: number; // Saldo QRIS bank/e-wallet
  selisihCash: number; // uangFisik - uangCashSeharusnya
  selisihQris: number; // uangQris - uangQrisSeharusnya
  selisih: number; // selisihCash + selisihQris
  statusCash: AuditStatus;
  statusQris: AuditStatus;
  status: AuditStatus;
  soldItems: SoldItemDetail[];
  isClosed: boolean;
  closedAt?: string;
  notes?: string;
}

export interface AppSettings {
  storeName: string;
  storeOwner: string;
  storeAddress: string;
  storePhone: string;
  darkMode: boolean;
  autoSave: boolean;
  currencySymbol: string;
  qrisImageUrl?: string;
  digiflazzUsername?: string;
  digiflazzApiKey?: string;
  digiflazzIsProduction?: boolean;
}

export interface UndoAction {
  id: string;
  type: string;
  description: string;
  previousState: {
    inventory: InventoryItem[];
    dailyModals: DailyModal[];
    auditSessions: AuditSession[];
    soldHistory: SoldItemDetail[];
  };
  timestamp: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  duration?: number;
}
