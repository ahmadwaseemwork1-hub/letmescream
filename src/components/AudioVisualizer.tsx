import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

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
        // Draw idle state
        drawIdleVisualization(ctx, width, height);
      } else {
        // Draw active audio visualization with smooth transitions
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
        // Smooth transition between old and new values
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

    // Draw breathing circle
    const radius = 50 + Math.sin(time * 0.5) * 10;
    
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(155, 93, 229, 0.3)');
    gradient.addColorStop(1, 'rgba(155, 93, 229, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw gentle baseline wavelength
    const barCount = 64;
    const waveHeight = height * 0.2;
    const waveY = centerY;
    const barWidth = width / barCount;
    
    for (let i = 0; i < barCount; i++) {
      const x = i * barWidth;
      // Create gentle wave pattern
      const waveValue = Math.sin((i / barCount) * Math.PI * 4 + time * 2) * 0.3 + 0.1;
      const barHeight = waveValue * waveHeight * 0.3;
      
      const gradient = ctx.createLinearGradient(x, waveY - barHeight, x, waveY + barHeight);
      gradient.addColorStop(0, 'rgba(155, 93, 229, 0.2)');
      gradient.addColorStop(0.5, 'rgba(255, 111, 145, 0.3)');
      gradient.addColorStop(1, 'rgba(155, 93, 229, 0.2)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, waveY - barHeight, barWidth - 1, barHeight * 2);
    }

    // Draw floating particles
    for (let i = 0; i < 5; i++) {
      const angle = (time + i * 1.2) * 0.3;
      const x = centerX + Math.cos(angle) * (80 + i * 20);
      const y = centerY + Math.sin(angle) * (80 + i * 20);
      const size = 2 + Math.sin(time + i) * 1;
      
      ctx.fillStyle = `rgba(255, 111, 145, ${0.4 + Math.sin(time + i) * 0.2})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawAudioVisualization = (ctx: CanvasRenderingContext2D, width: number, height: number, data: number[], pitch: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const barCount = Math.min(data.length, 64);
    
    // Smooth the data to prevent jittery movement
    const smoothedData = smoothData(data, 0.8);
    
    // Enhanced wavelength visualization - always present, smoothly animated
    const waveHeight = height * 0.4;
    const waveY = centerY;
    const barWidth = width / barCount;
    const time = Date.now() * 0.001;
    
    for (let i = 0; i < barCount; i++) {
      const x = i * barWidth;
      const rawValue = smoothedData[i] / 255;
      
      // Always show a baseline wave, enhanced by audio
      const baselineWave = Math.sin((i / barCount) * Math.PI * 6 + time * 3) * 0.15 + 0.1;
      const audioEnhancement = rawValue * 0.8;
      const combinedValue = Math.max(baselineWave, audioEnhancement);
      
      const barHeight = combinedValue * waveHeight * 0.8;
      
      // Create enhanced gradient for each bar
      const intensity = Math.min(combinedValue * 2, 1);
      const gradient = ctx.createLinearGradient(x, waveY - barHeight, x, waveY + barHeight);
      gradient.addColorStop(0, `rgba(155, 93, 229, ${0.4 + intensity * 0.5})`);
      gradient.addColorStop(0.3, `rgba(255, 111, 145, ${0.5 + intensity * 0.4})`);
      gradient.addColorStop(0.7, `rgba(195, 240, 255, ${0.6 + intensity * 0.3})`);
      gradient.addColorStop(1, `rgba(155, 93, 229, ${0.7 + intensity * 0.3})`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, waveY - barHeight, barWidth - 1, barHeight * 2);
      
      // Add glow effect for higher values
      if (combinedValue > 0.3) {
        ctx.shadowColor = `rgba(255, 111, 145, ${intensity * 0.6})`;
        ctx.shadowBlur = 6;
        ctx.fillRect(x, waveY - barHeight, barWidth - 1, barHeight * 2);
        ctx.shadowBlur = 0;
      }
    }

    // Enhanced circular visualization - always present with smooth transitions
    const circleRadius = 80;
    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      const rawValue = smoothedData[i] / 255;
      
      // Always show baseline circular pattern
      const baselineRadius = 15 + Math.sin(angle * 4 + time * 2) * 5;
      const audioRadius = rawValue * 80;
      const totalRadius = baselineRadius + audioRadius;
      
      const x1 = centerX + Math.cos(angle) * circleRadius;
      const y1 = centerY + Math.sin(angle) * circleRadius;
      const x2 = centerX + Math.cos(angle) * (circleRadius + totalRadius);
      const y2 = centerY + Math.sin(angle) * (circleRadius + totalRadius);
      
      // Create gradient for each bar
      const intensity = Math.min((rawValue + 0.2) * 1.5, 1);
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, `rgba(155, 93, 229, ${0.3 + intensity * 0.3})`);
      gradient.addColorStop(0.5, `rgba(255, 111, 145, ${0.4 + intensity * 0.4})`);
      gradient.addColorStop(1, `rgba(195, 240, 255, ${0.5 + intensity * 0.5})`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5 + rawValue * 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Enhanced central energy burst based on pitch
    const pitchNormalized = Math.min(pitch / 75, 1);
    const baseBurstRadius = 30 + Math.sin(time * 2) * 10; // Always present baseline
    const pitchBurstRadius = pitchNormalized * 120;
    const totalBurstRadius = baseBurstRadius + pitchBurstRadius;
    
    // Multiple layered bursts for more dramatic effect
    for (let layer = 0; layer < 3; layer++) {
      const layerRadius = totalBurstRadius * (1 - layer * 0.25);
      const baseOpacity = 0.1 + Math.sin(time + layer) * 0.05;
      const pitchOpacity = pitchNormalized * 0.6;
      const layerOpacity = (baseOpacity + pitchOpacity) * (1 - layer * 0.25);
      
      const burstGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, layerRadius);
      burstGradient.addColorStop(0, `rgba(252, 252, 252, ${layerOpacity * 0.6})`);
      burstGradient.addColorStop(0.3, `rgba(155, 93, 229, ${layerOpacity * 0.5})`);
      burstGradient.addColorStop(0.6, `rgba(255, 111, 145, ${layerOpacity * 0.3})`);
      burstGradient.addColorStop(1, 'rgba(155, 93, 229, 0)');
      
      ctx.fillStyle = burstGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, layerRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Enhanced pitch intensity rings - always show some rings, more with higher pitch
    const baseRings = 2;
    const pitchRings = Math.floor(pitchNormalized * 3);
    const totalRings = baseRings + pitchRings;
    
    for (let ring = 0; ring < totalRings; ring++) {
      const ringRadius = 40 + (ring * 15) + (pitchNormalized * 20) + Math.sin(time + ring) * 5;
      const baseOpacity = 0.1;
      const pitchOpacity = pitchNormalized * 0.4;
      const ringOpacity = (baseOpacity + pitchOpacity) * (1 - ring * 0.2);
      
      ctx.strokeStyle = `rgba(252, 252, 252, ${ringOpacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  return (
    <div className="relative w-full h-96">
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
          <div className="text-center text-light-gray/70">
            <motion.p 
              className="text-xl mb-2"
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