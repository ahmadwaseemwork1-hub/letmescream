import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Zap } from 'lucide-react';
import { gsap } from 'gsap';

interface SaveScreamModalProps {
  onSave: (name: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function SaveScreamModal({ onSave, onCancel, isLoading }: SaveScreamModalProps) {
  const [screamName, setScreamName] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP entrance animation
    if (modalRef.current) {
      gsap.fromTo(modalRef.current,
        { 
          scale: 0.8, 
          opacity: 0,
          rotationY: -15
        },
        { 
          scale: 1, 
          opacity: 1,
          rotationY: 0,
          duration: 0.6, 
          ease: "back.out(1.7)"
        }
      );
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (screamName.trim()) {
      // Explosive save animation
      if (modalRef.current) {
        gsap.to(modalRef.current, {
          scale: 1.1,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        });
      }
      onSave(screamName.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 scanlines"
    >
      <motion.div
        ref={modalRef}
        className="bg-dark-card rounded-2xl shadow-neon-strong max-w-lg w-full p-8 border border-neon-purple/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-r from-neon-pink to-neon-purple rounded-full flex items-center justify-center shadow-neon"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap size={20} className="text-white" />
            </motion.div>
            <motion.h3 
              className="text-2xl font-black text-white glow-text"
              animate={{
                textShadow: [
                  "0 0 10px #ff3366",
                  "0 0 20px #9b5de5",
                  "0 0 10px #ff3366"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              SAVE YOUR SCREAM
            </motion.h3>
          </div>
          <motion.button
            onClick={onCancel}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors border border-gray-600 hover:border-neon-pink"
          >
            <X size={20} className="text-white" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="screamName" className="block text-sm font-bold text-white mb-3 uppercase tracking-wide">
              Give your scream a name
            </label>
            <motion.input
              type="text"
              id="screamName"
              value={screamName}
              onChange={(e) => setScreamName(e.target.value)}
              placeholder="e.g., MONDAY MORNING RAGE"
              className="w-full bg-gray-800 border border-gray-600 rounded-xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-neon-pink font-medium glow-text"
              maxLength={50}
              autoFocus
              whileFocus={{ scale: 1.02 }}
            />
            <p className="text-xs text-gray-400 mt-2 font-mono">
              {screamName.length}/50 CHARACTERS
            </p>
          </div>

          <div className="flex space-x-4">
            <motion.button
              type="button"
              onClick={onCancel}
              whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-4 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all duration-300 border border-gray-600 hover:border-gray-500 scream-button"
            >
              CANCEL
            </motion.button>
            <motion.button
              type="submit"
              disabled={!screamName.trim() || isLoading}
              whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-purple/80 hover:to-neon-pink/80 disabled:from-gray-700 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-black transition-all duration-300 flex items-center justify-center space-x-3 shadow-neon scream-button"
            >
              {isLoading ? (
                <>
                  <motion.div 
                    className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>SAVING...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>SAVE SCREAM</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}