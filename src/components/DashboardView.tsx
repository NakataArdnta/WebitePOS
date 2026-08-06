import React from 'react';
import { motion } from 'motion/react';
import {
  Package,
  Boxes,
  TrendingUp,
  DollarSign,
  Wallet,
  Calculator,
  Lock,
  ArrowUpRight,
  ShoppingBag,
  ClipboardCheck,
  Download,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { InventoryItem, SoldItemDetail, AuditSession } from '../types';
import { Utils } from '../utils/Utils';

interface DashboardViewProps {
  inventory: InventoryItem[];
  soldToday: SoldItemDetail[];
  modalAwal: number;
  latestSession: AuditSession | null;
  onNavigate: (route: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  inventory,
  soldToday,
  modalAwal,
  latestSession,
  onNavigate,
}) => {
  // Calculations
  const totalBarang = inventory.length;
  const totalStok = inventory.reduce((sum, item) => sum + item.stock, 0);

  const totalOmzetHariIni = soldToday.reduce((sum, item) => sum + item.omzet, 0);
  const totalProfitHariIni = soldToday.reduce((sum, item) => sum + item.profit, 0);

  const uangSeharusnya = modalAwal + totalOmzetHariIni;
  const uangFisik = latestSession ? latestSession.uangFisik : 0;
  const selisihKas = latestSession ? latestSession.selisih : 0;
  const statusKas = latestSession ? latestSession.status : 'BELUM_TUTUP';

  // Stat cards array
  const statCards = [
    {
      title: 'Total Jenis Barang',
      value: Utils.formatNumber(totalBarang) + ' Jenis',
      sub: 'Item terdaftar dalam sistem',
      icon: Package,
      color: 'from-blue-600 to-indigo-600',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/60',
    },
    {
      title: 'Total Fisik Stok',
      value: Utils.formatNumber(totalStok) + ' PCS',
      sub: 'Tersedia di rak & gudang',
      icon: Boxes,
      color: 'from-cyan-600 to-blue-600',
      textColor: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/60',
    },
    {
      title: 'Omzet Hari Ini',
      value: Utils.formatRupiah(totalOmzetHariIni),
      sub: `${soldToday.length} transaksi tercatat`,
      icon: TrendingUp,
      color: 'from-emerald-600 to-teal-600',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      title: 'Profit Hari Ini',
      value: Utils.formatRupiah(totalProfitHariIni),
      sub: 'Keuntungan bersih',
      icon: DollarSign,
      color: 'from-teal-600 to-emerald-600',
      textColor: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-950/60',
    },
    {
      title: 'Modal Hari Ini',
      value: Utils.formatRupiah(modalAwal),
      sub: 'Laci modal awal warung',
      icon: Wallet,
      color: 'from-indigo-600 to-purple-600',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/60',
    },
    {
      title: 'Uang Seharusnya',
      value: Utils.formatRupiah(uangSeharusnya),
      sub: 'Modal + Total Omzet',
      icon: Calculator,
      color: 'from-amber-600 to-orange-600',
      textColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/60',
    },
    {
      title: 'Uang Fisik Laci',
      value: latestSession ? Utils.formatRupiah(uangFisik) : 'Belum Input',
      sub: latestSession ? 'Hasil hitung laci' : 'Lakukan Tutup Kas',
      icon: Lock,
      color: 'from-blue-600 to-slate-700',
      textColor: 'text-slate-700 dark:text-slate-300',
      bgColor: 'bg-slate-100 dark:bg-slate-800',
    },
    {
      title: 'Selisih Kas',
      value: latestSession ? Utils.formatRupiah(selisihKas) : 'Status: BELUM TUTUP',
      sub: latestSession ? `Status: ${statusKas}` : 'Diperoleh saat tutup kas',
      icon: statusKas === 'PAS' ? CheckCircle2 : AlertCircle,
      color:
        statusKas === 'PAS'
          ? 'from-emerald-600 to-teal-600'
          : statusKas === 'LEBIH'
          ? 'from-amber-600 to-yellow-600'
          : 'from-rose-600 to-red-600',
      textColor:
        statusKas === 'PAS'
          ? 'text-emerald-600'
          : statusKas === 'LEBIH'
          ? 'text-amber-600'
          : 'text-rose-600',
      bgColor:
        statusKas === 'PAS'
          ? 'bg-emerald-50 dark:bg-emerald-950/60'
          : statusKas === 'LEBIH'
          ? 'bg-amber-50 dark:bg-amber-950/60'
          : 'bg-rose-50 dark:bg-rose-950/60',
    },
  ];

  // Top 5 Selling Items
  const topSold = [...soldToday]
    .sort((a, b) => b.qtySold - a.qtySold)
    .slice(0, 5);

  const maxQty = topSold.length > 0 ? Math.max(...topSold.map((s) => s.qtySold)) : 1;

  // Stock breakdown low stock items
  const lowStockItems = inventory.filter((i) => i.stock <= 10);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-600/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md">
              ⚡ POS Dashboard Enterprise
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Audit Warung & Stock Opname
            </h2>
            <p className="text-sm text-blue-100 leading-relaxed">
              Catat stok belanja, hitung sisa barang secara presisi, dan dapatkan rekap otomatis omzet, profit, serta selisih laci kas warung Anda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('hitung-sisa')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-all shadow-lg active:scale-95"
            >
              <ClipboardCheck className="w-4 h-4" />
              Hitung Sisa
            </button>
            <button
              onClick={() => onNavigate('audit-belanja')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-800/60 hover:bg-blue-800/80 text-white font-bold text-sm border border-white/20 transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              Audit Belanja
            </button>
            <button
              onClick={() => onNavigate('tutup-kas')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all shadow-lg active:scale-95"
            >
              <Lock className="w-4 h-4" />
              Tutup Kas
            </button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Sleek Interface Stat Cards (4 main high-impact cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card shadow-soft">
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Barang</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalBarang} <span className="text-xs text-slate-400 font-normal">SKU</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{totalStok} PCS di gudang</p>
        </div>

        <div className="stat-card shadow-soft">
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Omzet Hari Ini</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {Utils.formatRupiah(totalOmzetHariIni)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{soldToday.length} item terjual</p>
        </div>

        <div className="stat-card shadow-soft">
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Profit Estimasi</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {Utils.formatRupiah(totalProfitHariIni)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Keuntungan bersih</p>
        </div>

        <div className="stat-card shadow-soft">
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Uang Seharusnya</div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
            {Utils.formatRupiah(uangSeharusnya)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Modal ({Utils.formatRupiah(modalAwal)}) + Omzet</p>
        </div>
      </div>

      {/* Interactive Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sold Items Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Penjualan Barang Terlaris Hari Ini
              </h3>
              <p className="text-xs text-slate-400">Daftar item dengan kuantitas terjual tertinggi</p>
            </div>
            <button
              onClick={() => onNavigate('rekap-harian')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Lihat Rekap <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {topSold.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Boxes className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Belum ada barang terjual hari ini.</p>
              <p className="text-xs text-slate-500 mt-1">
                Gunakan menu &quot;Hitung Sisa Barang&quot; saat audit toko.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {topSold.map((sold) => {
                const percentage = Math.round((sold.qtySold / maxQty) * 100);
                return (
                  <div key={sold.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800 dark:text-slate-200">{sold.itemName}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {sold.qtySold} PCS ({Utils.formatRupiah(sold.omzet)})
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5 }}
                        className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Low Stock Warning Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Peringatan Stok Menipis (&le; 10 PCS)
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {lowStockItems.length} Barang
              </span>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Seluruh stok barang dalam kondisi aman!
                </p>
                <p className="text-xs text-slate-400">Tidak ada barang yang menipis saat ini.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Harga Jual: {Utils.formatRupiah(item.hargaJual)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
                        Sisa: {item.stock} PCS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('audit-belanja')}
            className="mt-6 w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Tambah Stok Belanja Baru
          </button>
        </div>
      </div>
    </div>
  );
};
