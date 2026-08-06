import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ClipboardCheck,
  Package,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
  PlusCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { InventoryItem } from '../types';
import { AuditManager } from '../services/AuditManager';
import { Utils } from '../utils/Utils';

interface HitungSisaViewProps {
  inventory: InventoryItem[];
  preselectedItemId?: string | null;
  onRefresh: () => void;
  onShowToast: (
    type: 'success' | 'error' | 'warning' | 'info',
    msg: string,
    desc?: string
  ) => void;
}

export const HitungSisaView: React.FC<HitungSisaViewProps> = ({
  inventory,
  preselectedItemId,
  onRefresh,
  onShowToast,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(
    preselectedItemId || (inventory.length > 0 ? inventory[0].id : '')
  );
  const [sisaFisikInput, setSisaFisikInput] = useState<number | ''>('');

  const selectedItem = inventory.find((i) => i.id === selectedItemId);

  // Computed values
  const stokAwal = selectedItem ? selectedItem.stock : 0;
  const sisaVal = typeof sisaFisikInput === 'number' ? sisaFisikInput : 0;
  const qtyTerjual = Math.max(0, stokAwal - sisaVal);
  const omzetEst = selectedItem ? qtyTerjual * selectedItem.hargaJual : 0;
  const profitEst = selectedItem ? qtyTerjual * (selectedItem.hargaJual - selectedItem.modalSatuan) : 0;

  const isError = typeof sisaFisikInput === 'number' && sisaFisikInput > stokAwal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItemId) {
      onShowToast('error', 'Pilih barang yang ingin dihitung sisanya');
      return;
    }

    if (typeof sisaFisikInput !== 'number' || sisaFisikInput < 0) {
      onShowToast('error', 'Masukkan jumlah sisa fisik yang valid');
      return;
    }

    const res = AuditManager.hitungSisaBarang(selectedItemId, sisaFisikInput);

    if (res.success) {
      onShowToast('success', res.message);
      setSisaFisikInput('');
      onRefresh();
    } else {
      onShowToast('error', res.message);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          Command: audit sisa
        </span>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          Hitung Sisa Barang (Stock Opname Audit)
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Masukkan sisa fisik barang di toko saat ini. Sistem otomatis menghitung barang terjual, omzet, dan profit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Audit Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Form Hitung Sisa Fisik Barang
              </h3>
              <p className="text-xs text-slate-400">Pilih barang lalu masukkan sisa fisik di toko</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Choose Item */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Pilih Barang Inventaris <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => {
                  setSelectedItemId(e.target.value);
                  setSisaFisikInput('');
                }}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-bold"
              >
                {inventory.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} (Stok Awal: {item.stock} PCS - {Utils.formatRupiah(item.hargaJual)})
                  </option>
                ))}
              </select>
            </div>

            {/* Physical Stock Counter Input */}
            {selectedItem && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Stok Tercatat Awal:</span>
                  <span className="font-bold text-slate-900 dark:text-white px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border">
                    {stokAwal} PCS
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Masukkan Sisa Fisik Barang Sekarang (PCS):
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSisaFisikInput((prev) =>
                          typeof prev === 'number' ? Math.max(0, prev - 1) : 0
                        )
                      }
                      className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200"
                    >
                      <MinusCircle className="w-5 h-5" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      max={stokAwal}
                      placeholder={`0 s/d ${stokAwal}`}
                      value={sisaFisikInput}
                      onChange={(e) =>
                        setSisaFisikInput(
                          e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0)
                        )
                      }
                      className="w-full text-center py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-extrabold text-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSisaFisikInput((prev) =>
                          typeof prev === 'number' ? Math.min(stokAwal, prev + 1) : 1
                        )
                      }
                      className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200"
                    >
                      <PlusCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {isError && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Sisa fisik ({sisaFisikInput}) tidak boleh lebih besar dari stok awal ({stokAwal}).
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isError || sisaFisikInput === ''}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" /> Proses Audit Sisa Barang
            </button>
          </form>
        </motion.div>

        {/* Live Calculation Preview Card */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white border border-emerald-800/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-4 h-4" /> Preview Perhitungan Otomatis
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400">Barang Terpilih:</p>
                <p className="text-base font-bold text-white">
                  {selectedItem ? selectedItem.name : '-'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <div>
                  <p className="text-xs text-slate-400">Stok Awal:</p>
                  <p className="text-lg font-bold text-white">{stokAwal} PCS</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Estimasi Terjual:</p>
                  <p className="text-lg font-black text-emerald-400">{qtyTerjual} PCS</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Estimasi Omzet:</span>
                  <span className="font-bold text-white">{Utils.formatRupiah(omzetEst)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Estimasi Profit:</span>
                  <span className="font-bold text-emerald-400">
                    +{Utils.formatRupiah(profitEst)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-xs text-slate-400">
            Stok inventaris otomatis berkurang sesuai sisa fisik setelah diproses.
          </div>
        </div>
      </div>
    </div>
  );
};
