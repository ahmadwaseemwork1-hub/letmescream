import React from 'react';
import { motion } from 'framer-motion';

export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-bg" />
      
      {/* Floating particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary-purple/20 rounded-full floating-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
      
      {/* Larger floating elements */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`large-${i}`}
          className="absolute w-8 h-8 border border-soft-lavender/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() * 40 - 20, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}
      
      {/* Subtle wave lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9B5DE5" stopOpacity="0" />
            <stop offset="50%" stopColor="#9B5DE5" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#9B5DE5" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <motion.path
          d="M0,400 Q400,300 800,400 T1600,400"
          stroke="url(#waveGradient)"
          strokeWidth="2"
          fill="none"
          animate={{
            d: [
              "M0,400 Q400,300 800,400 T1600,400",
              "M0,350 Q400,450 800,350 T1600,350",
              "M0,400 Q400,300 800,400 T1600,400",
            ],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.path
          d="M0,200 Q400,100 800,200 T1600,200"
          stroke="url(#waveGradient)"
          strokeWidth="1"
          fill="none"
          animate={{
            d: [
              "M0,200 Q400,100 800,200 T1600,200",
              "M0,250 Q400,50 800,250 T1600,250",
              "M0,200 Q400,100 800,200 T1600,200",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </svg>
    </div>
  );
}