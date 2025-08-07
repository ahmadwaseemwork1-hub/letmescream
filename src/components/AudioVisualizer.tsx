import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface AudioVisualizerProps {
  audioData: number[];
  isActive: boolean;
  isRecording: boolean;
  currentPitch: number;
}

function VisualizerSphere({ intensity, audioData }: { intensity: number; audioData: number[] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.scale.setScalar(1 + intensity * 0.5);
    }

    if (materialRef.current) {
      materialRef.current.distort = 0.2 + intensity * 0.8;
      materialRef.current.speed = 1 + intensity * 4;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]}>
      <MeshDistortMaterial
        ref={materialRef}
        color={intensity > 0.5 ? "#FF6F91" : intensity > 0.2 ? "#9B5DE5" : "#C3F0FF"}
        attach="material"
        distort={0.2 + intensity * 0.8}
        speed={1 + intensity * 4}
        roughness={0}
        metalness={0.8}
        transparent
        opacity={0.8}
      />
    </Sphere>
  );
}

function AudioBars({ audioData, intensity }: { audioData: number[]; intensity: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      {audioData.slice(0, 32).map((value, i) => {
        const height = Math.max(0.1, (value / 255) * 3 + intensity * 2);
        const angle = (i / 32) * Math.PI * 2;
        const radius = 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <mesh key={i} position={[x, 0, z]}>
            <boxGeometry args={[0.1, height, 0.1]} />
            <meshBasicMaterial 
              color={intensity > 0.5 ? "#FF6F91" : "#9B5DE5"} 
              transparent 
              opacity={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function AudioVisualizer({ audioData, isActive, isRecording, currentPitch }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const smoothedDataRef = useRef<number[]>([]);
  const intensityNormalized = Math.min(currentPitch / 60, 1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      
      ctx.clearRect(0, 0, width, height);

      if (!isActive || audioData.length === 0) {
        drawIdleVisualization(ctx, width, height);
      } else {
        drawAudioVisualization(ctx, width, height, audioData, currentPitch);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioData, isActive, currentPitch]);

  const smoothData = (newData: number[], smoothingFactor: number = 0.7) => {
    if (smoothedDataRef.current.length === 0) {
      smoothedDataRef.current = [...newData];
      return smoothedDataRef.current;
    }

    for (let i = 0; i < newData.length; i++) {
      if (smoothedDataRef.current[i] !== undefined) {
        smoothedDataRef.current[i] = smoothedDataRef.current[i] * smoothingFactor + newData[i] * (1 - smoothingFactor);
      } else {
        smoothedDataRef.current[i] = newData[i];
      }
    }

    return smoothedDataRef.current;
  };

  const drawIdleVisualization = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const time = Date.now() * 0.001;

    // Neon breathing circle
    const radius = 60 + Math.sin(time * 0.8) * 15;
    
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(155, 93, 229, 0.4)');
    gradient.addColorStop(0.7, 'rgba(255, 111, 145, 0.2)');
    gradient.addColorStop(1, 'rgba(155, 93, 229, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Neon baseline wavelength
    const barCount = 64;
    const waveHeight = height * 0.3;
    const waveY = centerY;
    const barWidth = width / barCount;
    
    for (let i = 0; i < barCount; i++) {
      const x = i * barWidth;
      const waveValue = Math.sin((i / barCount) * Math.PI * 6 + time * 3) * 0.4 + 0.2;
      const barHeight = waveValue * waveHeight * 0.4;
      
      const gradient = ctx.createLinearGradient(x, waveY - barHeight, x, waveY + barHeight);
      gradient.addColorStop(0, 'rgba(155, 93, 229, 0.6)');
      gradient.addColorStop(0.5, 'rgba(255, 111, 145, 0.8)');
      gradient.addColorStop(1, 'rgba(195, 240, 255, 0.6)');
      
      ctx.fillStyle = gradient;
      ctx.shadowColor = '#9B5DE5';
      ctx.shadowBlur = 10;
      ctx.fillRect(x, waveY - barHeight, barWidth - 1, barHeight * 2);
      ctx.shadowBlur = 0;
    }

    // Floating neon particles
    for (let i = 0; i < 8; i++) {
      const angle = (time + i * 0.8) * 0.5;
      const x = centerX + Math.cos(angle) * (100 + i * 25);
      const y = centerY + Math.sin(angle) * (100 + i * 25);
      const size = 3 + Math.sin(time + i) * 2;
      
      const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
      particleGradient.addColorStop(0, `rgba(255, 111, 145, ${0.8 + Math.sin(time + i) * 0.2})`);
      particleGradient.addColorStop(1, 'rgba(255, 111, 145, 0)');
      
      ctx.fillStyle = particleGradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawAudioVisualization = (ctx: CanvasRenderingContext2D, width: number, height: number, data: number[], pitch: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const barCount = Math.min(data.length, 64);
    const time = Date.now() * 0.001;
    
    const smoothedData = smoothData(data, 0.8);
    const pitchNormalized = Math.min(pitch / 75, 1);
    
    // Enhanced neon wavelength visualization
    const waveHeight = height * 0.5;
    const waveY = centerY;
    const barWidth = width / barCount;
    
    for (let i = 0; i < barCount; i++) {
      const x = i * barWidth;
      const rawValue = smoothedData[i] / 255;
      
      const baselineWave = Math.sin((i / barCount) * Math.PI * 8 + time * 4) * 0.2 + 0.15;
      const audioEnhancement = rawValue * 1.2;
      const combinedValue = Math.max(baselineWave, audioEnhancement);
      
      const barHeight = combinedValue * waveHeight;
      
      const intensity = Math.min(combinedValue * 2, 1);
      const gradient = ctx.createLinearGradient(x, waveY - barHeight, x, waveY + barHeight);
      
      if (pitchNormalized > 0.7) {
        gradient.addColorStop(0, `rgba(255, 111, 145, ${0.8 + intensity * 0.2})`);
        gradient.addColorStop(0.5, `rgba(195, 240, 255, ${0.9 + intensity * 0.1})`);
        gradient.addColorStop(1, `rgba(155, 93, 229, ${0.8 + intensity * 0.2})`);
      } else {
        gradient.addColorStop(0, `rgba(155, 93, 229, ${0.6 + intensity * 0.4})`);
        gradient.addColorStop(0.5, `rgba(255, 111, 145, ${0.7 + intensity * 0.3})`);
        gradient.addColorStop(1, `rgba(195, 240, 255, ${0.8 + intensity * 0.2})`);
      }
      
      ctx.fillStyle = gradient;
      ctx.shadowColor = pitchNormalized > 0.5 ? '#FF6F91' : '#9B5DE5';
      ctx.shadowBlur = 15 + intensity * 10;
      ctx.fillRect(x, waveY - barHeight, barWidth - 1, barHeight * 2);
      ctx.shadowBlur = 0;
    }

    // Enhanced circular visualization with neon glow
    const circleRadius = 120;
    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      const rawValue = smoothedData[i] / 255;
      
      const baselineRadius = 20 + Math.sin(angle * 6 + time * 3) * 8;
      const audioRadius = rawValue * 100;
      const totalRadius = baselineRadius + audioRadius;
      
      const x1 = centerX + Math.cos(angle) * circleRadius;
      const y1 = centerY + Math.sin(angle) * circleRadius;
      const x2 = centerX + Math.cos(angle) * (circleRadius + totalRadius);
      const y2 = centerY + Math.sin(angle) * (circleRadius + totalRadius);
      
      const intensity = Math.min((rawValue + 0.3) * 1.5, 1);
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      
      if (pitchNormalized > 0.6) {
        gradient.addColorStop(0, `rgba(255, 111, 145, ${0.8 + intensity * 0.2})`);
        gradient.addColorStop(0.5, `rgba(195, 240, 255, ${0.9 + intensity * 0.1})`);
        gradient.addColorStop(1, `rgba(155, 93, 229, ${0.7 + intensity * 0.3})`);
      } else {
        gradient.addColorStop(0, `rgba(155, 93, 229, ${0.6 + intensity * 0.4})`);
        gradient.addColorStop(0.5, `rgba(255, 111, 145, ${0.7 + intensity * 0.3})`);
        gradient.addColorStop(1, `rgba(195, 240, 255, ${0.8 + intensity * 0.2})`);
      }
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2 + rawValue * 4;
      ctx.shadowColor = pitchNormalized > 0.5 ? '#FF6F91' : '#9B5DE5';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Enhanced central energy burst with multiple layers
    const baseBurstRadius = 40 + Math.sin(time * 3) * 15;
    const pitchBurstRadius = pitchNormalized * 150;
    const totalBurstRadius = baseBurstRadius + pitchBurstRadius;
    
    for (let layer = 0; layer < 4; layer++) {
      const layerRadius = totalBurstRadius * (1 - layer * 0.2);
      const baseOpacity = 0.15 + Math.sin(time + layer) * 0.1;
      const pitchOpacity = pitchNormalized * 0.8;
      const layerOpacity = (baseOpacity + pitchOpacity) * (1 - layer * 0.2);
      
      const burstGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, layerRadius);
      
      if (pitchNormalized > 0.7) {
        burstGradient.addColorStop(0, `rgba(255, 255, 255, ${layerOpacity * 0.8})`);
        burstGradient.addColorStop(0.3, `rgba(255, 111, 145, ${layerOpacity * 0.6})`);
        burstGradient.addColorStop(0.7, `rgba(195, 240, 255, ${layerOpacity * 0.4})`);
        burstGradient.addColorStop(1, 'rgba(155, 93, 229, 0)');
      } else {
        burstGradient.addColorStop(0, `rgba(255, 255, 255, ${layerOpacity * 0.6})`);
        burstGradient.addColorStop(0.3, `rgba(155, 93, 229, ${layerOpacity * 0.5})`);
        burstGradient.addColorStop(0.7, `rgba(255, 111, 145, ${layerOpacity * 0.3})`);
        burstGradient.addColorStop(1, 'rgba(155, 93, 229, 0)');
      }
      
      ctx.fillStyle = burstGradient;
      ctx.shadowColor = pitchNormalized > 0.5 ? '#FF6F91' : '#9B5DE5';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(centerX, centerY, layerRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Enhanced neon rings
    const baseRings = 3;
    const pitchRings = Math.floor(pitchNormalized * 4);
    const totalRings = baseRings + pitchRings;
    
    for (let ring = 0; ring < totalRings; ring++) {
      const ringRadius = 60 + (ring * 20) + (pitchNormalized * 30) + Math.sin(time * 2 + ring) * 8;
      const baseOpacity = 0.2;
      const pitchOpacity = pitchNormalized * 0.6;
      const ringOpacity = (baseOpacity + pitchOpacity) * (1 - ring * 0.15);
      
      ctx.strokeStyle = pitchNormalized > 0.5 
        ? `rgba(255, 111, 145, ${ringOpacity})` 
        : `rgba(155, 93, 229, ${ringOpacity})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = pitchNormalized > 0.5 ? '#FF6F91' : '#9B5DE5';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  };

  return (
    <div className="relative w-full h-96">
      {/* 3D Background Visualization */}
      <div className="absolute inset-0 opacity-60">
        <Canvas camera={{ position: [0, 0, 6] }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} color="#9B5DE5" intensity={0.5} />
          <pointLight position={[-10, -10, -10]} color="#FF6F91" intensity={0.3} />
          <VisualizerSphere intensity={intensityNormalized} audioData={audioData} />
          <AudioBars audioData={audioData} intensity={intensityNormalized} />
        </Canvas>
      </div>

      {/* 2D Canvas Overlay */}
      <motion.canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      {(!isActive || currentPitch < 5) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center text-neon-white/70">
            <motion.p 
              className="text-xl mb-2 neon-text-cyan"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isRecording ? "Listening..." : "Ready to listen"}
            </motion.p>
            <p className="text-sm">
              {isRecording ? "Speak or shout to enhance the visualization!" : "Click the button and let it out"}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}