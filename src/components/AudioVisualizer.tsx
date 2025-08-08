import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

interface AudioVisualizerProps {
  audioData: number[];
  isActive: boolean;
  isRecording: boolean;
  currentPitch: number;
}

export default function AudioVisualizer({ audioData, isActive, isRecording, currentPitch }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const smoothedDataRef = useRef<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

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
        drawExplosiveVisualization(ctx, width, height, audioData, currentPitch);
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

  // Screen shake effect for high intensity
  useEffect(() => {
    if (currentPitch > 40 && containerRef.current) {
      gsap.to(containerRef.current, {
        x: Math.random() * 6 - 3,
        y: Math.random() * 6 - 3,
        duration: 0.1,
        ease: "power2.out"
      });
    }
  }, [currentPitch]);

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

    // Breathing energy core
    const coreRadius = 40 + Math.sin(time * 1.2) * 15;
    
    const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
    coreGradient.addColorStop(0, 'rgba(255, 51, 102, 0.6)');
    coreGradient.addColorStop(0.5, 'rgba(155, 93, 229, 0.4)');
    coreGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
    ctx.fill();

    // Idle wavelength
    const barCount = 64;
    const waveHeight = height * 0.3;
    const waveY = centerY;
    const barWidth = width / barCount;
    
    for (let i = 0; i < barCount; i++) {
      const x = i * barWidth;
      const waveValue = Math.sin((i / barCount) * Math.PI * 6 + time * 3) * 0.4 + 0.2;
      const barHeight = waveValue * waveHeight * 0.4;
      
      const gradient = ctx.createLinearGradient(x, waveY - barHeight, x, waveY + barHeight);
      gradient.addColorStop(0, 'rgba(255, 51, 102, 0.3)');
      gradient.addColorStop(0.5, 'rgba(155, 93, 229, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 255, 255, 0.3)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, waveY - barHeight, barWidth - 1, barHeight * 2);
    }

    // Floating energy particles
    for (let i = 0; i < 8; i++) {
      const angle = (time + i * 0.8) * 0.5;
      const radius = 100 + Math.sin(time + i) * 30;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const size = 3 + Math.sin(time * 2 + i) * 2;
      
      ctx.fillStyle = `rgba(0, 255, 255, ${0.6 + Math.sin(time + i) * 0.3})`;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  };

  const drawExplosiveVisualization = (ctx: CanvasRenderingContext2D, width: number, height: number, data: number[], pitch: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const barCount = Math.min(data.length, 128);
    const time = Date.now() * 0.001;
    
    const smoothedData = smoothData(data, 0.8);
    const pitchNormalized = Math.min(pitch / 100, 1);

    // Explosive center burst
    const burstRadius = 50 + pitchNormalized * 200;
    const burstGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, burstRadius);
    burstGradient.addColorStop(0, `rgba(255, 255, 255, ${0.8 * pitchNormalized})`);
    burstGradient.addColorStop(0.3, `rgba(255, 51, 102, ${0.6 * pitchNormalized})`);
    burstGradient.addColorStop(0.6, `rgba(155, 93, 229, ${0.4 * pitchNormalized})`);
    burstGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    
    ctx.fillStyle = burstGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, burstRadius, 0, Math.PI * 2);
    ctx.fill();

    // Radiating energy bars
    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      const value = smoothedData[i] / 255;
      const baseLength = 60;
      const audioLength = value * 150;
      const pitchBoost = pitchNormalized * 100;
      const totalLength = baseLength + audioLength + pitchBoost;
      
      const x1 = centerX + Math.cos(angle) * 80;
      const y1 = centerY + Math.sin(angle) * 80;
      const x2 = centerX + Math.cos(angle) * (80 + totalLength);
      const y2 = centerY + Math.sin(angle) * (80 + totalLength);
      
      const intensity = Math.max(value, pitchNormalized * 0.5);
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${intensity * 0.8})`);
      gradient.addColorStop(0.3, `rgba(255, 51, 102, ${intensity})`);
      gradient.addColorStop(0.7, `rgba(155, 93, 229, ${intensity * 0.9})`);
      gradient.addColorStop(1, `rgba(0, 255, 255, ${intensity * 0.7})`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2 + intensity * 6;
      ctx.lineCap = 'round';
      
      // Glow effect for high intensity
      if (intensity > 0.5) {
        ctx.shadowColor = '#ff3366';
        ctx.shadowBlur = 15;
      }
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Circular wavelength
    const circleRadius = 120 + pitchNormalized * 80;
    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      const value = smoothedData[i] / 255;
      const waveRadius = 20 + value * 60 + pitchNormalized * 40;
      
      const x = centerX + Math.cos(angle) * circleRadius;
      const y = centerY + Math.sin(angle) * circleRadius;
      
      const intensity = Math.max(value, pitchNormalized * 0.3);
      ctx.fillStyle = `rgba(0, 255, 255, ${intensity * 0.8})`;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(x, y, waveRadius * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Energy lightning effects for high pitch
    if (pitchNormalized > 0.7) {
      for (let i = 0; i < 5; i++) {
        const startAngle = Math.random() * Math.PI * 2;
        const startRadius = 100;
        const endRadius = 200 + Math.random() * 100;
        
        const x1 = centerX + Math.cos(startAngle) * startRadius;
        const y1 = centerY + Math.sin(startAngle) * startRadius;
        const x2 = centerX + Math.cos(startAngle) * endRadius;
        const y2 = centerY + Math.sin(startAngle) * endRadius;
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-96">
      <motion.canvas
        ref={canvasRef}
        className="w-full h-full"
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
          <div className="text-center text-gray-400">
            <motion.p 
              className="text-2xl mb-3 font-bold glow-text"
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isRecording ? "LISTENING FOR YOUR VOICE..." : "READY TO CAPTURE YOUR ENERGY"}
            </motion.p>
            <motion.p 
              className="text-sm text-gray-500"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {isRecording ? "Speak, shout, or scream to see the magic!" : "Click the button and unleash your voice"}
            </motion.p>
          </div>
        </motion.div>
      )}
    </div>
  );
}