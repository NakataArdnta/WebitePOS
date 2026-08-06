import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DollarSign, Save, Clock, Calendar, CheckCircle2, Wallet } from 'lucide-react';
import { DailyModal } from '../types';
import { AuditManager } from '../services/AuditManager';
import { Utils } from '../utils/Utils';

interface ModalHarianViewProps {
  dailyModals: DailyModal[];
  todayModalNominal: number;
  onRefresh: () => void;
  onShowToast: (
    type: 'success' | 'error' | 'warning' | 'info',
    msg: string,
    desc?: string
  ) => void;
}

export const ModalHarianView: React.FC<ModalHarianViewProps> = ({
  dailyModals,
  todayModalNominal,
  onRefresh,
  onShowToast,
}) => {
  const [nominalInput, setNominalInput] = useState<number | ''>(
    todayModalNominal || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (typeof nominalInput !== 'number' || nominalInput < 0) {
      onShowToast('error', 'Nominal modal tidak boleh kosong atau negatif');
      return;
    }

    const res = AuditManager.setModalHarian(nominalInput);
    if (res.success) {
      onShowToast('success', res.message);
      onRefresh();
    } else {
      onShowToast('error', res.message);
    }
  };

  const todayStr = Utils.getTodayDateString();
  const currentTodayModalEntry = dailyModals.find((m) => m.date === todayStr);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Title */}
      <div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
          Command: audit modal
        </span>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          Menu Input Modal Harian Warung
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Mencatat uang kembalian / modal awal laci kasir setiap pagi sebelum toko dibuka.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Set Nominal Modal Awal Hari Ini
                </h3>
                <p className="text-xs text-slate-400">Tanggal: {Utils.formatDateIndonesian(todayStr)}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nominal Modal Uang Kas Awal (Rp) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 font-bold text-slate-400 text-sm">Rp</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 300000"
                    value={nominalInput}
                    onChange={(e) =>
                      setNominalInput(
                        e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0)
                      )
                    }
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-lg font-extrabold"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Uang ini dijadikan acuan perhitungan laci kas pada saat Tutup Kas sore/malam hari.
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Pilih Preset Cepat:</label>
                <div className="flex flex-wrap gap-2">
                  {[100000, 200000, 300000, 500000, 1000000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNominalInput(preset)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      {Utils.formatRupiah(preset)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95"
              >
                <Save className="w-4 h-4" /> Simpan Modal Hari Ini
              </button>
            </form>
          </div>
        </motion.div>

        {/* Current Modal Status Summary Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border border-indigo-800/50 rounded-3xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
              Ringkasan Modal Aktif
            </span>
            <div className="mt-4 mb-6">
              <p className="text-xs text-indigo-200">Modal Hari Ini:</p>
              <h3 className="text-3xl font-black tracking-tight text-white mt-1">
                {Utils.formatRupiah(todayModalNominal)}
              </h3>
            </div>

            {currentTodayModalEntry ? (
              <div className="space-y-2 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs">
                <div className="flex items-center gap-2 text-indigo-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Sudah diinput hari ini</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-100">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Waktu Input: {Utils.formatTime(currentTodayModalEntry.inputTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-100">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Tanggal: {currentTodayModalEntry.date}</span>
                </div>
              </div>
            ) : (
              <div className="bg-amber-500/20 text-amber-200 p-4 rounded-2xl border border-amber-500/30 text-xs">
                Modal hari ini belum dicatat. Silakan masukkan nominal pada form di samping.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3 text-xs text-indigo-300">
            <Wallet className="w-5 h-5 shrink-0" />
            <span>Sistem otomatis memperbarui status modal saat ini.</span>
          </div>
        </div>
      </div>

      {/* Daily Modal History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4">
          Riwayat Modal Harian
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-extrabold text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Waktu Input</th>
                <th className="p-3 text-right">Nominal Modal Awal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {dailyModals.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-slate-400">
                    Belum ada riwayat modal harian.
                  </td>
                </tr>
              ) : (
                dailyModals.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      {Utils.formatDateIndonesian(item.date)}
                    </td>
                    <td className="p-3 text-slate-500">{Utils.formatTime(item.inputTime)}</td>
                    <td className="p-3 text-right font-extrabold text-indigo-600 dark:text-indigo-400">
                      {Utils.formatRupiah(item.nominal)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
