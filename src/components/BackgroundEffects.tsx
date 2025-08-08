import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

export default function BackgroundEffects() {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    // Create floating particles with GSAP
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 bg-neon-pink rounded-full opacity-60';
      
      const startX = Math.random() * window.innerWidth;
      const startY = window.innerHeight + 10;
      const endY = -10;
      const drift = (Math.random() - 0.5) * 200;
      
      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;
      
      container.appendChild(particle);
      
      gsap.to(particle, {
        y: endY - startY,
        x: drift,
        rotation: Math.random() * 360,
        scale: Math.random() * 2 + 0.5,
        duration: Math.random() * 8 + 4,
        ease: "none",
        onComplete: () => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }
      });
      
      // Glow effect
      gsap.to(particle, {
        boxShadow: [
          "0 0 5px rgba(255, 51, 102, 0.8)",
          "0 0 15px rgba(155, 93, 229, 0.6)",
          "0 0 10px rgba(0, 255, 255, 0.4)",
          "0 0 5px rgba(255, 51, 102, 0.8)"
        ],
        duration: 2,
        repeat: -1,
        yoyo: true
      });
    };

    // Create particles at intervals
    const particleInterval = setInterval(createParticle, 200);

    // Create larger energy orbs
    const createEnergyOrb = () => {
      const orb = document.createElement('div');
      orb.className = 'absolute w-8 h-8 rounded-full opacity-20';
      orb.style.background = 'radial-gradient(circle, rgba(255, 51, 102, 0.8) 0%, transparent 70%)';
      
      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * window.innerHeight;
      
      orb.style.left = `${startX}px`;
      orb.style.top = `${startY}px`;
      
      container.appendChild(orb);
      
      gsap.to(orb, {
        x: (Math.random() - 0.5) * 400,
        y: (Math.random() - 0.5) * 400,
        scale: Math.random() * 3 + 1,
        rotation: Math.random() * 720,
        duration: Math.random() * 15 + 10,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });
      
      // Remove after animation
      setTimeout(() => {
        if (orb.parentNode) {
          orb.parentNode.removeChild(orb);
        }
      }, 25000);
    };

    const orbInterval = setInterval(createEnergyOrb, 3000);

    return () => {
      clearInterval(particleInterval);
      clearInterval(orbInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated gradient background */}
      <motion.div 
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 20% 80%, rgba(255, 51, 102, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(155, 93, 229, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(255, 51, 102, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 50%, rgba(155, 93, 229, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 80%, rgba(255, 51, 102, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(155, 93, 229, 0.15) 0%, transparent 50%)"
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Particle container */}
      <div ref={particlesRef} className="absolute inset-0" />
      
      {/* Static energy lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff3366" stopOpacity="0" />
            <stop offset="50%" stopColor="#9b5de5" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00ffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <motion.path
          d="M0,400 Q400,300 800,400 T1600,400"
          stroke="url(#energyGradient)"
          strokeWidth="2"
          fill="none"
          animate={{
            d: [
              "M0,400 Q400,300 800,400 T1600,400",
              "M0,350 Q400,450 800,350 T1600,350",
              "M0,450 Q400,250 800,450 T1600,450",
              "M0,400 Q400,300 800,400 T1600,400",
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.path
          d="M0,200 Q400,100 800,200 T1600,200"
          stroke="url(#energyGradient)"
          strokeWidth="1"
          fill="none"
          animate={{
            d: [
              "M0,200 Q400,100 800,200 T1600,200",
              "M0,250 Q400,50 800,250 T1600,250",
              "M0,150 Q400,150 800,150 T1600,150",
              "M0,200 Q400,100 800,200 T1600,200",
            ],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </svg>

      {/* Corner energy bursts */}
      <motion.div
        className="absolute top-0 left-0 w-32 h-32"
        animate={{
          background: [
            "radial-gradient(circle, rgba(255, 51, 102, 0.3) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(155, 93, 229, 0.3) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(255, 51, 102, 0.3) 0%, transparent 70%)"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      <motion.div
        className="absolute bottom-0 right-0 w-32 h-32"
        animate={{
          background: [
            "radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(155, 93, 229, 0.3) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(255, 51, 102, 0.3) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 70%)"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
      />
    </div>
  );
}