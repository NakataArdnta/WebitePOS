import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X, RotateCcw } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  onUndo?: () => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  onUndo,
}) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgClass = 'bg-slate-900 text-white border-slate-700';
          let Icon = Info;
          let iconColor = 'text-blue-400';

          if (toast.type === 'success') {
            bgClass = 'bg-emerald-900/95 text-emerald-50 border-emerald-600/50 shadow-emerald-950/40';
            Icon = CheckCircle2;
            iconColor = 'text-emerald-400';
          } else if (toast.type === 'error') {
            bgClass = 'bg-rose-900/95 text-rose-50 border-rose-600/50 shadow-rose-950/40';
            Icon = XCircle;
            iconColor = 'text-rose-400';
          } else if (toast.type === 'warning') {
            bgClass = 'bg-amber-900/95 text-amber-50 border-amber-600/50 shadow-amber-950/40';
            Icon = AlertTriangle;
            iconColor = 'text-amber-400';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md ${bgClass}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
                <div>
                  <h4 className="font-semibold text-sm leading-tight">{toast.message}</h4>
                  {toast.description && (
                    <p className="text-xs text-slate-300 mt-1">{toast.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onUndo && (
                  <button
                    onClick={onUndo}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Undo
                  </button>
                )}
                <button
                  onClick={() => onDismiss(toast.id)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
