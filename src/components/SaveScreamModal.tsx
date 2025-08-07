import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Zap } from 'lucide-react';

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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-dark-surface rounded-2xl shadow-2xl max-w-md w-full p-6 border border-neon-purple/30 neon-border"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-8 bg-gradient-to-r from-neon-purple to-neon-pink rounded-full flex items-center justify-center neon-glow"
            >
              <Zap size={16} className="text-dark-bg" />
            </motion.div>
            <h3 className="text-xl font-bold text-neon-white neon-text">Save Your Scream</h3>
          </div>
          <motion.button
            onClick={onCancel}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 hover:bg-dark-bg rounded-full transition-colors"
          >
            <X size={20} className="text-neon-white" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="screamName" className="block text-sm font-medium text-neon-white mb-2">
              Give your scream a name
            </label>
            <motion.input
              type="text"
              id="screamName"
              value={screamName}
              onChange={(e) => setScreamName(e.target.value)}
              placeholder="e.g., Monday Morning Frustration"
              className="w-full bg-dark-bg/50 border border-neon-purple/30 rounded-lg px-4 py-3 text-neon-white placeholder-neon-white/60 focus:outline-none focus:ring-2 focus:ring-neon-purple focus:border-transparent transition-all duration-300"
              maxLength={50}
              autoFocus
              whileFocus={{ scale: 1.02 }}
            />
            <p className="text-xs text-neon-white/60 mt-1">
              {screamName.length}/50 characters
            </p>
          </div>

          <div className="flex space-x-3">
            <motion.button
              type="button"
              onClick={onCancel}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-3 px-4 bg-dark-bg hover:bg-dark-bg/80 text-neon-white rounded-lg font-medium transition-colors border border-neon-purple/30"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={!screamName.trim() || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-purple/80 hover:to-neon-pink/80 disabled:from-dark-bg disabled:to-dark-bg disabled:cursor-not-allowed text-dark-bg rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 neon-glow"
            >
              {isLoading ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Scream</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}