import React from 'react';
import {
  Printer,
  Lock,
  CheckCircle2,
  AlertCircle,
  Banknote,
  QrCode,
} from 'lucide-react';
import { SoldItemDetail, AuditSession } from '../types';
import { Utils } from '../utils/Utils';

interface RekapHarianViewProps {
  date: string;
  modalAwal: number;
  soldToday: SoldItemDetail[];
  totalOmzet: number;
  totalProfit: number;
  uangSeharusnya: number;
  isClosed: boolean;
  closingSession?: AuditSession | null;
  onNavigate: (route: string) => void;
  onOpenPrintTicket: () => void;
}

export const RekapHarianView: React.FC<RekapHarianViewProps> = ({
  soldToday,
  totalOmzet,
  totalProfit,
  isClosed,
  closingSession,
  onNavigate,
  onOpenPrintTicket,
}) => {
  // Compute Cash and QRIS omzet from today's sold items
  const omzetCashToday = soldToday
    .filter((item) => item.paymentMethod === 'CASH' || !item.paymentMethod)
    .reduce((acc, item) => acc + item.omzet, 0);

  const omzetQrisToday = soldToday
    .filter((item) => item.paymentMethod === 'QRIS')
    .reduce((acc, item) => acc + item.omzet, 0);

  const modalAwalVal = closingSession?.modalAwal ?? 0;
  const cashSeharusnya = modalAwalVal + omzetCashToday;
  const qrisSeharusnya = omzetQrisToday;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            Command: audit cek
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Menu Rekap Harian Penjualan & Audit
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Laporan lengkap penjualan barang, omzet (Tunai & QRIS), profit, dan status audit kasir.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {closingSession && (
            <button
              onClick={onOpenPrintTicket}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-md shadow-blue-600/20"
            >
              <Printer className="w-4 h-4" /> Cetak Struk Rekap
            </button>
          )}

          {!isClosed && (
            <button
              onClick={() => onNavigate('tutup-kas')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20"
            >
              <Lock className="w-4 h-4" /> Proses Tutup Kas
            </button>
          )}
        </div>
      </div>

      {/* Kas Status Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-4 ${
          isClosed
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800'
            : 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800'
        }`}
      >
        <div className="flex items-center gap-3">
          {isClosed ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm">Status Audit Kasir:</h4>
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                  isClosed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 text-white animate-pulse'
                }`}
              >
                {isClosed ? `SUDAH TUTUP KAS (${closingSession?.status})` : 'BELUM TUTUP KAS'}
              </span>
            </div>
            <p className="text-xs opacity-80 mt-0.5">
              {isClosed
                ? `Kas telah ditutup pada jam ${Utils.formatTime(closingSession?.closedAt)}.`
                : 'Proses audit penjualan masih berjalan. Lakukan Tutup Kas untuk verifikasi fisik laci & QRIS.'}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Omzet</p>
          <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {Utils.formatRupiah(totalOmzet)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">{soldToday.length} transaksi hari ini</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase">Omzet Cash (Laci)</p>
            <Banknote className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {Utils.formatRupiah(closingSession?.omzetCash ?? omzetCashToday)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Cash Seharusnya: {Utils.formatRupiah(closingSession?.uangCashSeharusnya ?? cashSeharusnya)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase">Omzet QRIS (Digital)</p>
            <QrCode className="w-4 h-4 text-purple-500" />
          </div>
          <h3 className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {Utils.formatRupiah(closingSession?.omzetQris ?? omzetQrisToday)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            QRIS Seharusnya: {Utils.formatRupiah(closingSession?.uangQrisSeharusnya ?? qrisSeharusnya)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Keuntungan (Profit)</p>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {Utils.formatRupiah(totalProfit)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Margin Keuntungan Bersih</p>
        </div>
      </div>

      {/* Sold Items Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4">
          Detail Barang Terjual Hari Ini
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-extrabold text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Jam</th>
                <th className="p-3">Metode</th>
                <th className="p-3">Nama Barang</th>
                <th className="p-3 text-center">Qty Terjual</th>
                <th className="p-3 text-right">Harga Jual / Pcs</th>
                <th className="p-3 text-right">Total Omzet</th>
                <th className="p-3 text-right">Total Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {soldToday.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Belum ada riwayat barang terjual hari ini.
                  </td>
                </tr>
              ) : (
                soldToday.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 text-slate-500 font-mono">{item.timeOnly}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          item.paymentMethod === 'QRIS'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {item.paymentMethod || 'CASH'}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {item.itemName}
                    </td>
                    <td className="p-3 text-center font-bold">{item.qtySold} PCS</td>
                    <td className="p-3 text-right font-medium">
                      {Utils.formatRupiah(item.hargaJual)}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                      {Utils.formatRupiah(item.omzet)}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      +{Utils.formatRupiah(item.profit)}
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
