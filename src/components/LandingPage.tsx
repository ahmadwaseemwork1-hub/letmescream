import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, Zap } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text3D, Center } from '@react-three/drei';

interface LandingPageProps {
  onScreamStart: () => void;
}

function ScreamText() {
  return (
    <Center>
      <Text3D
        font="/fonts/helvetiker_regular.typeface.json"
        size={1}
        height={0.2}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.02}
        bevelSize={0.02}
        bevelOffset={0}
        bevelSegments={5}
      >
        SCREAM
        <meshNormalMaterial />
      </Text3D>
    </Center>
  );
}

export default function LandingPage({ onScreamStart }: LandingPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative">
      {/* 3D Text Background */}
      <div className="absolute inset-0 opacity-10">
        <Canvas camera={{ position: [0, 0, 8] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} color="#9B5DE5" />
          <pointLight position={[-10, -10, -10]} color="#FF6F91" />
          <ScreamText />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      <div className="text-center space-y-8 max-w-2xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-4"
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-neon-white leading-tight neon-text"
            whileHover={{ scale: 1.02 }}
          >
            Let it out.
            <br />
            <motion.span 
              className="bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent neon-text-pink"
              animate={{ 
                textShadow: [
                  '0 0 10px rgba(255, 111, 145, 0.5)',
                  '0 0 20px rgba(255, 111, 145, 0.8)',
                  '0 0 10px rgba(255, 111, 145, 0.5)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Just scream.
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-neon-white/80 font-light"
            whileHover={{ scale: 1.02 }}
          >
            Release your tension into the digital void.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="relative"
        >
          {/* Enhanced pulse rings with neon effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              className="absolute w-32 h-32 border-2 border-neon-purple/40 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div 
              className="absolute w-32 h-32 border-2 border-neon-pink/30 rounded-full"
              animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div 
              className="absolute w-32 h-32 border-2 border-neon-cyan/20 rounded-full"
              animate={{ scale: [1, 2.2, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
          </div>
          
          <motion.button
            onClick={onScreamStart}
            whileHover={{ 
              scale: 1.1,
              rotate: [0, -2, 2, 0],
              transition: { rotate: { duration: 0.3 } }
            }}
            whileTap={{ scale: 0.9 }}
            className="relative scream-button group bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-purple/80 hover:to-neon-pink/80 text-dark-bg font-bold py-6 px-12 rounded-full text-xl shadow-2xl neon-glow cursor-scream"
          >
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ x: [0, -2, 2, 0] }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Volume2 size={28} className="group-hover:animate-pulse" />
              </motion.div>
              <motion.span
                whileHover={{ 
                  scale: [1, 1.1, 1],
                  transition: { duration: 0.3 }
                }}
              >
                Start Screaming
              </motion.span>
            </motion.div>
            
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: [-100, 200] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />
          </motion.button>
        </motion.div>

        {/* Enhanced floating elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute inset-0 pointer-events-none"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            >
              <Zap 
                size={16 + Math.random() * 8} 
                className={`${
                  i % 3 === 0 ? 'text-neon-purple' : 
                  i % 3 === 1 ? 'text-neon-pink' : 'text-neon-cyan'
                }`}
                style={{
                  filter: `drop-shadow(0 0 8px ${
                    i % 3 === 0 ? '#9B5DE5' : 
                    i % 3 === 1 ? '#FF6F91' : '#C3F0FF'
                  })`,
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}