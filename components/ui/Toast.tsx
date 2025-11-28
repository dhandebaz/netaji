import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />
};

const bgColors = {
  success: 'bg-green-50 border-green-100',
  error: 'bg-red-50 border-red-100',
  warning: 'bg-amber-50 border-amber-100',
  info: 'bg-blue-50 border-blue-100'
};

const textColors = {
  success: 'text-green-800',
  error: 'text-red-800',
  warning: 'text-amber-800',
  info: 'text-blue-800'
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  title,
  duration = 5000,
  onClose
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration <= 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        onClose(id);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [id, duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      className={`
        relative overflow-hidden
        ${bgColors[type]} 
        border rounded-xl shadow-lg 
        min-w-[320px] max-w-md
      `}
    >
      <div className="p-4 flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icons[type]}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-semibold ${textColors[type]} mb-0.5`}>
              {title}
            </h4>
          )}
          <p className={`text-sm ${textColors[type]} opacity-90`}>
            {message}
          </p>
        </div>
        <button
          onClick={() => onClose(id)}
          className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors ${textColors[type]}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {duration > 0 && (
        <div className="h-1 bg-black/5">
          <motion.div
            className={`h-full ${type === 'success' ? 'bg-green-400' : type === 'error' ? 'bg-red-400' : type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    message: string;
    title?: string;
    duration?: number;
  }>;
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="sync">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
