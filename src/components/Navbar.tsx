import React from 'react';
import {
  Search,
  RotateCcw,
  Sun,
  Moon,
  Settings,
  ShieldCheck,
  Zap,
  Store,
  Menu,
} from 'lucide-react';
import { AppSettings } from '../types';
import { Utils } from '../utils/Utils';

interface NavbarProps {
  settings: AppSettings;
  isKasClosed: boolean;
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  onUndo: () => void;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onQuickAudit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  isKasClosed,
  onToggleSidebar,
  onOpenSearch,
  onUndo,
  onToggleDarkMode,
  onOpenSettings,
  onQuickAudit,
}) => {
  return (
    <header className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between transition-colors shadow-soft">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="font-bold text-slate-800 dark:text-slate-100 hidden sm:inline">
            {settings.storeName}
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">/</span>
          <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            {Utils.formatDateIndonesian(Utils.getTodayDateString())}
          </span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-sm mx-4 hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-colors text-xs border border-transparent"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Cari barang / transaksi...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[10px] font-bold text-slate-400">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={onUndo}
          title="Undo Perubahan"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">Undo</span>
        </button>

        <button
          onClick={onQuickAudit}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/20 active:scale-95"
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Hitung Sisa</span>
        </button>

        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={settings.darkMode ? 'Mode Terang' : 'Mode Gelap'}
        >
          {settings.darkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Pengaturan Aplikasi"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Operator Avatar Badge from design */}
        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 flex items-center justify-center font-extrabold text-xs text-slate-700 dark:text-slate-200 shadow-sm ml-1">
          {settings.storeOwner ? settings.storeOwner.slice(0, 2).toUpperCase() : 'OP'}
        </div>
      </div>
    </header>
  );
};
