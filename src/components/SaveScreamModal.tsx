import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, X } from 'lucide-react';

interface SaveScreamModalProps {
  onSave: (name: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function SaveScreamModal({ onSave, onCancel, isLoading }: SaveScreamModalProps) {
  const [screamName, setScreamName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (screamName.trim()) {
      onSave(screamName.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-off-white rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-light-gray">Save Your Scream</h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-soft-lavender rounded-full transition-colors"
          >
            <X size={20} className="text-light-gray" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="screamName" className="block text-sm font-medium text-light-gray mb-2">
              Give your scream a name
            </label>
            <input
              type="text"
              id="screamName"
              value={screamName}
              onChange={(e) => setScreamName(e.target.value)}
              placeholder="e.g., Monday Morning Frustration"
              className="w-full bg-pale-lilac/50 border border-soft-lavender rounded-lg px-4 py-3 text-light-gray placeholder-light-gray/60 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent"
              maxLength={50}
              autoFocus
            />
            <p className="text-xs text-light-gray/60 mt-1">
              {screamName.length}/50 characters
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-soft-lavender hover:bg-soft-lavender/80 text-light-gray rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!screamName.trim() || isLoading}
              className="flex-1 py-3 px-4 bg-primary-purple hover:bg-primary-purple/80 disabled:bg-soft-lavender disabled:cursor-not-allowed text-off-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Scream</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}