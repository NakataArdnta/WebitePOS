import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Upload,
  Download,
  AlertCircle,
  Package,
  Calculator,
  Save,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';
import { InventoryItem } from '../types';
import { InventoryManager } from '../services/InventoryManager';
import { Utils } from '../utils/Utils';

interface AuditBelanjaViewProps {
  inventory: InventoryItem[];
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

export const AuditBelanjaView: React.FC<AuditBelanjaViewProps> = ({
  inventory,
  onRefresh,
  onShowToast,
  onRequestConfirm,
}) => {
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [stock, setStock] = useState<number | ''>('');
  const [totalModal, setTotalModal] = useState<number | ''>('');
  const [hargaJual, setHargaJual] = useState<number | ''>('');

  // Table Search & Select State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Computed modal per pcs
  const computedStock = typeof stock === 'number' && stock > 0 ? stock : 0;
  const computedTotalModal = typeof totalModal === 'number' && totalModal > 0 ? totalModal : 0;
  const modalSatuan = computedStock > 0 ? Math.round(computedTotalModal / computedStock) : 0;
  const computedHargaJual = typeof hargaJual === 'number' ? hargaJual : 0;
  const potensiProfit = (computedHargaJual - modalSatuan) * computedStock;

  // Handle Submit (Create or Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      onShowToast('error', 'Nama barang tidak boleh kosong');
      return;
    }
    if (typeof stock !== 'number' || stock <= 0) {
      onShowToast('error', 'Jumlah barang harus lebih dari 0');
      return;
    }
    if (typeof totalModal !== 'number' || totalModal < 0) {
      onShowToast('error', 'Total modal pembelian tidak valid');
      return;
    }
    if (typeof hargaJual !== 'number' || hargaJual < 0) {
      onShowToast('error', 'Harga jual per PCS tidak valid');
      return;
    }

    if (editingId) {
      const res = InventoryManager.updateItem(
        editingId,
        name,
        stock,
        totalModal,
        hargaJual
      );
      if (res.success) {
        onShowToast('success', res.message);
        resetForm();
        onRefresh();
      } else {
        onShowToast('error', res.message);
      }
    } else {
      const res = InventoryManager.addBelanjaItem(
        name,
        stock,
        totalModal,
        hargaJual
      );
      if (res.success) {
        onShowToast('success', res.message);
        resetForm();
        onRefresh();
      } else {
        onShowToast('error', res.message);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setStock('');
    setTotalModal('');
    setHargaJual('');
  };

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setName(item.name);
    setStock(item.stock);
    setTotalModal(item.totalModalPembelian || item.stock * item.modalSatuan);
    setHargaJual(item.hargaJual);
  };

  const handleDelete = (id: string, itemName: string) => {
    onRequestConfirm(
      'Hapus Barang',
      `Apakah Anda yakin ingin menghapus "${itemName}" dari inventaris?`,
      () => {
        const res = InventoryManager.deleteItem(id);
        if (res.success) {
          onShowToast('success', res.message);
          onRefresh();
        } else {
          onShowToast('error', res.message);
        }
      }
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    onRequestConfirm(
      'Hapus Banyak Barang',
      `Apakah Anda yakin ingin menghapus ${selectedIds.length} barang yang dipilih?`,
      () => {
        const res = InventoryManager.deleteMultipleItems(selectedIds);
        if (res.success) {
          onShowToast('success', res.message);
          setSelectedIds([]);
          onRefresh();
        } else {
          onShowToast('error', res.message);
        }
      }
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredItems = InventoryManager.getItems(searchQuery);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            Command: audit belanja
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Menu Audit Belanja / Input Stok Masuk
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Input barang baru atau penambahan stok kulakan warung Anda.
          </p>
        </div>
      </div>

      {/* Form Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm"
      >
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            {editingId ? 'Edit Data Barang' : 'Form Audit Belanja Barang Baru'}
          </h3>
          {editingId && (
            <button
              onClick={resetForm}
              className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Batal Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Field: Nama Barang */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Nama Barang <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Indomie Goreng Spesial"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium"
            />
          </div>

          {/* Field: Jumlah Barang */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Jumlah Barang (PCS) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              placeholder="Contoh: 50"
              value={stock}
              onChange={(e) =>
                setStock(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))
              }
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium"
            />
          </div>

          {/* Field: Total Modal Pembelian */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Total Modal Pembelian (Rp) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="Contoh: 140000"
              value={totalModal}
              onChange={(e) =>
                setTotalModal(
                  e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0)
                )
              }
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium"
            />
          </div>

          {/* Field: Harga Jual per PCS */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Harga Jual per PCS (Rp) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="Contoh: 3500"
              value={hargaJual}
              onChange={(e) =>
                setHargaJual(
                  e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0)
                )
              }
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium"
            />
          </div>

          {/* Automatic Computations Display Box */}
          <div className="md:col-span-2 bg-blue-50/70 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <p className="text-slate-500 dark:text-slate-400">Modal Satuan per PCS:</p>
              <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                {Utils.formatRupiah(modalSatuan)}
              </p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Estimasi Potensi Profit Total:</p>
              <p
                className={`text-sm font-bold ${
                  potensiProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                }`}
              >
                {Utils.formatRupiah(potensiProfit)}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95"
            >
              {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingId ? 'Simpan Perubahan' : 'Simpan Belanja'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Inventory Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Daftar Barang Belanja ({filteredItems.length})
            </h3>
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold text-xs hover:bg-rose-200 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus {selectedIds.length} Terpilih
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-extrabold text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3 w-10 text-center">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600">
                    {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-3">Nama Barang</th>
                <th className="p-3 text-center">Stok</th>
                <th className="p-3 text-right">Modal Satuan</th>
                <th className="p-3 text-right">Harga Jual</th>
                <th className="p-3 text-right">Potensi Profit</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ada data barang belanja. Silakan input menggunakan form di atas.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleSelectOne(item.id)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.stock} PCS
                        </span>
                      </td>
                      <td className="p-3 text-right font-medium text-slate-600 dark:text-slate-300">
                        {Utils.formatRupiah(item.modalSatuan)}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {Utils.formatRupiah(item.hargaJual)}
                      </td>
                      <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">
                        {Utils.formatRupiah(item.potensiProfit)}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => startEdit(item)}
                            title="Edit Barang"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            title="Hapus Barang"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
