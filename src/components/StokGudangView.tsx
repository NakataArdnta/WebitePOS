import React, { useState } from 'react';
import {
  Package,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Boxes,
  TrendingUp,
} from 'lucide-react';
import { InventoryItem } from '../types';
import { InventoryManager } from '../services/InventoryManager';
import { Utils } from '../utils/Utils';

interface StokGudangViewProps {
  inventory: InventoryItem[];
}

export const StokGudangView: React.FC<StokGudangViewProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'modal' | 'profit'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleSort = (field: 'name' | 'stock' | 'modal' | 'profit') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filtered = InventoryManager.getItems(searchQuery, sortBy, sortOrder);

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

  const totalPotensiProfitSemua = filtered.reduce((sum, item) => sum + item.potensiProfit, 0);
  const totalStokSemua = filtered.reduce((sum, item) => sum + item.stock, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
            Katalog Inventaris
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Menu Stok Gudang Warung
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pemantauan seluruh persediaan barang, margin harga modal, dan potensi profit.
          </p>
        </div>

        {/* Quick Summaries */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-extrabold">Total Fisik Stok</p>
            <p className="text-sm font-black text-cyan-600 dark:text-cyan-400">
              {Utils.formatNumber(totalStokSemua)} PCS
            </p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-extrabold">Total Potensi Profit</p>
            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {Utils.formatRupiah(totalPotensiProfitSemua)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama barang atau stok..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="text-xs text-slate-500">
            Menampilkan <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> barang
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-extrabold text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white"
                  >
                    Nama Barang <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-3 text-center">
                  <button
                    onClick={() => handleSort('stock')}
                    className="flex items-center gap-1.5 mx-auto hover:text-slate-900 dark:hover:text-white"
                  >
                    Stok Tersedia <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-3 text-right">
                  <button
                    onClick={() => handleSort('modal')}
                    className="flex items-center gap-1.5 ml-auto hover:text-slate-900 dark:hover:text-white"
                  >
                    Harga Modal <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-3 text-right">Harga Jual</th>
                <th className="p-3 text-right">Profit / PCS</th>
                <th className="p-3 text-right">
                  <button
                    onClick={() => handleSort('profit')}
                    className="flex items-center gap-1.5 ml-auto hover:text-slate-900 dark:hover:text-white"
                  >
                    Potensi Profit <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Barang tidak ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const profitPerPcs = item.hargaJual - item.modalSatuan;
                  const isLowStock = item.stock <= 10;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{item.name}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`font-bold px-2.5 py-1 rounded-lg text-xs ${
                            isLowStock
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {item.stock} PCS
                        </span>
                      </td>
                      <td className="p-3 text-right font-medium text-slate-600 dark:text-slate-300">
                        {Utils.formatRupiah(item.modalSatuan)}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {Utils.formatRupiah(item.hargaJual)}
                      </td>
                      <td className="p-3 text-right font-semibold text-teal-600 dark:text-teal-400">
                        +{Utils.formatRupiah(profitPerPcs)}
                      </td>
                      <td className="p-3 text-right font-extrabold text-blue-600 dark:text-blue-400">
                        {Utils.formatRupiah(item.potensiProfit)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500">
              Halaman <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> dari {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
