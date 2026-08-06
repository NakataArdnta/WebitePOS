import { InventoryItem } from '../types';

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export class Validator {
  /**
   * Validate adding / editing inventory item
   */
  static validateInventoryItem(
    name: string,
    stock: number,
    totalModal: number,
    hargaJual: number,
    existingItems: InventoryItem[],
    currentItemId?: string
  ): ValidationResult {
    // Trim name
    const trimmedName = name ? name.trim() : '';

    if (!trimmedName) {
      return { isValid: false, message: 'Nama barang tidak boleh kosong.' };
    }

    // Check duplicate name
    const isDuplicate = existingItems.some(
      (item) =>
        item.name.toLowerCase() === trimmedName.toLowerCase() &&
        item.id !== currentItemId
    );

    if (isDuplicate) {
      return {
        isValid: false,
        message: `Barang dengan nama "${trimmedName}" sudah ada dalam inventaris.`,
      };
    }

    // Check negative numbers
    if (stock < 0) {
      return { isValid: false, message: 'Jumlah stok tidak boleh negatif.' };
    }

    if (totalModal < 0) {
      return { isValid: false, message: 'Total modal tidak boleh negatif.' };
    }

    if (hargaJual < 0) {
      return { isValid: false, message: 'Harga jual tidak boleh negatif.' };
    }

    if (stock > 0) {
      const modalSatuan = totalModal / stock;
      if (hargaJual < modalSatuan) {
        return {
          isValid: false,
          message: `Harga jual (Rp ${hargaJual.toLocaleString()}) tidak boleh lebih kecil dari modal satuan (Rp ${Math.round(
            modalSatuan
          ).toLocaleString()}).`,
        };
      }
    }

    return { isValid: true, message: 'Valid' };
  }

  /**
   * Validate daily modal input
   */
  static validateDailyModal(nominal: number): ValidationResult {
    if (nominal < 0) {
      return { isValid: false, message: 'Modal harian tidak boleh negatif.' };
    }
    return { isValid: true, message: 'Valid' };
  }

  /**
   * Validate physical stock count entry (Sisa Fisik)
   */
  static validateSisaFisik(
    sisaFisik: number,
    stokAwal: number
  ): ValidationResult {
    if (sisaFisik < 0) {
      return { isValid: false, message: 'Jumlah sisa fisik tidak boleh negatif.' };
    }

    if (sisaFisik > stokAwal) {
      return {
        isValid: false,
        message: `Jumlah sisa fisik (${sisaFisik}) tidak boleh lebih besar dari stok awal (${stokAwal}).`,
      };
    }

    return { isValid: true, message: 'Valid' };
  }

  /**
   * Validate Tutup Kas (Physical Money Input)
   */
  static validateUangFisik(uangFisik: number): ValidationResult {
    if (uangFisik < 0) {
      return { isValid: false, message: 'Jumlah uang fisik laci tidak boleh negatif.' };
    }
    return { isValid: true, message: 'Valid' };
  }
}
