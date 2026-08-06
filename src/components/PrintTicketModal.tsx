import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Printer, X, Download, Share2 } from 'lucide-react';
import { AuditSession, AppSettings } from '../types';
import { Utils } from '../utils/Utils';
import { ExportManager } from '../services/ExportManager';

interface PrintTicketModalProps {
  isOpen: boolean;
  session: AuditSession | null;
  settings: AppSettings;
  onClose: () => void;
}

export const PrintTicketModal: React.FC<PrintTicketModalProps> = ({
  isOpen,
  session,
  settings,
  onClose,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    if (session) {
      const summaryText = `[AUDIT WARUNG REKAP]
Toko: ${settings.storeName}
Tanggal: ${session.date}
Modal Awal: ${Utils.formatRupiah(session.modalAwal)}
Total Omzet: ${Utils.formatRupiah(session.totalOmzet)}
Total Profit: ${Utils.formatRupiah(session.totalProfit)}
Uang Seharusnya: ${Utils.formatRupiah(session.uangSeharusnya)}
Uang Fisik Laci: ${Utils.formatRupiah(session.uangFisik)}
Selisih Kas: ${Utils.formatRupiah(session.selisih)}
Status: ${session.status}`;

      ExportManager.generateAuditQRCode(summaryText).then((url) => {
        setQrCodeDataUrl(url);
      });
    }
  }, [session, settings]);

  if (!isOpen || !session) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm print:p-0 print:bg-white print:static">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden relative print:shadow-none print:border-none print:max-w-none print:w-full print:rounded-none"
        >
          {/* Header Controls (Hidden during print) */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between print:hidden">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-blue-600" />
              Struk / Tiket Rekap Audit Warung
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak / PDF
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Ticket Area */}
          <div className="p-6 font-mono text-slate-800 dark:text-slate-100 print:text-black print:p-4 text-xs sm:text-sm">
            {/* Store Branding */}
            <div className="text-center border-b border-dashed border-slate-300 dark:border-slate-700 pb-4 mb-4">
              <h2 className="text-lg font-black uppercase tracking-wider">
                {settings.storeName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {settings.storeAddress}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Telp: {settings.storePhone}
              </p>
              <div className="mt-2 inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-xs">
                LAPORAN REKAP STOCK OPNAME & AUDIT LACI
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-1 mb-4 border-b border-dashed border-slate-300 dark:border-slate-700 pb-4">
              <div className="flex justify-between">
                <span>Tanggal Audit:</span>
                <span className="font-bold">{Utils.formatDateIndonesian(session.date)}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu Tutup Kas:</span>
                <span>{session.closedAt ? Utils.formatTime(session.closedAt) : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Pemilik Warung:</span>
                <span>{settings.storeOwner}</span>
              </div>
            </div>

            {/* Sold Items Summary Table */}
            <div className="mb-4">
              <div className="font-bold border-b border-slate-300 dark:border-slate-700 pb-1 mb-2 flex justify-between">
                <span>BARANG TERJUAL</span>
                <span>QTY x HRG | OMZET</span>
              </div>
              {session.soldItems.length === 0 ? (
                <p className="text-center text-slate-400 py-2 italic">
                  Tidak ada barang terjual pada sesi ini.
                </p>
              ) : (
                <div className="space-y-2">
                  {session.soldItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-xs">
                      <div>
                        <p className="font-bold">{item.itemName}</p>
                        <p className="text-slate-500">
                          {item.qtySold} x {Utils.formatRupiah(item.hargaJual)} (Profit: {Utils.formatRupiah(item.profit)})
                        </p>
                      </div>
                      <span className="font-bold text-right">
                        {Utils.formatRupiah(item.omzet)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calculation Totals */}
            <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-3 space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span>Modal Awal Laci:</span>
                <span className="font-semibold">{Utils.formatRupiah(session.modalAwal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Omzet Penjualan:</span>
                <span className="font-semibold">{Utils.formatRupiah(session.totalOmzet)}</span>
              </div>
              <div className="pl-3 text-xs text-slate-500 space-y-0.5 border-l-2 border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span>• Omzet Tunai (Cash):</span>
                  <span>{Utils.formatRupiah(session.omzetCash ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Omzet Digital (QRIS):</span>
                  <span>{Utils.formatRupiah(session.omzetQris ?? 0)}</span>
                </div>
              </div>

              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Total Keuntungan (Profit):</span>
                <span>{Utils.formatRupiah(session.totalProfit)}</span>
              </div>

              {/* Cash Audit Breakdown */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Cash Laci Seharusnya:</span>
                  <span>{Utils.formatRupiah(session.uangCashSeharusnya ?? session.uangSeharusnya)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Cash Fisik Laci (Dihitung):</span>
                  <span>{Utils.formatRupiah(session.uangFisik)}</span>
                </div>
                <div
                  className={`flex justify-between font-bold text-xs ${
                    (session.selisihCash ?? session.selisih) === 0
                      ? 'text-emerald-600'
                      : (session.selisihCash ?? session.selisih) > 0
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  <span>Selisih Cash Laci:</span>
                  <span>{Utils.formatRupiah(session.selisihCash ?? session.selisih)}</span>
                </div>
              </div>

              {/* QRIS Audit Breakdown */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Saldo QRIS Seharusnya:</span>
                  <span>{Utils.formatRupiah(session.uangQrisSeharusnya ?? (session.omzetQris ?? 0))}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Saldo QRIS (Diverifikasi):</span>
                  <span>{Utils.formatRupiah(session.uangQris ?? 0)}</span>
                </div>
                <div
                  className={`flex justify-between font-bold text-xs ${
                    (session.selisihQris ?? 0) === 0
                      ? 'text-emerald-600'
                      : (session.selisihQris ?? 0) > 0
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  <span>Selisih QRIS:</span>
                  <span>{Utils.formatRupiah(session.selisihQris ?? 0)}</span>
                </div>
              </div>

              <div
                className={`flex justify-between font-bold text-sm pt-2 border-t border-slate-300 dark:border-slate-700 ${
                  session.status === 'PAS'
                    ? 'text-emerald-600'
                    : session.status === 'LEBIH'
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                <span>STATUS AUDIT GABUNGAN:</span>
                <span>{session.status}</span>
              </div>
            </div>

            {/* QR Code Verification */}
            {qrCodeDataUrl && (
              <div className="text-center pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
                <img
                  src={qrCodeDataUrl}
                  alt="QR Verifikasi Audit"
                  className="w-28 h-28 mx-auto my-1 border p-1 rounded-lg bg-white"
                />
                <p className="text-[10px] text-slate-400">
                  Scan QR untuk Verifikasi Laporan Digital
                </p>
              </div>
            )}

            <div className="text-center text-[10px] text-slate-400 mt-4">
              --- TERIMA KASIH • SYSTEM AUDIT WARUNG INDEPENDENT ---
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
