import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Lock,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Printer,
  DollarSign,
  QrCode,
  Wallet,
} from 'lucide-react';
import { AuditSession } from '../types';
import { AuditManager, RekapHarianData } from '../services/AuditManager';
import { Utils } from '../utils/Utils';

interface TutupKasViewProps {
  rekap: RekapHarianData;
  onRefresh: () => void;
  onOpenPrintTicket: (session: AuditSession) => void;
  onShowToast: (
    type: 'success' | 'error' | 'warning' | 'info',
    msg: string,
    desc?: string
  ) => void;
}

export const TutupKasView: React.FC<TutupKasViewProps> = ({
  rekap,
  onRefresh,
  onOpenPrintTicket,
  onShowToast,
}) => {
  const [uangFisikInput, setUangFisikInput] = useState<number | ''>('');
  const [uangQrisInput, setUangQrisInput] = useState<number | ''>(rekap.omzetQris || '');
  const [notes, setNotes] = useState('');
  const [completedSession, setCompletedSession] = useState<AuditSession | null>(
    rekap.closingSession || null
  );

  const uangFisikVal = typeof uangFisikInput === 'number' ? uangFisikInput : 0;
  const uangQrisVal = typeof uangQrisInput === 'number' ? uangQrisInput : 0;

  const selisihCashEst = uangFisikVal - rekap.uangCashSeharusnya;
  const selisihQrisEst = uangQrisVal - rekap.uangQrisSeharusnya;
  const statusCashEst = Utils.getAuditStatus(selisihCashEst);
  const statusQrisEst = Utils.getAuditStatus(selisihQrisEst);

  const selisihTotalEst = selisihCashEst + selisihQrisEst;
  const statusTotalEst = Utils.getAuditStatus(selisihTotalEst);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (typeof uangFisikInput !== 'number' || uangFisikInput < 0) {
      onShowToast('error', 'Masukkan jumlah uang fisik laci kas yang valid');
      return;
    }

    const qrisFinal = typeof uangQrisInput === 'number' ? uangQrisInput : 0;
    const res = AuditManager.tutupKas(uangFisikInput, qrisFinal, notes);

    if (res.success && res.session) {
      onShowToast('success', res.message);
      setCompletedSession(res.session);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      onRefresh();
    } else {
      onShowToast('error', res.message);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
          Command: audit laci & qris
        </span>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          Menu Tutup Kas & Audit Dual Pembayaran
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Audit 2 jalur pembayaran sekaligus: Uang Fisik Laci (Tunai) & Saldo QRIS Bank Digital untuk mendeteksi selisih secara akurat.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form / Audit Result Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm"
        >
          {completedSession ? (
            /* Audit Result Summary View */
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      Laporan Audit Dual Pembayaran Selesai
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tutup kas tanggal {Utils.formatDateIndonesian(completedSession.date)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenPrintTicket(completedSession)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20"
                >
                  <Printer className="w-4 h-4" /> Cetak Struk Audit
                </button>
              </div>

              {/* Status Banner */}
              <div
                className={`p-5 rounded-2xl border flex items-center gap-4 ${
                  completedSession.status === 'PAS'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200'
                    : completedSession.status === 'LEBIH'
                    ? 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200'
                    : 'bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-200'
                }`}
              >
                {completedSession.status === 'PAS' ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                ) : completedSession.status === 'LEBIH' ? (
                  <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-600 shrink-0" />
                )}

                <div>
                  <h4 className="font-extrabold text-base">
                    STATUS TOTAL AUDIT: {completedSession.status}
                  </h4>
                  <p className="text-xs mt-1">
                    Kas Laci: <strong className="uppercase">{completedSession.statusCash || 'PAS'}</strong> ({Utils.formatRupiah(completedSession.selisihCash || 0)}) • Saldo QRIS: <strong className="uppercase">{completedSession.statusQris || 'PAS'}</strong> ({Utils.formatRupiah(completedSession.selisihQris || 0)})
                  </p>
                </div>
              </div>

              {/* Grid Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-400">Modal Awal Kas:</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {Utils.formatRupiah(completedSession.modalAwal)}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-400">Omzet Tunai (Cash):</p>
                  <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {Utils.formatRupiah(completedSession.omzetCash || 0)}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-400">Omzet Digital (QRIS):</p>
                  <p className="text-base font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {Utils.formatRupiah(completedSession.omzetQris || 0)}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-400">Kas Laci Seharusnya:</p>
                  <p className="text-base font-bold text-amber-600 dark:text-amber-400 mt-1">
                    {Utils.formatRupiah(completedSession.uangCashSeharusnya || completedSession.uangSeharusnya)}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-400">Laci Fisik Dilaporkan:</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {Utils.formatRupiah(completedSession.uangFisik)}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-400">Saldo QRIS Dilaporkan:</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {Utils.formatRupiah(completedSession.uangQris || 0)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Form Input Dual Audit */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Form Audit Dual Pembayaran (Laci Cash & QRIS Bank)
                  </h3>
                  <p className="text-xs text-slate-400">Masukkan jumlah uang di 2 lokasi pembayaran toko</p>
                </div>
              </div>

              {/* Field 1: Cash Laci */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span>1. Jumlah Uang Fisik di Laci Kas (Cash Tunai)</span>
                  <span className="text-rose-500">*</span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 font-bold text-slate-400 text-sm">Rp</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 350000"
                    value={uangFisikInput}
                    onChange={(e) =>
                      setUangFisikInput(
                        e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0)
                      )
                    }
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-extrabold text-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Target Laci: Modal Awal ({Utils.formatRupiah(rekap.modalAwal)}) + Omzet Cash ({Utils.formatRupiah(rekap.omzetCash)}) = <strong className="text-emerald-600 dark:text-emerald-400">{Utils.formatRupiah(rekap.uangCashSeharusnya)}</strong>
                </p>
              </div>

              {/* Field 2: Saldo QRIS Bank Digital */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <QrCode className="w-4 h-4 text-purple-600" />
                  <span>2. Saldo Uang Masuk di QRIS / E-Wallet Bank</span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 font-bold text-slate-400 text-sm">Rp</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 120000"
                    value={uangQrisInput}
                    onChange={(e) =>
                      setUangQrisInput(
                        e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0)
                      )
                    }
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-extrabold text-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Target QRIS Digital Bank: <strong className="text-purple-600 dark:text-purple-400">{Utils.formatRupiah(rekap.uangQrisSeharusnya)}</strong>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Catatan Tambahan Audit (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Saldo QRIS aman, laci pas dengan transaksi..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={uangFisikInput === ''}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95"
              >
                <Lock className="w-4 h-4" /> Proses & Selesaikan Tutup Kas Dual Audit
              </button>
            </form>
          )}
        </motion.div>

        {/* Realtime Live Audit Calculation Preview */}
        <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-6">
              <Calculator className="w-4 h-4" /> Realtime Dual Audit Calculation
            </div>

            <div className="space-y-4 text-xs">
              {/* Cash Section */}
              <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 space-y-2">
                <div className="font-bold text-emerald-400 flex justify-between">
                  <span>AUDIT LACI KAS (TUNAI)</span>
                  <span>{statusCashEst}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Target Cash (Modal + Omzet):</span>
                  <span>{Utils.formatRupiah(rekap.uangCashSeharusnya)}</span>
                </div>
                <div className="flex justify-between text-white font-bold">
                  <span>Input Uang Fisik Laci:</span>
                  <span>{Utils.formatRupiah(uangFisikVal)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-700 text-slate-200">
                  <span>Selisih Cash:</span>
                  <span className={selisihCashEst === 0 ? 'text-emerald-400 font-bold' : selisihCashEst > 0 ? 'text-amber-400 font-bold' : 'text-rose-400 font-bold'}>
                    {Utils.formatRupiah(selisihCashEst)}
                  </span>
                </div>
              </div>

              {/* QRIS Section */}
              <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 space-y-2">
                <div className="font-bold text-purple-400 flex justify-between">
                  <span>AUDIT QRIS (DIGITAL BANK)</span>
                  <span>{statusQrisEst}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Target QRIS Bank:</span>
                  <span>{Utils.formatRupiah(rekap.uangQrisSeharusnya)}</span>
                </div>
                <div className="flex justify-between text-white font-bold">
                  <span>Input Saldo QRIS:</span>
                  <span>{Utils.formatRupiah(uangQrisVal)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-700 text-slate-200">
                  <span>Selisih QRIS:</span>
                  <span className={selisihQrisEst === 0 ? 'text-emerald-400 font-bold' : selisihQrisEst > 0 ? 'text-amber-400 font-bold' : 'text-rose-400 font-bold'}>
                    {Utils.formatRupiah(selisihQrisEst)}
                  </span>
                </div>
              </div>

              {/* Overall Total */}
              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800 text-white flex justify-between items-center">
                <span className="font-bold">STATUS TOTAL COMBINED:</span>
                <span className={`font-black text-sm ${statusTotalEst === 'PAS' ? 'text-emerald-400' : statusTotalEst === 'LEBIH' ? 'text-amber-400' : 'text-rose-400'}`}>
                  {statusTotalEst}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            Sistem otomatis mencatat hasil audit laci dan QRIS secara transparan sehingga tidak perlu mencampur saldo digital dengan fisik kasir.
          </div>
        </div>
      </div>
    </div>
  );
};

