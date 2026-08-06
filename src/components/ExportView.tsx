import React, { useRef } from 'react';
import { motion } from 'motion/react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  Upload,
  RotateCcw,
  ShieldAlert,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { ExportManager } from '../services/ExportManager';
import { StorageManager } from '../services/StorageManager';

interface ExportViewProps {
  onRefresh: () => void;
  onShowToast: (
    type: 'success' | 'error' | 'warning' | 'info',
    msg: string,
    desc?: string
  ) => void;
  onRequestConfirm: (
    title: string,
    msg: string,
    onConfirm: () => void
  ) => void;
}

export const ExportView: React.FC<ExportViewProps> = ({
  onRefresh,
  onShowToast,
  onRequestConfirm,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportExcel = () => {
    try {
      ExportManager.exportExcel();
      onShowToast(
        'success',
        'Export Excel Berhasil!',
        'File Excel dengan 3 Sheet profesional telah diunduh.'
      );
    } catch (err) {
      onShowToast('error', 'Gagal melakukan export Excel.');
    }
  };

  const handleExportCSV = () => {
    try {
      ExportManager.exportCSV();
      onShowToast('success', 'Export CSV Berhasil!');
    } catch (err) {
      onShowToast('error', 'Gagal export CSV.');
    }
  };

  const handleExportJSON = () => {
    try {
      ExportManager.exportJSON();
      onShowToast('success', 'Backup JSON Berhasil Diunduh!');
    } catch (err) {
      onShowToast('error', 'Gagal export JSON.');
    }
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onRequestConfirm(
          'Restore Database Backup',
          'Apakah Anda yakin ingin memulihkan database dari file JSON ini? Seluruh data saat ini akan ditimpa.',
          () => {
            const success = StorageManager.importFullBackup(content);
            if (success) {
              onShowToast('success', 'Restore Database Berhasil!');
              onRefresh();
            } else {
              onShowToast('error', 'Format file JSON backup tidak valid.');
            }
          }
        );
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    onRequestConfirm(
      'Hapus Total Seluruh Data (Kosongkan)',
      'PERINGATAN! Seluruh data barang, stok, modal, dan riwayat audit (history) akan DIHAPUS TOTAL menjadi 0. Anda bisa memasukkan data barang Anda sendiri dari awal.',
      () => {
        StorageManager.clearAllData();
        onShowToast('info', 'Seluruh data berhasil dikosongkan (0 Data).');
        onRefresh();
      }
    );
  };

  const handleResetDatabase = () => {
    onRequestConfirm(
      'Reset ke Data Sampel Warung',
      'PERINGATAN! Data saat ini akan digantikan dengan data sampel warung default.',
      () => {
        StorageManager.resetDatabase();
        onShowToast('info', 'Database dikembalikan ke data sampel warung.');
        onRefresh();
      }
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          Pusat Export & Laporan
        </span>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          Menu Export & Backup Database
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Unduh laporan Excel 3 Sheet, backup JSON, atau restore data kapan saja secara offline.
        </p>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Excel Multi Sheet Card */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Excel (.xlsx) Multi-Sheet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Dilengkapi 3 Sheet profesional:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 mt-2 list-disc list-inside">
              <li>Sheet 1: Rekap Audit Harian</li>
              <li>Sheet 2: Detail Barang Terjual</li>
              <li>Sheet 3: Inventaris Stok Gudang</li>
            </ul>
          </div>

          <button
            onClick={handleExportExcel}
            className="mt-6 w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Excel Multi-Sheet
          </button>
        </motion.div>

        {/* CSV Export Card */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              CSV Inventory Standard
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Export data inventaris stok gudang ke format CSV yang kompatibel dengan aplikasi spreadsheet lainnya.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="mt-6 w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV Data
          </button>
        </motion.div>

        {/* JSON Backup Card */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 flex items-center justify-center mb-4">
              <FileCode className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Full Backup JSON
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Simpan seluruh database aplikasi (Stok, Riwayat Audit, Modal) dalam 1 file JSON ringan.
            </p>
          </div>

          <button
            onClick={handleExportJSON}
            className="mt-6 w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-md shadow-purple-600/20 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Backup JSON
          </button>
        </motion.div>
      </div>

      {/* Restore & Reset Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Restore Database Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Restore Database JSON
              </h3>
              <p className="text-xs text-slate-400">Pulihkan data toko dari file cadangan</p>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleFileRestore}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" /> Pilih File JSON Backup
          </button>
        </div>

        {/* Clear All Data To 0 Card */}
        <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Kosongkan Data (Hapus ke 0)
              </h3>
              <p className="text-xs text-slate-400">Hapus semua stok, modal & history ke 0</p>
            </div>
          </div>

          <button
            onClick={handleClearAllData}
            className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-md shadow-rose-600/20"
          >
            <Trash2 className="w-4 h-4" /> Hapus Total Ke 0
          </button>
        </div>

        {/* Reset Sampel Database Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Reset Data Sampel
              </h3>
              <p className="text-xs text-slate-400">Kembalikan ke barang contoh warung</p>
            </div>
          </div>

          <button
            onClick={handleResetDatabase}
            className="w-full py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:hover:bg-amber-950 text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-amber-200 dark:border-amber-800"
          >
            <RotateCcw className="w-4 h-4" /> Reset ke Sampel Demo
          </button>
        </div>
      </div>
    </div>
  );
};
