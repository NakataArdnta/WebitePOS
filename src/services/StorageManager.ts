import {
  InventoryItem,
  DailyModal,
  AuditSession,
  SoldItemDetail,
  AppSettings,
  UndoAction,
} from '../types';
import { Utils } from '../utils/Utils';

const STORAGE_KEYS = {
  INVENTORY: 'audit_warung_inventory_v1',
  DAILY_MODALS: 'audit_warung_daily_modals_v1',
  AUDIT_SESSIONS: 'audit_warung_sessions_v1',
  SOLD_HISTORY: 'audit_warung_sold_history_v1',
  PPOB_TRANSACTIONS: 'audit_warung_ppob_tx_v1',
  SETTINGS: 'audit_warung_settings_v1',
  UNDO_STACK: 'audit_warung_undo_stack_v1',
};

// Initial realistic default items for Indonesian Warung
const DEFAULT_INVENTORY: InventoryItem[] = [
  {
    id: 'item_1',
    name: 'Indomie Goreng Spesial',
    stock: 45,
    initialStockToday: 50,
    modalSatuan: 2800,
    totalModalPembelian: 140000,
    hargaJual: 3500,
    potensiProfit: 31500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item_2',
    name: 'Kopi Kapal Api Mix (Renteng)',
    stock: 28,
    initialStockToday: 30,
    modalSatuan: 1300,
    totalModalPembelian: 39000,
    hargaJual: 2000,
    potensiProfit: 19600,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item_3',
    name: 'Teh Botol Sosro 450ml',
    stock: 18,
    initialStockToday: 24,
    modalSatuan: 4000,
    totalModalPembelian: 96000,
    hargaJual: 6000,
    potensiProfit: 36000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item_4',
    name: 'Minyak Goreng Sania 1 Liter',
    stock: 12,
    initialStockToday: 15,
    modalSatuan: 15000,
    totalModalPembelian: 225000,
    hargaJual: 18000,
    potensiProfit: 36000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item_5',
    name: 'Beras Pulen Super 5 KG',
    stock: 8,
    initialStockToday: 10,
    modalSatuan: 65000,
    totalModalPembelian: 650000,
    hargaJual: 74000,
    potensiProfit: 72000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item_6',
    name: 'Telur Ayam Ras (1 KG)',
    stock: 15,
    initialStockToday: 20,
    modalSatuan: 25000,
    totalModalPembelian: 500000,
    hargaJual: 29000,
    potensiProfit: 60000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item_7',
    name: 'Aqua Botol 600ml',
    stock: 36,
    initialStockToday: 48,
    modalSatuan: 2500,
    totalModalPembelian: 120000,
    hargaJual: 4000,
    potensiProfit: 54000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item_8',
    name: 'Susu Kental Manis Frisian Flag',
    stock: 14,
    initialStockToday: 15,
    modalSatuan: 10500,
    totalModalPembelian: 157500,
    hargaJual: 13000,
    potensiProfit: 35000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  storeName: 'Warung Berkah Jaya',
  storeOwner: 'Pak Budi',
  storeAddress: 'Jl. Raya Merdeka No. 45, Jakarta',
  storePhone: '0812-3456-7890',
  darkMode: false,
  autoSave: true,
  currencySymbol: 'Rp',
};

export class StorageManager {
  /**
   * Load Inventory Items
   */
  static getInventory(): InventoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      if (!data) {
        this.saveInventory(DEFAULT_INVENTORY);
        return DEFAULT_INVENTORY;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_INVENTORY;
    }
  }

  /**
   * Save Inventory Items
   */
  static saveInventory(items: InventoryItem[]): void {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
  }

  /**
   * Load Daily Modals
   */
  static getDailyModals(): DailyModal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAILY_MODALS);
      if (!data) {
        const todayModal: DailyModal = {
          date: Utils.getTodayDateString(),
          nominal: 300000,
          inputTime: new Date().toISOString(),
        };
        this.saveDailyModals([todayModal]);
        return [todayModal];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Save Daily Modals
   */
  static saveDailyModals(modals: DailyModal[]): void {
    localStorage.setItem(STORAGE_KEYS.DAILY_MODALS, JSON.stringify(modals));
  }

  /**
   * Get Today's Modal Awal
   */
  static getTodayModalNominal(): number {
    const today = Utils.getTodayDateString();
    const modals = this.getDailyModals();
    const todayModal = modals.find((m) => m.date === today);
    return todayModal ? todayModal.nominal : 0;
  }

  /**
   * Set Today's Modal Awal
   */
  static setTodayModalNominal(nominal: number): void {
    const today = Utils.getTodayDateString();
    const modals = this.getDailyModals();
    const index = modals.findIndex((m) => m.date === today);

    const newEntry: DailyModal = {
      date: today,
      nominal: nominal,
      inputTime: new Date().toISOString(),
    };

    if (index >= 0) {
      modals[index] = newEntry;
    } else {
      modals.unshift(newEntry);
    }

    this.saveDailyModals(modals);
  }

  /**
   * Load Audit Sessions
   */
  static getAuditSessions(): AuditSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_SESSIONS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Save Audit Sessions
   */
  static saveAuditSessions(sessions: AuditSession[]): void {
    localStorage.setItem(STORAGE_KEYS.AUDIT_SESSIONS, JSON.stringify(sessions));
  }

  /**
   * Load Sold Items History
   */
  static getSoldHistory(): SoldItemDetail[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SOLD_HISTORY);
      if (!data) {
        // Sample sold items for today demo
        const today = Utils.getTodayDateString();
        const sampleSold: SoldItemDetail[] = [
          {
            id: 'sold_1',
            itemId: 'item_1',
            itemName: 'Indomie Goreng Spesial',
            qtySold: 5,
            sisaFisik: 45,
            modalSatuan: 2800,
            hargaJual: 3500,
            omzet: 17500,
            profit: 3500,
            timestamp: new Date().toISOString(),
            timeOnly: '09:15',
            dateOnly: today,
          },
          {
            id: 'sold_2',
            itemId: 'item_2',
            itemName: 'Kopi Kapal Api Mix (Renteng)',
            qtySold: 2,
            sisaFisik: 28,
            modalSatuan: 1300,
            hargaJual: 2000,
            omzet: 4000,
            profit: 1400,
            timestamp: new Date().toISOString(),
            timeOnly: '10:30',
            dateOnly: today,
          },
          {
            id: 'sold_3',
            itemId: 'item_3',
            itemName: 'Teh Botol Sosro 450ml',
            qtySold: 6,
            sisaFisik: 18,
            modalSatuan: 4000,
            hargaJual: 6000,
            omzet: 36000,
            profit: 12000,
            timestamp: new Date().toISOString(),
            timeOnly: '11:45',
            dateOnly: today,
          },
          {
            id: 'sold_4',
            itemId: 'item_7',
            itemName: 'Aqua Botol 600ml',
            qtySold: 12,
            sisaFisik: 36,
            modalSatuan: 2500,
            hargaJual: 4000,
            omzet: 48000,
            profit: 18000,
            timestamp: new Date().toISOString(),
            timeOnly: '13:20',
            dateOnly: today,
          },
        ];
        this.saveSoldHistory(sampleSold);
        return sampleSold;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Save Sold Items History
   */
  static saveSoldHistory(history: SoldItemDetail[]): void {
    localStorage.setItem(STORAGE_KEYS.SOLD_HISTORY, JSON.stringify(history));
  }

  /**
   * Load Settings
   */
  static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save Settings
   */
  static saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  /**
   * Save Undo State Action
   */
  static pushUndoState(description: string): void {
    try {
      const action: UndoAction = {
        id: Utils.generateId('undo'),
        type: 'STATE_CHANGE',
        description,
        previousState: {
          inventory: this.getInventory(),
          dailyModals: this.getDailyModals(),
          auditSessions: this.getAuditSessions(),
          soldHistory: this.getSoldHistory(),
        },
        timestamp: Date.now(),
      };

      const stackData = localStorage.getItem(STORAGE_KEYS.UNDO_STACK);
      const stack: UndoAction[] = stackData ? JSON.parse(stackData) : [];
      stack.unshift(action);
      // Keep max 10 undo levels
      if (stack.length > 10) stack.pop();

      localStorage.setItem(STORAGE_KEYS.UNDO_STACK, JSON.stringify(stack));
    } catch (e) {
      console.error('Failed to save undo state', e);
    }
  }

  /**
   * Perform Undo Last Action
   */
  static undoLastAction(): UndoAction | null {
    try {
      const stackData = localStorage.getItem(STORAGE_KEYS.UNDO_STACK);
      if (!stackData) return null;

      const stack: UndoAction[] = JSON.parse(stackData);
      if (stack.length === 0) return null;

      const action = stack.shift()!;
      this.saveInventory(action.previousState.inventory);
      this.saveDailyModals(action.previousState.dailyModals);
      this.saveAuditSessions(action.previousState.auditSessions);
      this.saveSoldHistory(action.previousState.soldHistory);

      localStorage.setItem(STORAGE_KEYS.UNDO_STACK, JSON.stringify(stack));
      return action;
    } catch {
      return null;
    }
  }

  /**
   * Export all database as JSON
   */
  static exportFullBackup(): string {
    const backupData = {
      app: 'AuditWarung',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      inventory: this.getInventory(),
      dailyModals: this.getDailyModals(),
      auditSessions: this.getAuditSessions(),
      soldHistory: this.getSoldHistory(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backupData, null, 2);
  }

  /**
   * Import/Restore database from JSON string
   */
  static importFullBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.inventory) this.saveInventory(data.inventory);
      if (data.dailyModals) this.saveDailyModals(data.dailyModals);
      if (data.auditSessions) this.saveAuditSessions(data.auditSessions);
      if (data.soldHistory) this.saveSoldHistory(data.soldHistory);
      if (data.settings) this.saveSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Failed to import backup JSON', e);
      return false;
    }
  }

  /**
   * Clear all database completely (0 inventory, 0 history, 0 modal)
   */
  static clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.INVENTORY);
    localStorage.removeItem(STORAGE_KEYS.DAILY_MODALS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.SOLD_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.PPOB_TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.UNDO_STACK);
    this.saveInventory([]);
    this.saveDailyModals([]);
    this.saveAuditSessions([]);
    this.saveSoldHistory([]);
  }

  /**
   * Reset database to default clean state with sample data
   */
  static resetDatabase(): void {
    localStorage.removeItem(STORAGE_KEYS.INVENTORY);
    localStorage.removeItem(STORAGE_KEYS.DAILY_MODALS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.SOLD_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.UNDO_STACK);
    this.saveInventory(DEFAULT_INVENTORY);
    this.saveSettings(DEFAULT_SETTINGS);
  }
}
