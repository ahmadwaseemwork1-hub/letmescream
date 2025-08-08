import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, CloudRain, Waves, Flame, Wind, Music, Home, Volume } from 'lucide-react';
import { gsap } from 'gsap';
import AudioVisualizer from './AudioVisualizer';

interface Sound {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  fallbackType: 'rain' | 'ocean' | 'fire' | 'wind' | 'piano';
}

const sounds: Sound[] = [
  {
    id: 'rainfall',
    name: 'RAINFALL',
    icon: <CloudRain size={24} />,
    color: 'from-neon-cyan to-neon-purple',
    fallbackType: 'rain'
  },
  {
    id: 'ocean',
    name: 'OCEAN',
    icon: <Waves size={24} />,
    color: 'from-neon-cyan to-neon-pink',
    fallbackType: 'ocean'
  },
  {
    id: 'campfire',
    name: 'FIRE',
    icon: <Flame size={24} />,
    color: 'from-neon-pink to-red-500',
    fallbackType: 'fire'
  },
  {
    id: 'forest',
    name: 'WIND',
    icon: <Wind size={24} />,
    color: 'from-neon-purple to-neon-cyan',
    fallbackType: 'wind'
  },
  {
    id: 'piano',
    name: 'PIANO',
    icon: <Music size={24} />,
    color: 'from-purple-500 to-neon-purple',
    fallbackType: 'piano'
  }
];

interface CalmingSoundsProps {
  onHome: () => void;
  onScreamAgain: () => void;
}

