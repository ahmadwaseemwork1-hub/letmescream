import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Activity, Timer, TrendingUp, Zap } from 'lucide-react';
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstructions(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentPitch > maxPitchReached) {
      setMaxPitchReached(currentPitch);
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
      onScreamEnd(maxPitchReached, sessionTime, recordedBlob);
    } else {
      try {
        await startRecording();
        setIsRecording(true);
        setSessionTime(0);
        setMaxPitchReached(0);
      } catch (error) {
        console.error('Failed to start recording:', error);
        alert('Please allow microphone access to scream');
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
    if (pitch < 50) return 'text-neon-pink';
    return 'text-neon-white';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Instructions */}
      {showInstructions && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-20 text-center"
        >
          <motion.p 
            className="text-neon-white text-lg neon-text-cyan"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Click to start. Speak, shout, or scream to see the magic!
          </motion.p>
        </motion.div>
      )}

      {/* Enhanced Session Stats */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="bg-dark-surface/90 backdrop-blur-md rounded-2xl px-6 py-4 border border-neon-purple/30 shadow-2xl neon-border">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Timer size={18} className="text-neon-cyan" />
                <span className="text-neon-white font-mono text-lg">{formatTime(sessionTime)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Activity size={18} className="text-neon-purple" />
                <span className={`font-mono text-lg ${getIntensityColor(currentPitch)}`}>
                  {Math.round(currentPitch)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <TrendingUp size={18} className="text-neon-pink" />
                <span className="text-neon-pink font-mono text-lg">
                  {Math.round(maxPitchReached)}
                </span>
              </div>
            </div>
            
            <div className="mt-3 w-full">
              <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink"
                  style={{ width: `${Math.min((currentPitch / 50) * 100, 100)}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Audio Visualizer */}
      <div className="flex-1 flex items-center justify-center w-full max-w-4xl">
        <AudioVisualizer 
          audioData={audioData} 
          isActive={isActive}
          isRecording={isRecording}
          currentPitch={currentPitch}
        />
      </div>

      {/* Enhanced Scream Button */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-20"
      >
        <div className="relative">
          {isRecording && (
            <>
              <motion.div 
                className="absolute inset-0 w-32 h-32 rounded-full border-2 border-neon-pink/40"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div 
                className="absolute inset-0 w-32 h-32 rounded-full border-2 border-neon-cyan/30"
                animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
              <motion.div 
                className="absolute inset-0 w-32 h-32 rounded-full border-2 border-neon-purple/20"
                animate={{ scale: [1, 2.2, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              />
            </>
          )}
          
          <motion.button
            onClick={handleStartRecording}
            whileHover={{ 
              scale: 1.1,
              rotate: [0, -3, 3, 0],
              transition: { rotate: { duration: 0.3 } }
            }}
            whileTap={{ scale: 0.9 }}
            className={`scream-button group relative w-32 h-32 rounded-full font-bold text-dark-bg shadow-2xl transition-all duration-300 ${
              isRecording 
                ? 'bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-pink/80 hover:to-neon-purple/80 scale-110' 
                : 'bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-purple/80 hover:to-neon-pink/80'
            } neon-glow cursor-scream`}
          >
            <div className={`absolute inset-2 rounded-full ${
              isRecording ? 'bg-neon-pink/20' : 'bg-neon-purple/20'
            } animate-pulse`}></div>
            
            <div className="relative z-10 flex flex-col items-center justify-center">
              {isRecording ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Square size={32} className="mb-2" />
                  </motion.div>
                  <span className="text-sm">Stop</span>
                </>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                  >
                    <Mic size={32} className="mb-2 group-hover:animate-bounce" />
                  </motion.div>
                  <span className="text-sm">Start</span>
                </>
              )}
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Live feedback */}
      {isRecording && currentPitch > 5 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-60 text-center"
        >
          <motion.p
            animate={{ 
              scale: [1, 1.1, 1],
              textShadow: [
                '0 0 10px rgba(255, 111, 145, 0.5)',
                '0 0 20px rgba(255, 111, 145, 0.8)',
                '0 0 10px rgba(255, 111, 145, 0.5)'
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-neon-pink font-medium text-lg neon-text-pink"
          >
            Perfect! Keep expressing yourself!
          </motion.p>
          <p className="text-neon-white/70 text-sm mt-2">
            Let all that energy flow out
          </p>
        </motion.div>
      )}

      {/* Encouragement for quiet periods */}
      {isRecording && currentPitch <= 5 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-60 text-center"
        >
          <motion.p
            animate={{ 
              scale: [1, 1.15, 1],
              textShadow: [
                '0 0 10px rgba(155, 93, 229, 0.5)',
                '0 0 20px rgba(155, 93, 229, 0.8)',
                '0 0 10px rgba(155, 93, 229, 0.5)'
              ]
            }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="text-neon-purple font-bold text-xl neon-text flex items-center justify-center space-x-2"
          >
            <Zap size={24} />
            <span>Speak up! Let it out!</span>
            <Zap size={24} />
          </motion.p>
          <p className="text-neon-white/70 text-sm mt-2">
            Talk, shout, or scream - whatever feels right
          </p>
        </motion.div>
      )}
    </div>
  );
}