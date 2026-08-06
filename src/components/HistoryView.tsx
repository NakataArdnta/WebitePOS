import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Calendar,
  Printer,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { AuditSession, AppSettings } from '../types';
import { AuditManager } from '../services/AuditManager';
import { Utils } from '../utils/Utils';

interface HistoryViewProps {
  auditSessions: AuditSession[];
  settings: AppSettings;
  onOpenPrintTicket: (session: AuditSession) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  auditSessions,
  settings,
  onOpenPrintTicket,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [detailSession, setDetailSession] = useState<AuditSession | null>(null);

  const filteredSessions = AuditManager.getAuditHistory(
    selectedYear,
    selectedMonth,
    selectedStatus,
    searchQuery
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
          Arsip & Audit Log
        </span>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          Menu Riwayat Audit Warung
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Seluruh histori rekap harian, tutup kas, dan selisih laporan toko tersimpan rapi.
        </p>
      </div>

      {/* Filter Controls Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
          <Filter className="w-4 h-4 text-purple-600" />
          Filter Data Riwayat
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Query */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">
              Cari Kata Kunci:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari barang / tanggal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>

          {/* Filter Status */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">
              Status Audit:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="ALL">Semua Status (PAS/LEBIH/MINUS)</option>
              <option value="PAS">PAS (Cocok)</option>
              <option value="LEBIH">LEBIH (Kelebihan Uang)</option>
              <option value="MINUS">MINUS (Kekurangan Uang)</option>
            </select>
          </div>

          {/* Filter Year */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">
              Tahun:
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="">Semua Tahun</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          {/* Filter Month */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">
              Bulan:
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="">Semua Bulan</option>
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-extrabold text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Tanggal Audit</th>
                <th className="p-3 text-right">Modal Awal</th>
                <th className="p-3 text-right">Total Omzet</th>
                <th className="p-3 text-right">Total Profit</th>
                <th className="p-3 text-right">Uang Fisik</th>
                <th className="p-3 text-right">Selisih</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Tidak ada data riwayat audit yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {Utils.formatDateIndonesian(session.date)}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {Utils.formatRupiah(session.modalAwal)}
                    </td>
                    <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">
                      {Utils.formatRupiah(session.totalOmzet)}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {Utils.formatRupiah(session.totalProfit)}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {Utils.formatRupiah(session.uangFisik)}
                    </td>
                    <td
                      className={`p-3 text-right font-extrabold ${
                        session.selisih === 0
                          ? 'text-emerald-600'
                          : session.selisih > 0
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {Utils.formatRupiah(session.selisih)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${Utils.getStatusBadgeClass(
                          session.status
                        )}`}
                      >
                        {session.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setDetailSession(session)}
                          title="Lihat Detail"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenPrintTicket(session)}
                          title="Cetak Struk"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Audit Session Modal */}
      {detailSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Detail Audit Tanggal {Utils.formatDateIndonesian(detailSession.date)}
              </h3>
              <button
                onClick={() => setDetailSession(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-slate-400">Modal Awal:</p>
                  <p className="font-bold text-sm">{Utils.formatRupiah(detailSession.modalAwal)}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-slate-400">Total Omzet:</p>
                  <p className="font-bold text-sm text-blue-600">{Utils.formatRupiah(detailSession.totalOmzet)}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-slate-400">Total Profit:</p>
                  <p className="font-bold text-sm text-emerald-600">{Utils.formatRupiah(detailSession.totalProfit)}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-slate-400">Selisih Kas ({detailSession.status}):</p>
                  <p className="font-bold text-sm text-amber-600">{Utils.formatRupiah(detailSession.selisih)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold mb-2">Barang Terjual ({detailSession.soldItems.length})</h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto border rounded-xl p-2">
                  {detailSession.soldItems.map((s, i) => (
                    <div key={i} className="flex justify-between p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <span>{s.itemName} ({s.qtySold} PCS)</span>
                      <span className="font-bold">{Utils.formatRupiah(s.omzet)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  onOpenPrintTicket(detailSession);
                  setDetailSession(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
