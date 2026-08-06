import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, X, Save, Store, User, MapPin, Phone, Moon, Sun, Key, ShieldCheck, QrCode } from 'lucide-react';
import { AppSettings } from '../types';
import { StorageManager } from '../services/StorageManager';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onClose: () => void;
  onSaveSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSaveSettings,
}) => {
  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeOwner, setStoreOwner] = useState(settings.storeOwner);
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress);
  const [storePhone, setStorePhone] = useState(settings.storePhone);
  const [darkMode, setDarkMode] = useState(settings.darkMode);

  // Digiflazz API Keys
  const [digiflazzUsername, setDigiflazzUsername] = useState(settings.digiflazzUsername || '');
  const [digiflazzApiKey, setDigiflazzApiKey] = useState(settings.digiflazzApiKey || '');
  const [digiflazzIsProduction, setDigiflazzIsProduction] = useState(settings.digiflazzIsProduction || false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      ...settings,
      storeName,
      storeOwner,
      storeAddress,
      storePhone,
      darkMode,
      digiflazzUsername,
      digiflazzApiKey,
      digiflazzIsProduction,
    };
    StorageManager.saveSettings(updated);
    onSaveSettings(updated);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Pengaturan Toko Warung
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nama Toko / Warung
              </label>
              <div className="relative">
                <Store className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nama Pemilik / Kasir
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={storeOwner}
                  onChange={(e) => setStoreOwner(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Alamat Toko
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nomor Telepon
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Digiflazz PPOB Integration Section */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs text-slate-900 dark:text-white">
                  <Key className="w-4 h-4 text-amber-500" />
                  <span>Pengaturan API PPOB (Digiflazz.com)</span>
                </div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={digiflazzIsProduction}
                    onChange={(e) => setDigiflazzIsProduction(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>Mode Live (Production)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Username Digiflazz</label>
                  <input
                    type="text"
                    placeholder="Username Akun Digiflazz"
                    value={digiflazzUsername}
                    onChange={(e) => setDigiflazzUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500">API Key Digiflazz</label>
                  <input
                    type="password"
                    placeholder="dev-xxxxxxxxxxx / prod-xxxxxxxxxxx"
                    value={digiflazzApiKey}
                    onChange={(e) => setDigiflazzApiKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Mode Tampilan Gelap (Dark Mode)
              </span>
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-xl transition-colors ${
                  darkMode ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20"
              >
                <Save className="w-4 h-4" /> Simpan Pengaturan
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
