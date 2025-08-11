import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Activity, Timer, TrendingUp } from 'lucide-react';
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
    // Hide instructions after 3 seconds
    const timer = setTimeout(() => {
      setShowInstructions(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Track max pitch during session
    if (currentPitch > maxPitchReached) {
      setMaxPitchReached(currentPitch);
    }
  }, [currentPitch, maxPitchReached]);

  useEffect(() => {
    // Session timer
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
      // Stop recording
      stopRecording();
      setIsRecording(false);
      
      // Immediately transition to results screen with recorded audio
      onScreamEnd(maxPitchReached, sessionTime, recordedBlob);
    } else {
      // Start recording
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

  useEffect(() => {
    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getIntensityColor = (pitch: number) => {
    if (pitch < 15) return 'text-calm-blue-tint';
    if (pitch < 30) return 'text-primary-purple';
    if (pitch < 40) return 'text-accent-pink';
    if (pitch < 50) return 'text-accent-pink';
    return 'text-primary-purple';
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
          <p className="text-light-gray text-lg">
            Click to start. Speak, shout, or scream to see the magic!
          </p>
        </motion.div>
      )}

      {/* Enhanced Session Stats */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="bg-pale-lilac/90 backdrop-blur-md rounded-2xl px-6 py-4 border border-soft-lavender shadow-2xl">
            <div className="flex items-center space-x-6">
              {/* Timer */}
              <div className="flex items-center space-x-2">
                <Timer size={18} className="text-calm-blue-tint" />
                <span className="text-light-gray font-mono text-lg">{formatTime(sessionTime)}</span>
              </div>
              
              {/* Current Intensity */}
              <div className="flex items-center space-x-2">
                <Activity size={18} className="text-primary-purple" />
                <span className={`font-mono text-lg ${getIntensityColor(currentPitch)}`}>
                  {Math.round(currentPitch)}
                </span>
              </div>
              
              {/* Max Reached */}
              <div className="flex items-center space-x-2">
                <TrendingUp size={18} className="text-accent-pink" />
                <span className="text-accent-pink font-mono text-lg">
                  {Math.round(maxPitchReached)}
                </span>
              </div>
            </div>
            
            {/* Intensity Bar */}
            <div className="mt-3 w-full">
              <div className="h-2 bg-soft-lavender rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-calm-blue-tint via-primary-purple to-accent-pink"
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
          {/* Outer pulse rings */}
          {isRecording && (
            <>
              <div className="absolute inset-0 w-32 h-32 rounded-full border-2 border-accent-pink/30 animate-ping"></div>
              <div className="absolute inset-0 w-32 h-32 rounded-full border-2 border-accent-pink/20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </>
          )}
          
          <button
            onClick={handleStartRecording}
            className={`scream-button group relative w-32 h-32 rounded-full font-bold text-off-white shadow-2xl transition-all duration-300 ${
              isRecording 
                ? 'bg-gradient-to-r from-accent-pink to-primary-purple hover:from-accent-pink/80 hover:to-primary-purple/80 scale-110' 
                : 'bg-gradient-to-r from-primary-purple to-accent-pink hover:from-primary-purple/80 hover:to-accent-pink/80'
            }`}
          >
            {/* Inner glow effect */}
            <div className={`absolute inset-2 rounded-full ${
              isRecording ? 'bg-accent-pink/20' : 'bg-primary-purple/20'
            } animate-pulse`}></div>
            
            <div className="relative z-10 flex flex-col items-center justify-center">
              {isRecording ? (
                <>
                  <Square size={32} className="mb-2 animate-pulse" />
                  <span className="text-sm">Stop</span>
                </>
              ) : (
                <>
                  <Mic size={32} className="mb-2 group-hover:animate-bounce" />
                  <span className="text-sm">Start</span>
                </>
              )}
            </div>
          </button>
        </div>
      </motion.div>

      {/* Enhanced Live feedback - Positioned higher to avoid button overlap */}
      {isRecording && currentPitch > 5 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-60 text-center"
        >
          <motion.p
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-accent-pink font-medium text-lg"
          >
            Perfect! Keep expressing yourself!
          </motion.p>
          <p className="text-light-gray/70 text-sm mt-2">
            Let all that energy flow out
          </p>
        </motion.div>
      )}

      {/* Encouragement for quiet periods - Positioned higher to avoid button overlap */}
      {isRecording && currentPitch <= 5 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-60 text-center"
        >
          <motion.p
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-primary-purple font-bold text-xl"
          >
            Speak up! Let it out!
          </motion.p>
          <p className="text-light-gray/70 text-sm mt-2">
            Talk, shout, or scream - whatever feels right
          </p>
        </motion.div>
      )}
    </div>
  );
}