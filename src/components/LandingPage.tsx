import React from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';

interface LandingPageProps {
  onScreamStart: () => void;
}

export default function LandingPage({ onScreamStart }: LandingPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-4"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-light-gray leading-tight">
            Let it out.
            <br />
            <span className="bg-gradient-to-r from-primary-purple to-accent-pink bg-clip-text text-transparent">
              Just scream.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-light-gray/80 font-light">
            Release your guilt and tension. No one's watching.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="relative"
        >
          {/* Pulse rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-32 h-32 border-2 border-primary-purple/30 rounded-full pulse-ring"></div>
            <div className="absolute w-32 h-32 border-2 border-primary-purple/20 rounded-full pulse-ring" style={{ animationDelay: '0.5s' }}></div>
          </div>
          
          <button
            onClick={onScreamStart}
            className="relative scream-button group bg-gradient-to-r from-primary-purple to-accent-pink hover:from-primary-purple/80 hover:to-accent-pink/80 text-off-white font-semibold py-6 px-12 rounded-full text-xl shadow-2xl breathing-glow"
          >
            <div className="flex items-center space-x-3">
              <Volume2 size={28} className="group-hover:animate-pulse" />
              <span>Start Screaming</span>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}