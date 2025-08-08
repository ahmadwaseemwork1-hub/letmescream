import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Zap } from 'lucide-react';
import { gsap } from 'gsap';

interface LandingPageProps {
  onScreamStart: () => void;
}

export default function LandingPage({ onScreamStart }: LandingPageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // GSAP entrance animations
    if (titleRef.current) {
      gsap.fromTo(titleRef.current.children,
        { 
          y: 100, 
          opacity: 0,
          rotationX: -90,
          scale: 0.8
        },
        { 
          y: 0, 
          opacity: 1,
          rotationX: 0,
          scale: 1,
          duration: 1.2, 
          stagger: 0.2,
          ease: "back.out(1.7)",
          delay: 0.3
        }
      );
    }

    if (subtitleRef.current) {
      gsap.fromTo(subtitleRef.current,
        { 
          y: 50, 
          opacity: 0,
          filter: "blur(10px)"
        },
        { 
          y: 0, 
          opacity: 1,
          filter: "blur(0px)",
          duration: 1,
          ease: "power2.out",
          delay: 1
        }
      );
    }
  }, []);

  const handleScreamClick = () => {
    // Explosive exit animation
    if (titleRef.current) {
      gsap.to(titleRef.current, {
        scale: 1.2,
        opacity: 0,
        rotationY: 180,
        duration: 0.5,
        ease: "power2.in"
      });
    }
    
    setTimeout(onScreamStart, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 scanlines grain-texture">
      <div className="text-center space-y-12 max-w-4xl">
        {/* Kinetic Typography */}
        <motion.div
          ref={titleRef}
          className="space-y-6"
        >
          <h1 className="text-7xl md:text-9xl font-black text-white leading-none">
            <motion.span 
              className="block glow-text kinetic-text"
              animate={{
                textShadow: [
                  "0 0 20px #ff3366, 0 0 40px #ff3366",
                  "0 0 30px #9b5de5, 0 0 60px #9b5de5",
                  "0 0 25px #00ffff, 0 0 50px #00ffff",
                  "0 0 20px #ff3366, 0 0 40px #ff3366"
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              onMouseEnter={() => {
                gsap.to(titleRef.current, {
                  scale: 1.05,
                  duration: 0.3,
                  ease: "power2.out"
                });
              }}
              onMouseLeave={() => {
                gsap.to(titleRef.current, {
                  scale: 1,
                  duration: 0.3,
                  ease: "power2.out"
                });
              }}
            >
              LET IT OUT.
            </motion.span>
            <motion.span 
              className="block bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan bg-clip-text text-transparent kinetic-text"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              JUST SCREAM.
            </motion.span>
          </h1>
          
          <motion.p 
            ref={subtitleRef}
            className="text-2xl md:text-3xl text-gray-300 font-light"
            animate={{
              opacity: [0.8, 1, 0.8],
              y: [0, -2, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            No judgment. No limits. Pure expression.
          </motion.p>
        </motion.div>

        {/* Explosive Scream Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="relative"
        >
          {/* Pulse rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              className="absolute w-40 h-40 border-2 border-neon-pink/30 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div 
              className="absolute w-40 h-40 border-2 border-neon-purple/30 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div 
              className="absolute w-40 h-40 border-2 border-neon-cyan/30 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
          </div>
          
          <motion.button
            onClick={handleScreamClick}
            whileHover={{ 
              scale: 1.1,
              filter: "brightness(1.3)"
            }}
            whileTap={{ scale: 0.9 }}
            className="relative scream-button group bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan text-white font-black py-8 px-16 rounded-full text-2xl shadow-neon-strong breathing-glow"
            onMouseEnter={() => {
              gsap.to(".pulse-ring", {
                scale: 2,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1
              });
            }}
          >
            {/* Inner energy core */}
            <motion.div 
              className="absolute inset-4 rounded-full bg-gradient-to-r from-neon-pink/20 to-neon-cyan/20"
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity }
              }}
            />
            
            <div className="relative z-10 flex items-center space-x-4">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Volume2 size={36} className="group-hover:animate-pulse" />
              </motion.div>
              <span className="kinetic-text">START SCREAMING</span>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Zap size={32} />
              </motion.div>
            </div>
          </motion.button>
        </motion.div>

        {/* Dynamic subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="space-y-4"
        >
          <motion.p 
            className="text-lg text-gray-400"
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.02, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Your voice is your key. Your scream is your freedom.
          </motion.p>
          
          <motion.div
            className="flex justify-center space-x-8 text-sm text-gray-500"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-neon-pink rounded-full animate-pulse"></div>
              <span>Anonymous</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-neon-purple rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span>No Data Saved</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <span>Pure Expression</span>
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}