export default function CalmingSounds({ onHome, onScreamAgain }: CalmingSoundsProps) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [audioData, setAudioData] = useState<number[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP entrance animation
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { 
          scale: 0.9, 
          opacity: 0,
          filter: "blur(10px)"
        },
        { 
          scale: 1, 
          opacity: 1,
          filter: "blur(0px)",
          duration: 1, 
          ease: "power2.out"
        }
      );
    }

    return () => {
      stopAllSounds();
    };
  }, []);

  const createWhiteNoise = (audioContext: AudioContext): AudioBuffer => {
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  };

  const createFallbackSound = async (type: string) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const gainNode = audioContext.createGain();
      gainNodeRef.current = gainNode;
      gainNode.gain.value = isMuted ? 0 : volume * 0.4;
      gainNode.connect(analyser);
      analyser.connect(audioContext.destination);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVisualization = () => {
        if (analyserRef.current && currentlyPlaying) {
          analyserRef.current.getByteFrequencyData(dataArray);
          setAudioData([...dataArray]);
          animationRef.current = requestAnimationFrame(updateVisualization);
        }
      };

      switch (type) {
        case 'rain':
        case 'fire':
        case 'wind': {
          const whiteNoise = createWhiteNoise(audioContext);
          const noiseSource = audioContext.createBufferSource();
          noiseSource.buffer = whiteNoise;
          noiseSource.loop = true;

          const filter = audioContext.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = type === 'rain' ? 1200 : type === 'fire' ? 900 : 700;
          filter.Q.value = 1;

          noiseSource.connect(filter);
          filter.connect(gainNode);
          noiseSource.start();
          noiseNodeRef.current = noiseSource;
          break;
        }
        case 'ocean': {
          const whiteNoise = createWhiteNoise(audioContext);
          const noiseSource = audioContext.createBufferSource();
          noiseSource.buffer = whiteNoise;
          noiseSource.loop = true;

          const filter = audioContext.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 500;

          const lfo = audioContext.createOscillator();
          lfo.frequency.value = 0.1;
          const lfoGain = audioContext.createGain();
          lfoGain.gain.value = 300;
          
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          
          noiseSource.connect(filter);
          filter.connect(gainNode);
          
          lfo.start();
          noiseSource.start();
          noiseNodeRef.current = noiseSource;
          oscillatorRef.current = lfo;
          break;
        }
        case 'piano': {
          const oscillator = audioContext.createOscillator();
          oscillator.type = 'sine';
          oscillator.frequency.value = 220;
          
          const lfo = audioContext.createOscillator();
          lfo.frequency.value = 0.5;
          const lfoGain = audioContext.createGain();
          lfoGain.gain.value = 15;
          
          lfo.connect(lfoGain);
          lfoGain.connect(oscillator.frequency);
          
          oscillator.connect(gainNode);
          lfo.start();
          oscillator.start();
          oscillatorRef.current = oscillator;
          break;
        }
      }

      updateVisualization();
      return true;
    } catch (error) {
      console.error('Failed to create fallback sound:', error);
      return false;
    }
  };

  const handlePlaySound = async (sound: Sound) => {
    try {
      stopAllSounds();

      if (currentlyPlaying === sound.id) {
        setCurrentlyPlaying(null);
        return;
      }

      const success = await createFallbackSound(sound.fallbackType);
      if (success) {
        setCurrentlyPlaying(sound.id);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    const actualVolume = isMuted ? 0 : newVolume;
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = actualVolume * 0.4;
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    const actualVolume = newMuted ? 0 : volume;
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = actualVolume * 0.4;
    }
  };

  const stopAllSounds = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (e) {}
      oscillatorRef.current = null;
    }
    
    if (noiseNodeRef.current) {
      try {
        noiseNodeRef.current.stop();
      } catch (e) {}
      noiseNodeRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    gainNodeRef.current = null;
    analyserRef.current = null;
    setCurrentlyPlaying(null);
    setAudioData([]);
  };

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col scanlines grain-texture">
      {/* Audio Visualizer */}
      <div className="absolute top-0 left-0 right-0 h-40 z-10">
        <AudioVisualizer 
          audioData={audioData} 
          isActive={currentlyPlaying !== null}
          isRecording={false}
          currentPitch={0}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-6 z-20 mt-40"
      >
        <motion.button
          onClick={onHome}
          whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all duration-300 border border-gray-600 hover:border-neon-cyan scream-button"
        >
          <Home size={18} />
          <span className="font-bold">HOME</span>
        </motion.button>
        
        <motion.button
          onClick={onScreamAgain}
          whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-neon-purple to-neon-pink text-white rounded-lg transition-all duration-300 shadow-neon scream-button"
        >
          <Volume size={18} />
          <span className="font-bold">SCREAM AGAIN</span>
        </motion.button>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 space-y-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-4"
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-black text-white glow-text kinetic-text"
            animate={{
              textShadow: [
                "0 0 20px #00ffff, 0 0 40px #00ffff",
                "0 0 25px #9b5de5, 0 0 50px #9b5de5",
                "0 0 20px #00ffff, 0 0 40px #00ffff"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            FIND YOUR
            <br />
            <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
              INNER PEACE
            </span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Let these sounds wash away your stress
          </motion.p>
        </motion.div>

        {/* Volume Control */}
        <AnimatePresence>
          {currentlyPlaying && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-dark-card rounded-xl p-4 border border-neon-purple/30 w-full max-w-md shadow-neon"
            >
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={toggleMute}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </motion.button>
                
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-none slider"
                  />
                </div>
                
                <span className="text-white font-mono min-w-[3rem] text-center font-bold">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
                
                <motion.button
                  onClick={stopAllSounds}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-700 font-bold"
                >
                  STOP
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sound Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-4xl"
        >
          <div className="grid grid-cols-5 gap-4">
            {sounds.map((sound, index) => (
              <motion.button
                key={sound.id}
                onClick={() => handlePlaySound(sound)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.1, 
                  y: -5,
                  filter: "brightness(1.3)"
                }}
                whileTap={{ scale: 0.9 }}
                className={`p-6 rounded-xl border transition-all duration-300 scream-button ${
                  currentlyPlaying === sound.id
                    ? 'border-neon-pink bg-neon-pink/20 shadow-neon-strong'
                    : 'border-gray-600 bg-gray-800/50 hover:border-neon-purple/50 hover:bg-gray-700/50'
                } backdrop-blur-sm`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <motion.div 
                    className={`p-4 rounded-lg bg-gradient-to-r ${sound.color} shadow-neon`}
                    animate={currentlyPlaying === sound.id ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {sound.icon}
                  </motion.div>
                  
                  <h3 className="text-white font-black text-sm text-center leading-tight glow-text">
                    {sound.name}
                  </h3>
                  
                  <div className="flex items-center justify-center h-6">
                    {currentlyPlaying === sound.id ? (
                      <motion.div 
                        className="flex space-x-1"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <div className="w-1 h-6 bg-neon-pink rounded animate-pulse"></div>
                        <div className="w-1 h-4 bg-neon-purple rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-8 bg-neon-cyan rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1 h-5 bg-neon-pink rounded animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                      </motion.div>
                    ) : (
                      <Play size={16} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center space-y-2 pb-6"
        >
          <motion.p 
            className="text-gray-400 text-lg font-medium"
            animate={{
              opacity: [0.6, 1, 0.6],
              y: [0, -2, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            BREATHE DEEPLY. LET THE SOUNDS GUIDE YOU TO TRANQUILITY.
          </motion.p>
          <motion.p 
            className="text-sm text-neon-cyan glow-text"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✨ AI-GENERATED AMBIENT SOUNDS FOR MAXIMUM RELAXATION
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}