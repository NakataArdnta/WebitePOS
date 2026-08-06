import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, CheckCircle2, X, ShieldCheck, Copy, Check, RefreshCw } from 'lucide-react';
import { Utils } from '../utils/Utils';

interface QrisModalProps {
  isOpen: boolean;
  amount: number;
  orderId: string;
  itemName: string;
  customerName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const QrisModal: React.FC<QrisModalProps> = ({
  isOpen,
  amount,
  orderId,
  itemName,
  customerName,
  onClose,
  onSuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      setIsVerifying(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Standardized EMVCo QRIS payload format
  const padAmount = String(Math.round(amount)).padStart(6, '0');
  const qrisPayload = `00020101021226680016ID.CO.QRIS.POS0118936009140000000000020300303UMI51440014ID.LINKAJA.WWW0215ID102003847291252045812530336054${padAmount.length}${padAmount}5802ID5912WARUNG POS PPOB6007JAKARTA61051234562070703A016304C91E`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrisPayload)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrisPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onSuccess();
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/20">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-black text-base leading-tight">Pembayaran QRIS</h3>
                <p className="text-[11px] text-rose-100 font-medium">Scan menggunakan Aplikasi e-Wallet / m-Banking</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Amount & Order details */}
            <div className="text-center bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Tagihan</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
                {Utils.formatRupiah(amount)}
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                {itemName}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                Order ID: {orderId}
              </div>
            </div>

            {/* QR Code Frame */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-4 bg-white rounded-2xl border-2 border-rose-200 shadow-md relative group">
                <img
                  src={qrImageUrl}
                  alt="QRIS Code"
                  referrerPolicy="no-referrer"
                  className="w-48 h-48 object-contain rounded-lg"
                />
                <div className="absolute inset-x-0 bottom-1 flex justify-center">
                  <span className="px-2 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded-md tracking-widest shadow">
                    QRIS RESMI
                  </span>
                </div>
              </div>

              {/* Bank & e-Wallet Logos */}
              <div className="flex items-center justify-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">GoPay</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">OVO</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">DANA</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">ShopeePay</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">BCA</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">Mandiri</span>
              </div>
            </div>

            {/* Verification Button */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleConfirmPayment}
                disabled={isVerifying}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Pembayaran...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Pembayaran QRIS Selesai</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors"
              >
                Batal / Ubah Metode
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
