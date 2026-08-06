import { InventoryItem } from '../types';
import { StorageManager } from './StorageManager';
import { Utils } from '../utils/Utils';
import { Validator, ValidationResult } from '../utils/Validator';

export class InventoryManager {
  /**
   * Add new item or add stock (Belanja Stock)
   * Command equivalent: audit belanja
   */
  static addBelanjaItem(
    name: string,
    jumlahBarang: number,
    totalModalPembelian: number,
    hargaJual: number
  ): { success: boolean; message: string; item?: InventoryItem } {
    const existingItems = StorageManager.getInventory();

    // Validate
    const validation: ValidationResult = Validator.validateInventoryItem(
      name,
      jumlahBarang,
      totalModalPembelian,
      hargaJual,
      existingItems
    );

    if (!validation.isValid) {
      return { success: false, message: validation.message };
    }

    // Push state for Undo capability
    StorageManager.pushUndoState(`Tambah Belanja: ${name}`);

    const modalSatuan = Math.round(totalModalPembelian / jumlahBarang);
    const potensiProfit = (hargaJual - modalSatuan) * jumlahBarang;

    const newItem: InventoryItem = {
      id: Utils.generateId('item'),
      name: name.trim(),
      stock: jumlahBarang,
      initialStockToday: jumlahBarang,
      modalSatuan: modalSatuan,
      totalModalPembelian: totalModalPembelian,
      hargaJual: hargaJual,
      potensiProfit: potensiProfit,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [newItem, ...existingItems];
    StorageManager.saveInventory(updatedList);

    return {
      success: true,
      message: `Berhasil menambahkan "${newItem.name}" sebanyak ${jumlahBarang} PCS ke inventaris.`,
      item: newItem,
    };
  }

  /**
   * Update existing inventory item
   */
  static updateItem(
    id: string,
    name: string,
    stock: number,
    totalModalPembelian: number,
    hargaJual: number
  ): { success: boolean; message: string } {
    const existingItems = StorageManager.getInventory();
    const itemIndex = existingItems.findIndex((i) => i.id === id);

    if (itemIndex === -1) {
      return { success: false, message: 'Barang tidak ditemukan.' };
    }

    // Validate
    const validation: ValidationResult = Validator.validateInventoryItem(
      name,
      stock,
      totalModalPembelian,
      hargaJual,
      existingItems,
      id
    );

    if (!validation.isValid) {
      return { success: false, message: validation.message };
    }

    StorageManager.pushUndoState(`Edit Barang: ${name}`);

    const modalSatuan = stock > 0 ? Math.round(totalModalPembelian / stock) : 0;
    const potensiProfit = (hargaJual - modalSatuan) * stock;

    existingItems[itemIndex] = {
      ...existingItems[itemIndex],
      name: name.trim(),
      stock: stock,
      modalSatuan: modalSatuan,
      totalModalPembelian: totalModalPembelian,
      hargaJual: hargaJual,
      potensiProfit: potensiProfit,
      updatedAt: new Date().toISOString(),
    };

    StorageManager.saveInventory(existingItems);
    return { success: true, message: `Barang "${name}" berhasil diperbarui.` };
  }

  /**
   * Delete single item
   */
  static deleteItem(id: string): { success: boolean; message: string } {
    const existingItems = StorageManager.getInventory();
    const item = existingItems.find((i) => i.id === id);

    if (!item) {
      return { success: false, message: 'Barang tidak ditemukan.' };
    }

    StorageManager.pushUndoState(`Hapus Barang: ${item.name}`);

    const updated = existingItems.filter((i) => i.id !== id);
    StorageManager.saveInventory(updated);

    return { success: true, message: `Barang "${item.name}" berhasil dihapus.` };
  }

  /**
   * Delete multiple items (Multi Select Delete)
   */
  static deleteMultipleItems(ids: string[]): { success: boolean; message: string } {
    if (!ids || ids.length === 0) {
      return { success: false, message: 'Tidak ada barang yang dipilih.' };
    }

    StorageManager.pushUndoState(`Hapus ${ids.length} barang sekaligus`);

    const existingItems = StorageManager.getInventory();
    const updated = existingItems.filter((i) => !ids.includes(i.id));
    StorageManager.saveInventory(updated);

    return {
      success: true,
      message: `Berhasil menghapus ${ids.length} barang.`,
    };
  }

  /**
   * Get all inventory items with search & filter
   */
  static getItems(
    searchQuery: string = '',
    sortBy: 'name' | 'stock' | 'modal' | 'profit' = 'name',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): InventoryItem[] {
    let items = StorageManager.getInventory();

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.hargaJual.toString().includes(q) ||
          item.stock.toString().includes(q)
      );
    }

    items.sort((a, b) => {
      let valA: string | number = a.name;
      let valB: string | number = b.name;

      if (sortBy === 'stock') {
        valA = a.stock;
        valB = b.stock;
      } else if (sortBy === 'modal') {
        valA = a.modalSatuan;
        valB = b.modalSatuan;
      } else if (sortBy === 'profit') {
        valA = a.potensiProfit;
        valB = b.potensiProfit;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return sortOrder === 'asc'
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      }
    });

    return items;
  }
}
