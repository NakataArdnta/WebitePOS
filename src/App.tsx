import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { PosKasirView } from './components/PosKasirView';
import { AuditBelanjaView } from './components/AuditBelanjaView';
import { ModalHarianView } from './components/ModalHarianView';
import { StokGudangView } from './components/StokGudangView';
import { HitungSisaView } from './components/HitungSisaView';
import { RekapHarianView } from './components/RekapHarianView';
import { TutupKasView } from './components/TutupKasView';
import { HistoryView } from './components/HistoryView';
import { ExportView } from './components/ExportView';
import { ToastContainer } from './components/ToastContainer';
import { ConfirmModal } from './components/ConfirmModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { SettingsModal } from './components/SettingsModal';
import { PrintTicketModal } from './components/PrintTicketModal';

import {
  InventoryItem,
  DailyModal,
  AuditSession,
  SoldItemDetail,
  AppSettings,
  ToastMessage,
} from './types';
import { StorageManager } from './services/StorageManager';
import { AuditManager } from './services/AuditManager';
import { Utils } from './utils/Utils';
import { ClipboardCheck, Plus, Lock } from 'lucide-react';

export default function App() {
  // Navigation Route State
  const [activeRoute, setActiveRoute] = useState<string>('pos-kasir');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // App Data States
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [dailyModals, setDailyModals] = useState<DailyModal[]>([]);
  const [auditSessions, setAuditSessions] = useState<AuditSession[]>([]);
  const [soldHistory, setSoldHistory] = useState<SoldItemDetail[]>([]);
  const [settings, setSettings] = useState<AppSettings>(StorageManager.getSettings());

  // UI Modals & Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [printSession, setPrintSession] = useState<AuditSession | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [selectedAuditItemId, setSelectedAuditItemId] = useState<string | null>(null);

  // Confirm Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Refresh all data from Storage
  const refreshData = useCallback(() => {
    setInventory(StorageManager.getInventory());
    setDailyModals(StorageManager.getDailyModals());
    setAuditSessions(StorageManager.getAuditSessions());
    setSoldHistory(StorageManager.getSoldHistory());
    setSettings(StorageManager.getSettings());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Dark Mode Sync with html element
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Toast Helper
  const showToast = useCallback(
    (
      type: 'success' | 'error' | 'warning' | 'info',
      message: string,
      description?: string
    ) => {
      const id = Utils.generateId('toast');
      const newToast: ToastMessage = { id, type, message, description };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Undo Last Action
  const handleUndo = useCallback(() => {
    const action = StorageManager.undoLastAction();
    if (action) {
      showToast('info', 'Undo Perubahan Berhasil', action.description);
      refreshData();
    } else {
      showToast('warning', 'Tidak ada riwayat perubahan yang dapat dibatalkan.');
    }
  }, [refreshData, showToast]);

  // Keyboard Shortcuts (Ctrl+K for Search, Ctrl+Z for Undo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        // Prevent undo when typing in text inputs
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleUndo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

  // Confirm Request Trigger
  const requestConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Computations for current day rekap
  const todayStr = Utils.getTodayDateString();
  const rekapToday = AuditManager.getRekapHarian(todayStr);
  const latestSessionToday = auditSessions.find((s) => s.date === todayStr) || null;

  // Open Print Ticket
  const handleOpenPrintTicket = (session?: AuditSession | null) => {
    const sessionToPrint = session || latestSessionToday || {
      id: 'live',
      date: rekapToday.date,
      modalAwal: rekapToday.modalAwal,
      totalOmzet: rekapToday.totalOmzet,
      totalProfit: rekapToday.totalProfit,
      uangSeharusnya: rekapToday.uangSeharusnya,
      uangFisik: 0,
      selisih: 0,
      status: 'BELUM_TUTUP' as const,
      soldItems: rekapToday.soldItems,
      isClosed: false,
    };

    setPrintSession(sessionToPrint);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        isKasClosed={rekapToday.isClosed}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onUndo={handleUndo}
        onToggleDarkMode={() => {
          const updated = { ...settings, darkMode: !settings.darkMode };
          StorageManager.saveSettings(updated);
          setSettings(updated);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onQuickAudit={() => setActiveRoute('hitung-sisa')}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 py-6 gap-6">
        {/* Navigation Sidebar */}
        <Sidebar
          activeRoute={activeRoute}
          isOpen={isSidebarOpen}
          onNavigate={(route) => setActiveRoute(route)}
          onCloseMobile={() => setIsSidebarOpen(false)}
          unclosedWarning={!rekapToday.isClosed}
        />

        {/* Main Content Body */}
        <main className="flex-1 min-w-0">
          {activeRoute === 'pos-kasir' && (
            <PosKasirView
              inventory={inventory}
              settings={settings}
              onRefresh={refreshData}
              onShowToast={showToast}
              onRequestConfirm={requestConfirm}
            />
          )}

          {activeRoute === 'dashboard' && (
            <DashboardView
              inventory={inventory}
              soldToday={rekapToday.soldItems}
              modalAwal={rekapToday.modalAwal}
              latestSession={latestSessionToday}
              onNavigate={(route) => setActiveRoute(route)}
            />
          )}

          {activeRoute === 'audit-belanja' && (
            <AuditBelanjaView
              inventory={inventory}
              onRefresh={refreshData}
              onShowToast={showToast}
              onRequestConfirm={requestConfirm}
            />
          )}

          {activeRoute === 'modal-harian' && (
            <ModalHarianView
              dailyModals={dailyModals}
              todayModalNominal={rekapToday.modalAwal}
              onRefresh={refreshData}
              onShowToast={showToast}
            />
          )}

          {activeRoute === 'stok-gudang' && (
            <StokGudangView inventory={inventory} />
          )}

          {activeRoute === 'hitung-sisa' && (
            <HitungSisaView
              inventory={inventory}
              preselectedItemId={selectedAuditItemId}
              onRefresh={refreshData}
              onShowToast={showToast}
            />
          )}

          {activeRoute === 'rekap-harian' && (
            <RekapHarianView
              date={rekapToday.date}
              modalAwal={rekapToday.modalAwal}
              soldToday={rekapToday.soldItems}
              totalOmzet={rekapToday.totalOmzet}
              totalProfit={rekapToday.totalProfit}
              uangSeharusnya={rekapToday.uangSeharusnya}
              isClosed={rekapToday.isClosed}
              closingSession={latestSessionToday}
              onNavigate={(route) => setActiveRoute(route)}
              onOpenPrintTicket={() => handleOpenPrintTicket()}
            />
          )}

          {activeRoute === 'tutup-kas' && (
            <TutupKasView
              rekap={rekapToday}
              onRefresh={refreshData}
              onOpenPrintTicket={(session) => handleOpenPrintTicket(session)}
              onShowToast={showToast}
            />
          )}

          {activeRoute === 'history' && (
            <HistoryView
              auditSessions={auditSessions}
              settings={settings}
              onOpenPrintTicket={(session) => handleOpenPrintTicket(session)}
            />
          )}

          {activeRoute === 'export' && (
            <ExportView
              onRefresh={refreshData}
              onShowToast={showToast}
              onRequestConfirm={requestConfirm}
            />
          )}
        </main>
      </div>

      {/* Floating Action Button (FAB) for Quick Audit */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setActiveRoute('hitung-sisa')}
          className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-black text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-blue-600/40"
        >
          <ClipboardCheck className="w-5 h-5" />
          <span className="hidden sm:inline">Hitung Sisa (Audit)</span>
        </button>
      </div>

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} onUndo={handleUndo} />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Global Search Modal (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(route) => setActiveRoute(route)}
        onSelectItemForAudit={(itemId) => {
          setSelectedAuditItemId(itemId);
          setActiveRoute('hitung-sisa');
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          showToast('success', 'Pengaturan toko berhasil disimpan.');
        }}
      />

      {/* Printable Ticket Modal */}
      <PrintTicketModal
        isOpen={isPrintModalOpen}
        session={printSession}
        settings={settings}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
}
