import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, X, Home, Zap } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { useAuth } from '../hooks/useAuth';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface VoiceAuthProps {
  onClose: () => void;
}

function AnimatedSphere({ intensity }: { intensity: number }) {
  const meshRef = useRef<any>();

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 100, 200]} scale={1 + intensity * 0.5}>
      <MeshDistortMaterial
        color={intensity > 0.3 ? "#FF6F91" : "#9B5DE5"}
        attach="material"
        distort={0.3 + intensity * 0.7}
        speed={2 + intensity * 3}
        roughness={0}
        metalness={0.8}
      />
    </Sphere>
  );
}

export default function VoiceAuth({ onClose }: VoiceAuthProps) {
  const [isListening, setIsListening] = useState(false);
  const [screamThreshold, setScreamThreshold] = useState(40);
  const [authProgress, setAuthProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [canUseMic, setCanUseMic] = useState(true);
  
  const { signInWithGoogle, user } = useAuth();
  const { startRecording, stopRecording, currentPitch, isActive } = useAudioRecorder();
  
  const progressRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (user) {
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [user, onClose]);

  useEffect(() => {
    if (isListening && currentPitch > screamThreshold) {
      progressRef.current += 2;
      setAuthProgress(Math.min(progressRef.current, 100));
      
      if (progressRef.current >= 100) {
        handleAuthSuccess();
      }
    } else if (isListening && currentPitch < screamThreshold * 0.5) {
      // Slowly decrease progress if not screaming
      progressRef.current = Math.max(0, progressRef.current - 0.5);
      setAuthProgress(progressRef.current);
    }
  }, [currentPitch, screamThreshold, isListening]);

  const handleAuthSuccess = async () => {
    setIsListening(false);
    stopRecording();
    
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Auth failed:', error);
      alert('Authentication failed. Please try again.');
      resetAuth();
    }
  };

  const resetAuth = () => {
    setAuthProgress(0);
    progressRef.current = 0;
    setIsListening(false);
    stopRecording();
  };

  const handleStartListening = async () => {
    try {
      await startRecording();
      setIsListening(true);
      setAuthProgress(0);
      progressRef.current = 0;
      
      // Auto-stop after 30 seconds
      timeoutRef.current = setTimeout(() => {
        resetAuth();
      }, 30000);
    } catch (error) {
      console.error('Microphone access denied:', error);
      setCanUseMic(false);
    }
  };

  const handleFakeScream = async () => {
    // Play a scream sound effect
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    audio.volume = 0.3;
    audio.play().catch(() => {});
    
    // Simulate scream authentication
    setAuthProgress(0);
    progressRef.current = 0;
    
    const interval = setInterval(() => {
      progressRef.current += 5;
      setAuthProgress(progressRef.current);
      
      if (progressRef.current >= 100) {
        clearInterval(interval);
        handleAuthSuccess();
      }
    }, 100);
  };

  const intensityNormalized = Math.min(currentPitch / 60, 1);

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-24 h-24 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full flex items-center justify-center mx-auto neon-glow"
          >
            <Zap size={32} className="text-dark-bg" />
          </motion.div>
          <h2 className="text-2xl font-bold text-neon-white glow-text">
            Authentication Successful!
          </h2>
          <p className="text-neon-white/70">Welcome to the void...</p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-dark-surface rounded-2xl shadow-2xl max-w-2xl w-full p-8 border border-neon-purple/30 neon-border relative overflow-hidden"
      >
        {/* 3D Background */}
        <div className="absolute inset-0 opacity-30">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <AnimatedSphere intensity={intensityNormalized} />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
          </Canvas>
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between mb-8">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 px-3 py-2 bg-dark-bg hover:bg-dark-bg/80 text-neon-white rounded-lg transition-colors border border-neon-purple/30"
          >
            <Home size={16} />
            <span className="text-sm">Home</span>
          </button>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-bg rounded-full transition-colors"
          >
            <X size={20} className="text-neon-white" />
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center space-y-8">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-neon-white mb-4 neon-text"
            >
              Scream to Sign In
            </motion.h2>
            <p className="text-neon-white/70 text-lg">
              Let your voice unlock the experience
            </p>
          </div>

          {/* Voice Meter */}
          <div className="space-y-4">
            <div className="relative h-8 bg-dark-bg rounded-full overflow-hidden border border-neon-purple/30">
              <motion.div
                className="h-full voice-meter"
                style={{ width: `${authProgress}%` }}
                transition={{ duration: 0.1 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-neon-white font-bold text-sm">
                  {Math.round(authProgress)}%
                </span>
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-neon-white/60">
              <span>Silent</span>
              <span>Scream Level: {Math.round(currentPitch)}</span>
              <span>Authenticated</span>
            </div>
          </div>

          {/* Scream Button */}
          {canUseMic ? (
            <motion.button
              onClick={isListening ? resetAuth : handleStartListening}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative w-32 h-32 rounded-full font-bold text-dark-bg shadow-2xl transition-all duration-300 scream-button ${
                isListening 
                  ? 'bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-pink/80 hover:to-neon-purple/80 scale-110' 
                  : 'bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-purple/80 hover:to-neon-pink/80'
              } neon-glow`}
            >
              {isListening && (
                <>
                  <div className="absolute inset-0 w-32 h-32 rounded-full border-2 border-neon-pink/30 animate-ping"></div>
                  <div className="absolute inset-0 w-32 h-32 rounded-full border-2 border-neon-pink/20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                </>
              )}
              
              <div className="relative z-10 flex flex-col items-center justify-center">
                {isListening ? (
                  <>
                    <Volume2 size={32} className="mb-2 animate-pulse" />
                    <span className="text-sm">Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic size={32} className="mb-2" />
                    <span className="text-sm">Scream</span>
                  </>
                )}
              </div>
            </motion.button>
          ) : (
            <div className="space-y-4">
              <p className="text-neon-white/70 text-sm">
                Microphone access denied. Use the fake scream instead!
              </p>
              <motion.button
                onClick={handleFakeScream}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-32 h-32 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-cyan/80 hover:to-neon-purple/80 text-dark-bg font-bold shadow-2xl transition-all duration-300 scream-button neon-glow"
              >
                <div className="flex flex-col items-center justify-center">
                  <Volume2 size={32} className="mb-2" />
                  <span className="text-sm">Fake Scream</span>
                </div>
              </motion.button>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-3 text-sm text-neon-white/70">
            <p>
              {isListening 
                ? `Scream louder! Need ${screamThreshold}+ intensity to authenticate.`
                : "Click the button and scream into your microphone to sign in."
              }
            </p>
            <p className="text-xs">
              Your voice data is processed locally and never stored.
            </p>
          </div>

          {/* Threshold Adjuster */}
          <div className="space-y-2">
            <label className="text-sm text-neon-white/70">
              Scream Sensitivity: {screamThreshold}
            </label>
            <input
              type="range"
              min="20"
              max="60"
              value={screamThreshold}
              onChange={(e) => setScreamThreshold(Number(e.target.value))}
              className="w-full slider"
            />
            <div className="flex justify-between text-xs text-neon-white/50">
              <span>Gentle</span>
              <span>Moderate</span>
              <span>Intense</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}