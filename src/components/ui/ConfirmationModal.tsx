import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertTriangle className="text-red-600" size={24} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-600" size={24} />;
      default:
        return <AlertTriangle className="text-blue-600" size={24} />;
    }
  };

  const getHeaderBg = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={isLoading ? undefined : onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        >
          <div className={`p-6 flex gap-4 ${getHeaderBg()}`}>
            <div className={`p-2 rounded-full bg-white shrink-0`}>
              {getIcon()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 leading-6">
                {title}
              </h3>
              <div className="mt-2 text-sm text-gray-600">
                {message}
              </div>
            </div>
            <button 
                onClick={onClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-500 self-start"
            >
                <X size={20} />
            </button>
          </div>

          <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3">
            <Button
              variant={variant === 'danger' ? 'primary' : 'primary'} // Simplified for now, or assume primary can handle danger styled via class if needed, or just use custom class
              className={variant === 'danger' ? '!bg-red-600 hover:!bg-red-700 !border-red-600' : ''}
              onClick={onConfirm}
              isLoading={isLoading}
            >
              {confirmText}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;
