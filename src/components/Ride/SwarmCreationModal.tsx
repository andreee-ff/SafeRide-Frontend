import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Users, X } from 'lucide-react';

interface SwarmCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (count: number) => void;
  isLoading?: boolean;
}

const SwarmCreationModal: React.FC<SwarmCreationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [count, setCount] = useState<number>(5);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCount(5); // Reset default
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

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
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
        >
          <div className="p-6 bg-purple-50 flex gap-4">
             <div className="p-2 rounded-full bg-white shrink-0">
               <Users className="text-purple-600" size={24} />
             </div>
             <div className="flex-1">
               <h3 className="text-lg font-bold text-gray-900 leading-6">Create Swarm</h3>
               <p className="mt-1 text-sm text-gray-600">Simulate multiple riders moving associated with this ride.</p>
             </div>
             <button onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-gray-500 self-start">
               <X size={20} />
             </button>
          </div>

          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Bots</label>
            <Input 
                type="number" 
                min={2} 
                max={50} 
                value={count} 
                onChange={(e) => setCount(parseInt(e.target.value) || 0)} 
                disabled={isLoading}
            />
          </div>

          <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3">
            <Button
              className="bg-purple-600 hover:bg-purple-700 border-purple-600 text-white"
              onClick={() => onConfirm(count)}
              isLoading={isLoading}
            >
              Start Swarm
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SwarmCreationModal;
