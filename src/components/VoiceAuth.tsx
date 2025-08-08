import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, Zap, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { gsap } from 'gsap';

interface VoiceAuthProps {
  onAuthSuccess: () => void;
}

export default function VoiceAuth({ onAuthSuccess }: VoiceAuthProps) {
  const [isListening, setIsListening] = useState(false);
  const [currentPitch, setCurrentPitch] = useState(0);
  const [authProgress, setAuthProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [audioData, setAudioData] = useState<number[]>([]);
  const { signInAnonymously, loading } = useAuth();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const progressRef = useRef(0);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const SCREAM_THRESHOLD = 25; // Threshold for "scream" detection
  const AUTH_DURATION = 2000; // 2 seconds of screaming required

  useEffect(() => {
    // GSAP animations for title
    if (titleRef.current) {
      gsap.fromTo(titleRef.current, 
        { 
          scale: 0.8, 
          opacity: 0,
          rotationX: -90 
        },
        { 
          scale: 1, 
          opacity: 1, 
          rotationX: 0,
          duration: 1.5, 
          ease: "back.out(1.7)",
          delay: 0.5
        }
      );
    }

    return () => {
      stopListening();
    };
  }, []);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      
      streamRef.current = stream;
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateAudioData = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray);
          setAudioData([...dataArray]);
          
          // Calculate pitch intensity
          const sum = dataArray.reduce((acc, val) => acc + val, 0);
          const average = sum / dataArray.length;
          const pitch = Math.min(average * 2, 255);
          setCurrentPitch(pitch);
          
          // Check if screaming (above threshold)
          if (pitch > SCREAM_THRESHOLD) {
            progressRef.current += 16; // ~60fps, so 16ms per frame
            const progress = Math.min((progressRef.current / AUTH_DURATION) * 100, 100);
            setAuthProgress(progress);
            
            // Trigger screen shake effect
            if (buttonRef.current) {
              gsap.to(buttonRef.current, {
                x: Math.random() * 4 - 2,
                y: Math.random() * 4 - 2,
                duration: 0.1,
                ease: "power2.out"
              });
            }
            
            // Auth complete
            if (progress >= 100) {
              handleAuthSuccess();
              return;
            }
          } else {
            // Decay progress when not screaming
            progressRef.current = Math.max(progressRef.current - 8, 0);
            setAuthProgress((progressRef.current / AUTH_DURATION) * 100);
          }
          
          animationRef.current = requestAnimationFrame(updateAudioData);
        }
      };
      
      updateAudioData();
      setIsListening(true);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to scream your way in!');
    }
  };

  const stopListening = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setIsListening(false);
    setAudioData([]);
    setCurrentPitch(0);
    progressRef.current = 0;
    setAuthProgress(0);
  };

  const handleAuthSuccess = async () => {
    setShowSuccess(true);
    stopListening();
    
    // Screen shatter effect
    if (titleRef.current) {
      gsap.to(titleRef.current, {
        scale: 1.2,
        opacity: 0,
        rotationY: 180,
        duration: 0.6,
        ease: "power2.in"
      });
    }
    
    try {
      await signInAnonymously();
      
      setTimeout(() => {
        onAuthSuccess();
      }, 1000);
    } catch (error) {
      console.error('Auth error:', error);
      setShowSuccess(false);
      setIsListening(false);
    }
  };

  const handleFakeScream = async () => {
    // Play scream sound effect
    const audio = new Audio();
    audio.volume = 0.3;
    
    // Create a synthetic scream sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.5);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
    
    // Trigger visual effects
    setCurrentPitch(50);
    setAuthProgress(100);
    
    // Screen shake
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        x: 10,
        y: 10,
        duration: 0.1,
        yoyo: true,
        repeat: 5,
        ease: "power2.inOut"
      });
    }
    
    setTimeout(() => {
      handleAuthSuccess();
    }, 1000);
  };

  // Canvas visualization
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

      if (audioData.length > 0) {
        drawScreamVisualization(ctx, width, height, audioData, currentPitch);
      } else {
        drawIdleState(ctx, width, height);
      }

      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [audioData, currentPitch]);

  const drawIdleState = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const time = Date.now() * 0.001;

    // Breathing circle
    const radius = 60 + Math.sin(time * 0.8) * 15;
    
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(255, 51, 102, 0.4)');
    gradient.addColorStop(0.7, 'rgba(155, 93, 229, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Pulsing text
    ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(time * 2) * 0.2})`;
    ctx.font = 'bold 16px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('READY TO SCREAM?', centerX, centerY + 100);
  };

  const drawScreamVisualization = (ctx: CanvasRenderingContext2D, width: number, height: number, data: number[], pitch: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const barCount = Math.min(data.length, 64);
    const time = Date.now() * 0.001;
    
    // Explosive center burst
    const burstRadius = 30 + (pitch / 255) * 150;
    const burstGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, burstRadius);
    burstGradient.addColorStop(0, `rgba(255, 51, 102, ${0.8 * (pitch / 255)})`);
    burstGradient.addColorStop(0.5, `rgba(155, 93, 229, ${0.6 * (pitch / 255)})`);
    burstGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    
    ctx.fillStyle = burstGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, burstRadius, 0, Math.PI * 2);
    ctx.fill();

    // Radiating bars
    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      const value = data[i] / 255;
      const barLength = 20 + value * 100 + (pitch / 255) * 50;
      
      const x1 = centerX + Math.cos(angle) * 80;
      const y1 = centerY + Math.sin(angle) * 80;
      const x2 = centerX + Math.cos(angle) * (80 + barLength);
      const y2 = centerY + Math.sin(angle) * (80 + barLength);
      
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, `rgba(255, 51, 102, ${0.8 * value})`);
      gradient.addColorStop(0.5, `rgba(155, 93, 229, ${0.9 * value})`);
      gradient.addColorStop(1, `rgba(0, 255, 255, ${1 * value})`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2 + value * 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Progress ring
    if (authProgress > 0) {
      const ringRadius = 120;
      const progressAngle = (authProgress / 100) * Math.PI * 2;
      
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, -Math.PI / 2, -Math.PI / 2 + progressAngle);
      ctx.stroke();
      
      // Glowing effect
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative scanlines grain-texture">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      <div className="relative z-10 text-center space-y-8 max-w-2xl mx-auto px-6">
        {/* Animated Title */}
        <motion.div
          ref={titleRef}
          className="space-y-4"
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-black text-white glow-text kinetic-text"
            animate={{
              textShadow: [
                "0 0 10px #ff3366, 0 0 20px #ff3366, 0 0 30px #ff3366",
                "0 0 20px #9b5de5, 0 0 40px #9b5de5, 0 0 60px #9b5de5",
                "0 0 15px #00ffff, 0 0 30px #00ffff, 0 0 45px #00ffff",
                "0 0 10px #ff3366, 0 0 20px #ff3366, 0 0 30px #ff3366"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            SCREAM
            <br />
            <span className="bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan bg-clip-text text-transparent">
              TO ENTER
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 font-light"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Release your voice. Unlock your space.
          </motion.p>
        </motion.div>

        {/* Auth Progress */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-4"
            >
              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto">
                <div className="h-4 bg-gray-800 rounded-full overflow-hidden border border-neon-purple/30">
                  <motion.div
                    className="h-full bg-gradient-to-r from-neon-pink to-neon-cyan"
                    style={{ width: `${authProgress}%` }}
                    animate={{
                      boxShadow: [
                        "0 0 10px rgba(255, 51, 102, 0.5)",
                        "0 0 20px rgba(0, 255, 255, 0.8)",
                        "0 0 10px rgba(255, 51, 102, 0.5)"
                      ]
                    }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                </div>
                <p className="text-center text-sm text-gray-400 mt-2">
                  {authProgress < 100 ? `${Math.round(authProgress)}% - KEEP SCREAMING!` : 'AUTHENTICATION COMPLETE!'}
                </p>
              </div>

              {/* Live Pitch Display */}
              <motion.div
                className="text-center"
                animate={{ scale: currentPitch > SCREAM_THRESHOLD ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-4xl font-black text-neon-cyan glow-text">
                  {Math.round(currentPitch)}
                </p>
                <p className="text-sm text-gray-400 uppercase tracking-wide">
                  {currentPitch > SCREAM_THRESHOLD ? 'SCREAMING!' : 'LISTENING...'}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Animation */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 2 }}
              className="absolute inset-0 flex items-center justify-center bg-dark/90"
            >
              <motion.div
                className="text-center"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <motion.div
                  className="w-32 h-32 mx-auto bg-gradient-to-r from-neon-pink to-neon-cyan rounded-full flex items-center justify-center shadow-neon-strong mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                >
                  <Zap size={48} className="text-white" />
                </motion.div>
                <h2 className="text-4xl font-black text-white glow-text">
                  WELCOME TO THE VOID
                </h2>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Buttons */}
        {!showSuccess && (
          <div className="space-y-4">
            <motion.button
              ref={buttonRef}
              onClick={isListening ? stopListening : startListening}
              disabled={loading}
              whileHover={{ 
                scale: 1.05,
                filter: "brightness(1.2)"
              }}
              whileTap={{ scale: 0.95 }}
              className={`relative group w-full max-w-md mx-auto py-6 px-8 rounded-2xl font-black text-xl transition-all duration-300 scream-button ${
                isListening 
                  ? 'bg-gradient-to-r from-neon-pink to-red-500 shadow-neon-strong' 
                  : 'bg-gradient-to-r from-neon-purple to-neon-pink shadow-neon'
              } text-white`}
            >
              {/* Pulse rings when listening */}
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-2xl border-2 border-neon-pink/50 pulse-ring"></div>
                  <div className="absolute inset-0 rounded-2xl border-2 border-neon-pink/30 pulse-ring" style={{ animationDelay: '0.5s' }}></div>
                </>
              )}
              
              <div className="flex items-center justify-center space-x-3">
                {loading ? (
                  <Loader size={28} className="animate-spin" />
                ) : isListening ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <Mic size={28} />
                  </motion.div>
                ) : (
                  <Mic size={28} />
                )}
                <span>
                  {loading ? 'CONNECTING...' : isListening ? 'SCREAM NOW!' : 'SCREAM TO ENTER'}
                </span>
              </div>
            </motion.button>

            {/* Fake Scream Button */}
            <motion.button
              onClick={handleFakeScream}
              disabled={loading || isListening}
              whileHover={{ 
                scale: 1.02,
                filter: "brightness(1.1)"
              }}
              whileTap={{ scale: 0.98 }}
              className="w-full max-w-md mx-auto py-4 px-6 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all duration-300 border border-gray-600 hover:border-neon-cyan scream-button disabled:opacity-50"
            >
              <div className="flex items-center justify-center space-x-2">
                <Volume2 size={20} />
                <span>FAKE SCREAM (NO MIC)</span>
              </div>
            </motion.button>
          </div>
        )}

        {/* Instructions */}
        {!isListening && !showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center space-y-2"
          >
            <p className="text-gray-400 text-sm">
              Scream for 2 seconds to authenticate
            </p>
            <p className="text-gray-500 text-xs">
              No passwords. No data saved. Just pure expression.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}