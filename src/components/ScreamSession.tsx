import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Activity, Timer, TrendingUp, Zap } from 'lucide-react';
import { gsap } from 'gsap';
import AudioVisualizer from './AudioVisualizer';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface ScreamSessionProps {
  onScreamEnd: (maxPitch: number, duration: number, audioBlob?: Blob) => void;
}

export default function ScreamSession({ onScreamEnd }: ScreamSessionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);
  const [maxPitchReached, setMaxPitchReached] = useState(0);
  const { startRecording, stopRecording, audioData, isActive, currentPitch, recordedBlob } = useAudioRecorder();
  const sessionTimerRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // GSAP entrance animation
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { 
          scale: 0.8, 
          opacity: 0,
          rotationY: 15
        },
        { 
          scale: 1, 
          opacity: 1,
          rotationY: 0,
          duration: 1, 
          ease: "back.out(1.7)"
        }
      );
    }

    const timer = setTimeout(() => {
      setShowInstructions(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentPitch > maxPitchReached) {
      setMaxPitchReached(currentPitch);
    }

    // Screen shake for high intensity
    if (currentPitch > 45 && buttonRef.current) {
      gsap.to(buttonRef.current, {
        x: Math.random() * 8 - 4,
        y: Math.random() * 8 - 4,
        duration: 0.1,
        ease: "power2.out"
      });
    }
  }, [currentPitch, maxPitchReached]);

  useEffect(() => {
    if (isRecording) {
      sessionTimerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    }

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    if (isRecording) {
      stopRecording();
      setIsRecording(false);
      
      // Explosive exit animation
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          scale: 1.1,
          opacity: 0,
          rotationY: 180,
          duration: 0.6,
          ease: "power2.in"
        });
      }
      
      setTimeout(() => {
        onScreamEnd(maxPitchReached, sessionTime, recordedBlob);
      }, 300);
    } else {
      try {
        await startRecording();
        setIsRecording(true);
        setSessionTime(0);
        setMaxPitchReached(0);
      } catch (error) {
        console.error('Failed to start recording:', error);
        alert('MICROPHONE ACCESS REQUIRED TO SCREAM!');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getIntensityColor = (pitch: number) => {
    if (pitch < 15) return 'text-neon-cyan';
    if (pitch < 30) return 'text-neon-purple';
    if (pitch < 40) return 'text-neon-pink';
    if (pitch < 50) return 'text-red-400';
    return 'text-white';
  };

  const getIntensityLabel = (pitch: number) => {
    if (pitch < 15) return 'CALM';
    if (pitch < 30) return 'MODERATE';
    if (pitch < 40) return 'INTENSE';
    if (pitch < 50) return 'EXTREME';
    return 'MAXIMUM';
  };

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col items-center justify-center px-6 scanlines grain-texture">
      {/* Instructions */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            className="absolute top-20 text-center z-20"
          >
            <motion.p 
              className="text-white text-2xl font-bold glow-text"
              animate={{
                scale: [1, 1.05, 1],
                textShadow: [
                  "0 0 10px #ff3366",
                  "0 0 20px #9b5de5",
                  "0 0 10px #ff3366"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              CLICK TO START. SPEAK, SHOUT, OR SCREAM!
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Session Stats */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20"
          >
            <motion.div 
              className="bg-dark-card rounded-2xl px-8 py-6 border border-neon-purple/50 shadow-neon-strong backdrop-blur-sm"
              animate={{ 
                borderColor: currentPitch > 30 ? "rgba(255, 51, 102, 0.8)" : "rgba(155, 93, 229, 0.5)"
              }}
            >
              <div className="flex items-center space-x-8">
                {/* Timer */}
                <div className="flex items-center space-x-2">
                  <Timer size={20} className="text-neon-cyan" />
                  <span className="text-white font-mono text-xl font-bold glow-text">{formatTime(sessionTime)}</span>
                </div>
                
                {/* Current Intensity */}
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ rotate: currentPitch > 20 ? 360 : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Activity size={20} className="text-neon-purple" />
                  </motion.div>
                  <span className={`font-mono text-xl font-black ${getIntensityColor(currentPitch)}`}>
                    {Math.round(currentPitch)}
                  </span>
                  <span className={`text-xs font-bold ${getIntensityColor(currentPitch)}`}>
                    {getIntensityLabel(currentPitch)}
                  </span>
                </div>
                
                {/* Max Reached */}
                <div className="flex items-center space-x-2">
                  <TrendingUp size={20} className="text-neon-pink" />
                  <span className="text-neon-pink font-mono text-xl font-black glow-text">
                    {Math.round(maxPitchReached)}
                  </span>
                </div>
              </div>
              
              {/* Enhanced Intensity Bar */}
              <div className="mt-4 w-full">
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                  <motion.div
                    className="h-full bg-gradient-to-r from-neon-cyan via-neon-purple via-neon-pink to-white"
                    style={{ width: `${Math.min((currentPitch / 60) * 100, 100)}%` }}
                    animate={{
                      boxShadow: currentPitch > 30 ? [
                        "0 0 10px rgba(255, 51, 102, 0.8)",
                        "0 0 20px rgba(255, 51, 102, 1)",
                        "0 0 10px rgba(255, 51, 102, 0.8)"
                      ] : "none"
                    }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio Visualizer */}
      <div className="flex-1 flex items-center justify-center w-full max-w-5xl">
        <AudioVisualizer 
          audioData={audioData} 
          isActive={isActive}
          isRecording={isRecording}
          currentPitch={currentPitch}
        />
      </div>

      {/* Explosive Scream Button */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-24"
      >
        <div className="relative">
          {/* Pulse rings */}
          {isRecording && (
            <>
              <motion.div 
                className="absolute inset-0 w-40 h-40 rounded-full border-4 border-neon-pink/40"
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div 
                className="absolute inset-0 w-40 h-40 rounded-full border-4 border-neon-purple/40"
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
              <motion.div 
                className="absolute inset-0 w-40 h-40 rounded-full border-4 border-neon-cyan/40"
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              />
            </>
          )}
          
          <motion.button
            ref={buttonRef}
            onClick={handleStartRecording}
            whileHover={{ 
              scale: 1.1,
              filter: "brightness(1.3)"
            }}
            whileTap={{ scale: 0.9 }}
            animate={isRecording ? {
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            } : {}}
            transition={isRecording ? { duration: 0.5, repeat: Infinity } : {}}
            className={`scream-button group relative w-40 h-40 rounded-full font-black text-white shadow-neon-strong transition-all duration-300 ${
              isRecording 
                ? 'bg-gradient-to-r from-red-500 via-neon-pink to-neon-purple' 
                : 'bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan'
            }`}
          >
            {/* Inner energy core */}
            <motion.div 
              className={`absolute inset-4 rounded-full ${
                isRecording ? 'bg-red-500/30' : 'bg-neon-purple/30'
              }`}
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            
            <div className="relative z-10 flex flex-col items-center justify-center">
              {isRecording ? (
                <>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Square size={40} />
                  </motion.div>
                  <span className="text-sm mt-2 font-black">STOP</span>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Mic size={40} />
                  </motion.div>
                  <span className="text-sm mt-2 font-black">START</span>
                </>
              )}
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Dynamic Feedback */}
      <AnimatePresence>
        {isRecording && currentPitch > 10 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-72 text-center"
          >
            <motion.div
              animate={{ 
                scale: currentPitch > 30 ? [1, 1.1, 1] : [1, 1.05, 1],
                y: [0, -5, 0]
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <motion.p
                className="text-neon-pink font-black text-2xl glow-text mb-2"
                animate={{
                  textShadow: [
                    "0 0 10px #ff3366",
                    "0 0 30px #ff3366",
                    "0 0 10px #ff3366"
                  ]
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {currentPitch > 40 ? 'INCREDIBLE! MAXIMUM POWER!' : 
                 currentPitch > 25 ? 'PERFECT! KEEP GOING!' : 
                 'GREAT! LET IT ALL OUT!'}
              </motion.p>
              <motion.p 
                className="text-gray-300 text-sm font-medium"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {currentPitch > 40 ? 'YOU ARE UNSTOPPABLE!' : 'RELEASE ALL THAT ENERGY!'}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Encouragement for quiet periods */}
      <AnimatePresence>
        {isRecording && currentPitch <= 10 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-72 text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.15, 1],
                y: [0, -8, 0]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <motion.p
                className="text-white font-black text-3xl glow-text mb-2"
                animate={{
                  textShadow: [
                    "0 0 15px #9b5de5",
                    "0 0 30px #9b5de5",
                    "0 0 15px #9b5de5"
                  ]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                LOUDER! LET IT OUT!
              </motion.p>
              <motion.p 
                className="text-gray-300 text-lg font-bold"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.8, 1, 0.8] 
                }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                TALK, SHOUT, OR SCREAM - WHATEVER FEELS RIGHT!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}