import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Package,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  ClipboardCheck,
  Lock,
} from 'lucide-react';
import { InventoryItem } from '../types';
import { StorageManager } from '../services/StorageManager';
import { Utils } from '../utils/Utils';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  onSelectItemForAudit?: (itemId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectItemForAudit,
}) => {
  const [query, setQuery] = useState('');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setInventory(StorageManager.getInventory());
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredItems = query.trim()
    ? inventory.filter(
        (i) =>
          i.name.toLowerCase().includes(query.toLowerCase()) ||
          i.hargaJual.toString().includes(query)
      )
    : inventory.slice(0, 5);

  const navigationShortcuts = [
    { label: 'Hitung Sisa Barang (Audit Sisa)', route: 'hitung-sisa', icon: ClipboardCheck },
    { label: 'Tambah Stok Belanja (Audit Belanja)', route: 'audit-belanja', icon: ShoppingBag },
    { label: 'Input Modal Harian (Audit Modal)', route: 'modal-harian', icon: DollarSign },
    { label: 'Tutup Kas / Laci (Audit Laci)', route: 'tutup-kas', icon: Lock },
    { label: 'Export Data Excel & PDF', route: 'export', icon: TrendingUp },
  ].filter((s) => s.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden relative"
        >
          {/* Search Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Cari barang, fitur, atau perintah audit... (Ctrl+K)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0 text-base"
            />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 max-h-[60vh] overflow-y-auto space-y-6">
            {/* Quick Actions / Navigation */}
            {navigationShortcuts.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Aksi & Perintah Pintar
                </h4>
                <div className="space-y-1">
                  {navigationShortcuts.map((nav) => {
                    const Icon = nav.icon;
                    return (
                      <button
                        key={nav.route}
                        onClick={() => {
                          onNavigate(nav.route);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {nav.label}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Inventory Items */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Pencarian Barang Inventaris ({filteredItems.length})
              </h4>
              {filteredItems.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">
                  Tidak ada barang ditemukan.
                </p>
              ) : (
                <div className="space-y-1">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (onSelectItemForAudit) {
                          onSelectItemForAudit(item.id);
                        } else {
                          onNavigate('stok-gudang');
                        }
                        onClose();
                      }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50/50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors border border-transparent hover:border-blue-200 dark:hover:border-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-900 dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Stok: <span className="font-bold">{item.stock} PCS</span> • Modal: {Utils.formatRupiah(item.modalSatuan)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {Utils.formatRupiah(item.hargaJual)}
                        </p>
                        <span className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                          Hitung Sisa →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">ESC</kbd> untuk menutup
            </span>
            <span>Audit Warung v1.0 POS System</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
