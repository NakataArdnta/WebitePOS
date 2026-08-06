import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  DollarSign,
  Package,
  ClipboardCheck,
  Receipt,
  Lock,
  History,
  Download,
  X,
  Store,
} from 'lucide-react';

interface SidebarProps {
  activeRoute: string;
  isOpen: boolean;
  onNavigate: (route: string) => void;
  onCloseMobile: () => void;
  unclosedWarning?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeRoute,
  isOpen,
  onNavigate,
  onCloseMobile,
  unclosedWarning = false,
}) => {
  const menuSections = [
    {
      title: 'UTAMA & TRANSAKSI',
      items: [
        {
          id: 'pos-kasir',
          label: 'Kasir POS Utama',
          icon: ShoppingCart,
          desc: 'Kasir Penjualan Retail & Struk',
          badge: 'POS',
        },
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          desc: 'Ringkasan & Analisis Toko',
        },
      ],
    },
    {
      title: 'KATEGORI AUDIT TOKO',
      items: [
        {
          id: 'audit-belanja',
          label: 'Audit Belanja',
          icon: ShoppingBag,
          desc: 'Tambah Stok & Pembelian',
        },
        {
          id: 'modal-harian',
          label: 'Modal Harian',
          icon: DollarSign,
          desc: 'Input Modal Cash Starter',
        },
        {
          id: 'hitung-sisa',
          label: 'Hitung Sisa Barang',
          icon: ClipboardCheck,
          desc: 'Stock Opname Fisik',
        },
        {
          id: 'rekap-harian',
          label: 'Rekap Penjualan',
          icon: Receipt,
          desc: 'Cek Omzet & Cash/QRIS',
        },
        {
          id: 'tutup-kas',
          label: 'Tutup Kas (Dual Audit)',
          icon: Lock,
          desc: 'Audit Cash Laci & QRIS',
          badge: unclosedWarning ? 'Belum Tutup' : undefined,
        },
        {
          id: 'history',
          label: 'History Audit',
          icon: History,
          desc: 'Riwayat Struk & Sesi',
        },
      ],
    },
    {
      title: 'INVENTARIS & BACKUP',
      items: [
        {
          id: 'stok-gudang',
          label: 'Stok Gudang',
          icon: Package,
          desc: 'Katalog & Harga Barang',
        },
        {
          id: 'export',
          label: 'Export & Backup',
          icon: Download,
          desc: 'Excel & Backup JSON',
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-soft ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0">
          {/* Logo Branding */}
          <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-3 text-blue-600 font-extrabold text-lg tracking-tight">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-600/30">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-slate-900 dark:text-white font-black text-xl">
                POS<span className="text-blue-600">AUDIT</span>
              </span>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sections */}
          <nav className="px-3 py-4 space-y-5 flex-1 overflow-y-auto">
            {menuSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <p className="px-3 pb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {section.title}
                </p>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeRoute === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 group text-left ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`p-1 rounded-lg shrink-0 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs leading-none font-bold truncate">{item.label}</p>
                          <p
                            className={`text-[9px] truncate mt-0.5 ${
                              isActive
                                ? 'text-blue-100'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-amber-500 text-white animate-pulse'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer status card from Sleek Interface design */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/60">
          <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 p-3.5 rounded-2xl">
            <div className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
              Status Kas Hari Ini
            </div>
            <div className="flex items-center text-xs font-bold text-blue-900 dark:text-blue-200">
              <span
                className={`w-2 h-2 rounded-full mr-2 shrink-0 ${
                  unclosedWarning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'
                }`}
              />
              {unclosedWarning ? 'BELUM TUTUP KAS' : 'SUDAH TUTUP KAS'}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
