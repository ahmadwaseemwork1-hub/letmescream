import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FloatingParticles() {
  const ref = useRef<THREE.Points>(null);
  
  // Generate random positions for particles
  const particleCount = 1000;
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.1;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#9B5DE5"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

function WaveformMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -5]}>
      <torusGeometry args={[3, 0.1, 16, 100]} />
      <meshBasicMaterial color="#FF6F91" transparent opacity={0.3} />
    </mesh>
  );
}

export default function BackgroundEffects() {
  return (
    <>
      {/* 3D Canvas Background */}
      <div className="fixed inset-0 three-canvas">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={0.5} color="#9B5DE5" />
          <pointLight position={[-10, -10, -10]} intensity={0.3} color="#FF6F91" />
          <FloatingParticles />
          <WaveformMesh />
        </Canvas>
      </div>

      {/* 2D Overlay Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Animated gradient background */}
        <div className="absolute inset-0 dark-gradient-bg" />
        
        {/* Floating neon particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full floating-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `linear-gradient(45deg, ${
                i % 3 === 0 ? '#9B5DE5' : i % 3 === 1 ? '#FF6F91' : '#C3F0FF'
              }, transparent)`,
              boxShadow: `0 0 10px ${
                i % 3 === 0 ? '#9B5DE5' : i % 3 === 1 ? '#FF6F91' : '#C3F0FF'
              }`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
        
        {/* Larger floating elements with neon glow */}
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={`large-${i}`}
            className="absolute w-12 h-12 border-2 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              borderColor: i % 2 === 0 ? '#9B5DE5' : '#FF6F91',
              boxShadow: `0 0 20px ${i % 2 === 0 ? '#9B5DE5' : '#FF6F91'}`,
            }}
            animate={{
              y: [0, -60, 0],
              x: [0, Math.random() * 60 - 30, 0],
              rotate: [0, 360, 720],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 12 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
        
        {/* Neon wave lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="neonWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9B5DE5" stopOpacity="0" />
              <stop offset="50%" stopColor="#9B5DE5" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#9B5DE5" stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <motion.path
            d="M0,400 Q400,300 800,400 T1600,400"
            stroke="url(#neonWaveGradient)"
            strokeWidth="3"
            fill="none"
            filter="url(#glow)"
            animate={{
              d: [
                "M0,400 Q400,300 800,400 T1600,400",
                "M0,350 Q400,450 800,350 T1600,350",
                "M0,400 Q400,300 800,400 T1600,400",
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <motion.path
            d="M0,200 Q400,100 800,200 T1600,200"
            stroke="#FF6F91"
            strokeWidth="2"
            fill="none"
            filter="url(#glow)"
            opacity="0.6"
            animate={{
              d: [
                "M0,200 Q400,100 800,200 T1600,200",
                "M0,250 Q400,50 800,250 T1600,250",
                "M0,200 Q400,100 800,200 T1600,200",
              ],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </svg>
      </div>
    </>
  );
}