import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Banknote,
  QrCode,
  CheckCircle2,
  Printer,
  Package,
  X,
  UserCheck,
  Barcode,
  Clock,
  Key,
  CreditCard,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { InventoryItem, PosCartItem, AppSettings } from '../types';
import { Utils } from '../utils/Utils';
import { StorageManager } from '../services/StorageManager';
import { QrisModal } from './QrisModal';

interface PosKasirViewProps {
  inventory: InventoryItem[];
  settings: AppSettings;
  onRefresh: () => void;
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', msg: string, desc?: string) => void;
  onRequestConfirm: (title: string, msg: string, onConfirm: () => void) => void;
}

export const PosKasirView: React.FC<PosKasirViewProps> = ({
  inventory,
  settings,
  onRefresh,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS'>('CASH');
  const [cashGiven, setCashGiven] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>('');
  const [memberId, setMemberId] = useState<string>('');

  // Fast Barcode Scanner input
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cashInputRef = useRef<HTMLInputElement>(null);

  // Live Clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F2') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      } else if (e.key === 'F5') {
        e.preventDefault();
        setPaymentMethod('CASH');
        cashInputRef.current?.focus();
      } else if (e.key === 'F6') {
        e.preventDefault();
        setPaymentMethod('QRIS');
      } else if (e.key === 'Escape') {
        if (cart.length > 0) {
          e.preventDefault();
          setCart([]);
          onShowToast('info', 'Keranjang kasir direset');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, onShowToast]);

  // QRIS Modal state
  const [showQrisModal, setShowQrisModal] = useState<boolean>(false);
  const [qrisOrderId, setQrisOrderId] = useState<string>('');
  const [checkoutResult, setCheckoutResult] = useState<{
    items: PosCartItem[];
    subtotal: number;
    discount: number;
    total: number;
    cashGiven: number;
    change: number;
    paymentMethod: 'CASH' | 'QRIS';
    timestamp: string;
    receiptId: string;
    customerName?: string;
    memberId?: string;
  } | null>(null);

  // Auto detect categories from inventory
  const categories = useMemo(() => {
    const setCat = new Set<string>();
    setCat.add('ALL');
    inventory.forEach((item) => {
      if (item.category) setCat.add(item.category);
    });
    return Array.from(setCat);
  }, [inventory]);

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCat =
        selectedCategory === 'ALL' || item.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [inventory, searchTerm, selectedCategory]);

  // Cart calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.subtotal, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - discount);
  }, [cartSubtotal, discount]);

  const cashNumber = parseFloat(cashGiven) || 0;
  const changeAmount = paymentMethod === 'CASH' ? Math.max(0, cashNumber - cartTotal) : 0;

  // Add Item to Cart
  const addToCart = (item: InventoryItem) => {
    if (item.stock <= 0) {
      onShowToast('warning', `Stok barang ${item.name} sudah habis!`);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.itemId === item.id);
      if (existing) {
        if (existing.qty + 1 > item.stock) {
          onShowToast('warning', `Stok tidak mencukupi (Tersisa ${item.stock})`);
          return prevCart;
        }
        return prevCart.map((c) =>
          c.itemId === item.id
            ? { ...c, qty: c.qty + 1, subtotal: (c.qty + 1) * c.hargaJual }
            : c
        );
      } else {
        return [
          ...prevCart,
          {
            id: Utils.generateId('cart_item'),
            itemId: item.id,
            name: item.name,
            type: 'RETAIL',
            hargaJual: item.hargaJual,
            modalSatuan: item.modalSatuan,
            qty: 1,
            subtotal: item.hargaJual,
            category: item.category,
          },
        ];
      }
    });
  };

  // Fast Barcode Submit
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const query = barcodeInput.trim().toLowerCase();
    const matchedItem = inventory.find(
      (item) =>
        (item.code && item.code.toLowerCase() === query) ||
        item.name.toLowerCase() === query ||
        item.name.toLowerCase().includes(query)
    );

    if (matchedItem) {
      addToCart(matchedItem);
      setBarcodeInput('');
      onShowToast('success', `[SCAN] ${matchedItem.name}`, `Ditambahkan 1x ke keranjang POSMAIN.`);
    } else {
      onShowToast('error', 'Barang tidak ditemukan!', `Kode barcode "${barcodeInput}" tidak ada di gudang.`);
    }
  };

  // Update Cart Qty
  const updateCartQty = (cartId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartId);
      return;
    }

    const cartItem = cart.find((c) => c.id === cartId);
    if (!cartItem) return;

    const inventoryItem = inventory.find((i) => i.id === cartItem.itemId);
    if (inventoryItem && newQty > inventoryItem.stock) {
      onShowToast('warning', `Stok ${inventoryItem.name} hanya tersisa ${inventoryItem.stock}`);
      return;
    }

    setCart((prev) =>
      prev.map((c) =>
        c.id === cartId
          ? { ...c, qty: newQty, subtotal: newQty * c.hargaJual }
          : c
      )
    );
  };

  // Remove from cart
  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((c) => c.id !== cartId));
  };

  // Process Checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      onShowToast('error', 'Keranjang kasir masih kosong!');
      return;
    }

    if (paymentMethod === 'CASH' && cashNumber < cartTotal) {
      onShowToast('error', 'Jumlah uang tunai kurang dari total bayar!');
      return;
    }

    if (paymentMethod === 'QRIS') {
      const orderId = `POSMAIN-QRIS-${Date.now()}`;
      setQrisOrderId(orderId);
      setShowQrisModal(true);
      return;
    }

    finalizeCheckout();
  };

  const finalizeCheckout = () => {
    const today = Utils.getTodayDateString();
    const soldHistory = StorageManager.getSoldHistory();
    const updatedInventory = [...inventory];

    const newSoldItems: any[] = [];

    cart.forEach((c) => {
      const invIndex = updatedInventory.findIndex((i) => i.id === c.itemId);
      if (invIndex >= 0) {
        updatedInventory[invIndex] = {
          ...updatedInventory[invIndex],
          stock: Math.max(0, updatedInventory[invIndex].stock - c.qty),
          updatedAt: new Date().toISOString(),
        };

        const soldDetail = {
          id: Utils.generateId('sold'),
          itemId: c.itemId,
          itemName: c.name,
          qtySold: c.qty,
          sisaFisik: updatedInventory[invIndex].stock,
          modalSatuan: c.modalSatuan,
          hargaJual: c.hargaJual,
          omzet: c.subtotal,
          profit: (c.hargaJual - c.modalSatuan) * c.qty,
          timestamp: new Date().toISOString(),
          timeOnly: Utils.formatTime(new Date().toISOString()),
          dateOnly: today,
          paymentMethod: paymentMethod,
        };

        newSoldItems.push(soldDetail);
      }
    });

    StorageManager.saveInventory(updatedInventory);
    StorageManager.saveSoldHistory([...newSoldItems, ...soldHistory]);

    const receipt = {
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discount,
      total: cartTotal,
      cashGiven: paymentMethod === 'CASH' ? cashNumber : cartTotal,
      change: paymentMethod === 'CASH' ? changeAmount : 0,
      paymentMethod: paymentMethod,
      timestamp: new Date().toISOString(),
      receiptId: Utils.generateId('TRX'),
      customerName: customerName || undefined,
      memberId: memberId || undefined,
    };

    setCheckoutResult(receipt);
    setCart([]);
    setCashGiven('');
    setDiscount(0);
    setCustomerName('');
    setMemberId('');
    onRefresh();
    onShowToast('success', 'Transaksi Kasir POSMAIN Berhasil Diproses!');
  };

  return (
    <div className="space-y-4">
      {/* INDOMARET POSMAIN HEADER TERMINAL BAR */}
      <div className="bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
        {/* Top Strip Accent: Indomaret Red, Blue, Yellow */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-red-600 to-amber-400"></div>

        <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-xl tracking-tighter shadow-md shadow-blue-600/40 text-white border border-blue-400">
              POS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  POSMAIN TERMINAL 01
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  ● ONLINE SHIFT 1
                </span>
              </div>
              <h1 className="text-xl font-black mt-1 tracking-tight text-white flex items-center gap-2">
                {settings.storeName || 'INDOMARET MINIMARKET POS'}
              </h1>
              <p className="text-xs text-slate-400">
                Kasir: <span className="font-bold text-slate-200">{settings.storeOwner || 'KASIR UTAMA'}</span> | Terminal ID: #POS-IND-001
              </p>
            </div>
          </div>

          {/* Right Live Clock & Date */}
          <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700/60 self-stretch md:self-auto justify-between md:justify-end">
            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-right">
              <div className="text-sm font-black font-mono tracking-wider text-amber-300">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Function Keys Shortcut Banner */}
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px] font-mono">
          <span className="text-slate-500 font-bold shrink-0 flex items-center gap-1">
            <Key className="w-3 h-3 text-blue-400" /> SHORTCUT:
          </span>
          <span className="bg-blue-900/40 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded font-bold whitespace-nowrap">
            [F1] Cari Barang
          </span>
          <span className="bg-red-900/40 text-red-300 border border-red-800/60 px-2 py-0.5 rounded font-bold whitespace-nowrap">
            [F2] Scan Barcode
          </span>
          <span className="bg-emerald-900/40 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded font-bold whitespace-nowrap">
            [F5] Pembayaran Tunai
          </span>
          <span className="bg-purple-900/40 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded font-bold whitespace-nowrap">
            [F6] QRIS / Card
          </span>
          <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold whitespace-nowrap">
            [ESC] Clear Cart
          </span>
        </div>
      </div>

      {/* FAST BARCODE SCANNER ROW */}
      <form onSubmit={handleBarcodeSubmit} className="bg-gradient-to-r from-red-600 via-blue-700 to-slate-900 p-3.5 rounded-2xl shadow-md border border-red-500/30 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/10 text-white shrink-0">
          <Barcode className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1 relative">
          <input
            ref={barcodeInputRef}
            type="text"
            placeholder="[F2] TEMPAKAN BARCODE SCANNER DI SINI (Tekan Enter)..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold text-sm px-4 py-2.5 rounded-xl border border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner placeholder-slate-400"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors shadow-md shrink-0 uppercase tracking-wider"
        >
          Scan Item
        </button>
      </form>

      {/* Main Grid: Left Products Catalog - Right Active Basket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Product Catalog (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Filter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="[F1] Cari barang (Ketik nama / kode)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat === 'ALL' ? 'Semua Barang' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredInventory.map((item) => {
              const inCart = cart.find((i) => i.itemId === item.id);
              const isOutOfStock = item.stock <= 0;

              return (
                <div
                  key={item.id}
                  onClick={() => !isOutOfStock && addToCart(item)}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-3 flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group ${
                    isOutOfStock
                      ? 'border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed'
                      : 'border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
                        {item.code ? `[${item.code}]` : item.category || 'RETAIL'}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                          item.stock <= 5
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {item.stock} PCS
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-2 leading-tight">
                      {item.name}
                    </h4>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                      {Utils.formatRupiah(item.hargaJual)}
                    </span>
                    <button
                      disabled={isOutOfStock}
                      className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {inCart && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                      {inCart.qty}x
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Cart Basket (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm sticky top-20 space-y-4">
            
            {/* VFD DIGITAL DISPLAY DISPLAY SCREEN (Indomaret POS LED Style) */}
            <div className="bg-slate-950 p-4 rounded-2xl border-2 border-slate-800 shadow-inner space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-emerald-400/80">
                <span>VFD DISPLAY MAIN</span>
                <span>STATUS: READY</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">TOTAL BAYAR (RP)</span>
                <span className="text-3xl font-black font-mono text-emerald-400 tracking-wider">
                  {Utils.formatRupiah(cartTotal)}
                </span>
              </div>
              {paymentMethod === 'CASH' && cashNumber > 0 && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs font-mono">
                  <span className="text-slate-400">KEMBALIAN:</span>
                  <span className={`font-bold ${changeAmount >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {Utils.formatRupiah(changeAmount)}
                  </span>
                </div>
              )}
            </div>

            {/* Cart Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Daftar Belanja Kasir
                  </h3>
                  <p className="text-[10px] text-slate-400">{cart.length} item di dalam keranjang</p>
                </div>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
                >
                  Kosongkan
                </button>
              )}
            </div>

            {/* Member Indomaret / Customer Info */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                  Member / Poinku ID
                </label>
                <div className="relative">
                  <ShieldCheck className="w-3 h-3 text-amber-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ID Member..."
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="w-full pl-7 pr-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                  Nama Pembeli
                </label>
                <div className="relative">
                  <UserCheck className="w-3 h-3 text-blue-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Nama / Pelanggan..."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-7 pr-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Cart Items Table List */}
            <div className="max-h-56 overflow-y-auto border rounded-2xl border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-1">
                  <Package className="w-6 h-6 mx-auto opacity-40" />
                  <p className="text-xs font-semibold">Belum ada barang di keranjang</p>
                  <p className="text-[10px]">Scan barcode [F2] atau klik barang di katalog</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono font-bold text-slate-400">
                          #{idx + 1}
                        </span>
                        <h5 className="font-extrabold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </h5>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                        {Utils.formatRupiah(item.hargaJual)} x {item.qty} ={' '}
                        <span className="font-bold text-slate-900 dark:text-white">
                          {Utils.formatRupiah(item.subtotal)}
                        </span>
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => updateCartQty(item.id, item.qty - 1)}
                        className="w-5 h-5 rounded bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-600 text-xs font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black text-slate-800 dark:text-white w-5 text-center font-mono">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateCartQty(item.id, item.qty + 1)}
                        className="w-5 h-5 rounded bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-600 text-xs font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Discounts */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                  {Utils.formatRupiah(cartSubtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-500">
                <span>Diskon (Rp)</span>
                <input
                  type="number"
                  placeholder="0"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-24 text-right px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-900 dark:text-white focus:outline-none border border-transparent font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-sm font-black text-slate-900 dark:text-white">
                <span>TOTAL HARGA</span>
                <span className="text-blue-600 dark:text-blue-400 text-lg font-mono">
                  {Utils.formatRupiah(cartTotal)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 block">Metode Pembayaran</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all ${
                    paymentMethod === 'CASH'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent'
                  }`}
                >
                  <Banknote className="w-4 h-4" /> [F5] TUNAI
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all ${
                    paymentMethod === 'QRIS'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent'
                  }`}
                >
                  <QrCode className="w-4 h-4" /> [F6] QRIS
                </button>
              </div>
            </div>

            {/* Cash Input & Quick Buttons if CASH */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    Uang Tunai Diterima:
                  </label>
                  {/* Quick Cash Buttons */}
                  <div className="flex items-center gap-1">
                    {[cartTotal, 10000, 20000, 50000, 100000, 200000].map((quickVal) => (
                      <button
                        key={quickVal}
                        type="button"
                        onClick={() => setCashGiven(quickVal.toString())}
                        className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        {quickVal === cartTotal ? 'PAS' : `${quickVal / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  ref={cashInputRef}
                  type="number"
                  placeholder="Masukkan nominal uang tunai..."
                  value={cashGiven}
                  onChange={(e) => setCashGiven(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-blue-600 to-indigo-700 hover:opacity-95 disabled:opacity-50 text-white font-black text-sm tracking-wide transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-95 uppercase"
            >
              <CheckCircle2 className="w-5 h-5" /> PROSES BAYAR ({Utils.formatRupiah(cartTotal)})
            </button>
          </div>
        </div>
      </div>

      {/* INDOMARET STYLE RECEIPT STRUK PREVIEW MODAL */}
      {checkoutResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            {/* Indomaret Struk Header */}
            <div className="text-center border-b border-dashed border-slate-300 dark:border-slate-700 pb-3 font-mono">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center mb-1 font-black text-sm border border-blue-400 shadow-sm">
                IND
              </div>
              <h3 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-wider">
                {settings.storeName || 'INDOMARET MINIMARKET'}
              </h3>
              <p className="text-[11px] text-slate-500">{settings.storeAddress}</p>
              <p className="text-[11px] text-slate-400">TELP: {settings.storePhone}</p>
              
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 flex justify-between">
                <span>POS: TERMINAL-01</span>
                <span>KASIR: {settings.storeOwner}</span>
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>NO: {checkoutResult.receiptId}</span>
                <span>{Utils.formatTime(checkoutResult.timestamp)}</span>
              </div>
              {checkoutResult.memberId && (
                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-1">
                  MEMBER POINKU: {checkoutResult.memberId}
                </div>
              )}
            </div>

            {/* Struk Items List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto text-xs font-mono">
              {checkoutResult.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-slate-800 dark:text-slate-200">
                  <div className="pr-2">
                    <div>{item.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {item.qty} x {Utils.formatRupiah(item.hargaJual)}
                    </div>
                  </div>
                  <div className="font-bold shrink-0">{Utils.formatRupiah(item.subtotal)}</div>
                </div>
              ))}
            </div>

            {/* Totals Calculation */}
            <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-500">
                <span>SUBTOTAL:</span>
                <span>{Utils.formatRupiah(checkoutResult.subtotal)}</span>
              </div>
              {checkoutResult.discount > 0 && (
                <div className="flex justify-between text-rose-500">
                  <span>POTONGAN HARGA:</span>
                  <span>-{Utils.formatRupiah(checkoutResult.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>TOTAL BELANJA:</span>
                <span>{Utils.formatRupiah(checkoutResult.total)}</span>
              </div>
              <div className="flex justify-between text-slate-500 pt-1">
                <span>BAYAR ({checkoutResult.paymentMethod}):</span>
                <span>{Utils.formatRupiah(checkoutResult.cashGiven)}</span>
              </div>
              {checkoutResult.paymentMethod === 'CASH' && (
                <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                  <span>KEMBALI:</span>
                  <span>{Utils.formatRupiah(checkoutResult.change)}</span>
                </div>
              )}
            </div>

            <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono">
              *** TERIMA KASIH ***<br />
              SELAMAT BERBELANJA KEMBALI
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4" /> Cetak Struk POS
              </button>
              <button
                onClick={() => setCheckoutResult(null)}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QRIS MODAL */}
      <QrisModal
        isOpen={showQrisModal}
        amount={cartTotal}
        orderId={qrisOrderId}
        itemName={`[POSMAIN] ${cart.length} item - ${customerName || 'Pelanggan Kasir'}`}
        customerName={customerName || settings.storeOwner}
        onClose={() => setShowQrisModal(false)}
        onSuccess={() => {
          setShowQrisModal(false);
          finalizeCheckout();
        }}
      />
    </div>
  );
};
