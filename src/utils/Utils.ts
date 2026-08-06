/**
 * Utility functions for Audit Warung System
 */

export class Utils {
  /**
   * Format number to Indonesian Rupiah currency format (e.g., Rp 15.000)
   */
  static formatRupiah(amount: number | null | undefined): string {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'Rp 0';
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format number with thousands separator (e.g. 1.500)
   */
  static formatNumber(num: number | null | undefined): string {
    if (num === null || num === undefined || isNaN(num)) {
      return '0';
    }
    return new Intl.NumberFormat('id-ID').format(num);
  }

  /**
   * Get current date string in YYYY-MM-DD
   */
  static getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Format ISO date string to human readable Indonesian date
   * e.g. "5 Agustus 2026"
   */
  static formatDateIndonesian(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateString;
    }
  }

  /**
   * Format ISO time to HH:mm (e.g. "14:30")
   */
  static formatTime(dateString?: string): string {
    const date = dateString ? new Date(dateString) : new Date();
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  /**
   * Unique ID Generator
   */
  static generateId(prefix: string = 'id'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Calculate profit margin percentage
   */
  static calculateMarginPercent(hargaJual: number, modalSatuan: number): number {
    if (!hargaJual || hargaJual === 0) return 0;
    const profit = hargaJual - modalSatuan;
    return Math.round((profit / hargaJual) * 100);
  }

  /**
   * Calculate Audit status from difference (selisih)
   */
  static getAuditStatus(selisih: number): 'PAS' | 'LEBIH' | 'MINUS' {
    if (selisih === 0) return 'PAS';
    if (selisih > 0) return 'LEBIH';
    return 'MINUS';
  }

  /**
   * Status color badge classes
   */
  static getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PAS':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'LEBIH':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'MINUS':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'BELUM_TUTUP':
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800';
    }
  }
}
