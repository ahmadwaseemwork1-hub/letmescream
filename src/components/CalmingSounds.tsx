import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, CloudRain, Waves, Flame, Wind, Music, Home, Volume } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

interface Sound {
  id: string;
  name: string;
  icon: React.ReactNode;
  url: string;
  color: string;
  fallbackType: 'rain' | 'ocean' | 'fire' | 'wind' | 'piano';
}

const sounds: Sound[] = [
  {
    id: 'rainfall',
    name: 'Rainfall',
    icon: <CloudRain size={20} />,
    url: 'https://www.soundjay.com/misc/sounds/rain-01.mp3',
    color: 'from-calm-blue-tint to-primary-purple',
    fallbackType: 'rain'
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    icon: <Waves size={20} />,
    url: 'https://www.soundjay.com/misc/sounds/ocean-wave-1.mp3',
    color: 'from-calm-blue-tint to-accent-pink',
    fallbackType: 'ocean'
  },
  {
    id: 'campfire',
    name: 'Campfire Crackle',
    icon: <Flame size={20} />,
    url: 'https://www.soundjay.com/misc/sounds/fire-crackling-1.mp3',
    color: 'from-accent-pink to-primary-purple',
    fallbackType: 'fire'
  },
  {
    id: 'forest',
    name: 'Forest Breeze',
    icon: <Wind size={20} />,
    url: 'https://www.soundjay.com/misc/sounds/wind-1.mp3',
    color: 'from-primary-purple to-calm-blue-tint',
    fallbackType: 'wind'
  },
  {
    id: 'piano',
    name: 'Soft Piano',
    icon: <Music size={20} />,
    url: 'https://www.soundjay.com/misc/sounds/piano-1.mp3',
    color: 'from-soft-lavender to-primary-purple',
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();
  const [isLoading, setIsLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    // Cleanup audio when component unmounts
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

  const startAudioVisualization = (audioElement: HTMLAudioElement) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audioElement);
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      analyserRef.current = analyser;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateVisualization = () => {
        if (analyserRef.current && currentlyPlaying) {
          analyserRef.current.getByteFrequencyData(dataArray);
          setAudioData([...dataArray]);
          animationRef.current = requestAnimationFrame(updateVisualization);
        }
      };
      
      updateVisualization();
    } catch (error) {
      console.error('Failed to create audio visualization:', error);
    }
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
      gainNode.gain.value = isMuted ? 0 : volume * 0.3;
      gainNode.connect(analyser);
      analyser.connect(audioContext.destination);

      // Create visualization data for fallback sounds
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
          filter.frequency.value = type === 'rain' ? 1000 : type === 'fire' ? 800 : 600;
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
          filter.frequency.value = 400;

          const lfo = audioContext.createOscillator();
          lfo.frequency.value = 0.1;
          const lfoGain = audioContext.createGain();
          lfoGain.gain.value = 200;
          
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
          lfoGain.gain.value = 10;
          
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
      setUsingFallback(true);
      return true;
    } catch (error) {
      console.error('Failed to create fallback sound:', error);
      return false;
    }
  };

  const handlePlaySound = async (sound: Sound) => {
    setIsLoading(true);
    
    try {
      stopAllSounds();

      if (currentlyPlaying === sound.id) {
        setCurrentlyPlaying(null);
        setIsLoading(false);
        return;
      }

      const audio = new Audio(sound.url);
      audio.loop = true;
      audio.volume = isMuted ? 0 : volume;
      
      const loadTimeout = setTimeout(() => {
        console.log('Audio loading timeout, using fallback');
        audio.src = '';
        createFallbackAudio();
      }, 3000);

      const createFallbackAudio = async () => {
        clearTimeout(loadTimeout);
        const success = await createFallbackSound(sound.fallbackType);
        if (success) {
          setCurrentlyPlaying(sound.id);
        }
        setIsLoading(false);
      };

      audio.addEventListener('canplaythrough', () => {
        clearTimeout(loadTimeout);
        setIsLoading(false);
        setUsingFallback(false);
        audioRef.current = audio;
        setCurrentlyPlaying(sound.id);
        audio.play().then(() => {
          startAudioVisualization(audio);
        }).catch(() => {
          createFallbackAudio();
        });
      });

      audio.addEventListener('error', () => {
        console.log('Audio failed to load, using fallback sound');
        createFallbackAudio();
      });

      audio.load();
      
    } catch (error) {
      console.error('Error playing sound:', error);
      setIsLoading(false);
      const success = await createFallbackSound(sound.fallbackType);
      if (success) {
        setCurrentlyPlaying(sound.id);
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    const actualVolume = isMuted ? 0 : newVolume;
    
    if (audioRef.current) {
      audioRef.current.volume = actualVolume;
    }
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = actualVolume * 0.3;
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    const actualVolume = newMuted ? 0 : volume;
    
    if (audioRef.current) {
      audioRef.current.volume = actualVolume;
    }
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = actualVolume * 0.3;
    }
  };

  const stopAllSounds = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
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
    setUsingFallback(false);
    setAudioData([]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Audio Visualizer - Fixed at the very top */}
      <div className="absolute top-0 left-0 right-0 h-32 z-10">
        <AudioVisualizer 
          audioData={audioData} 
          isActive={currentlyPlaying !== null}
          isRecording={false}
          currentPitch={0}
        />
      </div>

      {/* Header with Navigation - Below visualizer */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 z-20 mt-32"
      >
        <button
          onClick={onHome}
          className="flex items-center space-x-2 px-3 py-2 bg-soft-lavender/80 hover:bg-soft-lavender backdrop-blur-sm text-light-gray rounded-lg transition-all duration-300 hover:scale-105"
        >
          <Home size={16} />
          <span className="text-sm">Home</span>
        </button>
        
        <button
          onClick={onScreamAgain}
          className="flex items-center space-x-2 px-3 py-2 bg-primary-purple/80 hover:bg-primary-purple backdrop-blur-sm text-off-white rounded-lg transition-all duration-300 hover:scale-105"
        >
          <Volume size={16} />
          <span className="text-sm">Scream Again</span>
        </button>
      </motion.div>

      {/* Main Content - Centered and Compact */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 space-y-8">
        {/* Compact Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-light-gray">
            Find Your
            <span className="bg-gradient-to-r from-primary-purple to-accent-pink bg-clip-text text-transparent ml-2">
              Inner Peace
            </span>
          </h1>
          <p className="text-lg text-light-gray/80">
            Let these calming sounds wash away your stress
          </p>
        </motion.div>

        {/* Volume Control - Positioned with proper spacing */}
        <AnimatePresence>
          {currentlyPlaying && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-pale-lilac/50 backdrop-blur-sm rounded-xl p-3 border border-soft-lavender w-full max-w-md"
            >
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleMute}
                  className="text-light-gray/70 hover:text-light-gray transition-colors p-1 rounded-lg hover:bg-soft-lavender/50"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-soft-lavender rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                
                <span className="text-light-gray font-mono min-w-[2.5rem] text-center text-xs">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
                
                <button
                  onClick={stopAllSounds}
                  className="text-xs text-light-gray/70 hover:text-light-gray transition-colors px-2 py-1 rounded-lg hover:bg-soft-lavender/50"
                >
                  Stop
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sound Buttons Grid - Positioned at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-4xl"
        >
          <div className="grid grid-cols-5 gap-2 md:gap-3">
            {sounds.map((sound, index) => (
              <motion.button
                key={sound.id}
                onClick={() => handlePlaySound(sound)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
                className={`p-3 rounded-xl border transition-all duration-300 ${
                  currentlyPlaying === sound.id
                    ? 'border-primary-purple bg-primary-purple/20 shadow-lg shadow-primary-purple/25'
                    : 'border-soft-lavender bg-pale-lilac/50 hover:border-primary-purple/50 hover:bg-pale-lilac/70'
                } backdrop-blur-sm`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${sound.color} shadow-lg`}>
                    {sound.icon}
                  </div>
                  
                  <h3 className="text-light-gray font-medium text-xs text-center leading-tight">{sound.name}</h3>
                  
                  <div className="flex items-center justify-center h-4">
                    {isLoading && currentlyPlaying !== sound.id ? (
                      <div className="w-3 h-3 border-2 border-primary-purple border-t-transparent rounded-full animate-spin"></div>
                    ) : currentlyPlaying === sound.id ? (
                      <div className="flex space-x-0.5">
                        <div className="w-0.5 h-3 bg-primary-purple rounded animate-pulse"></div>
                        <div className="w-0.5 h-2 bg-primary-purple rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-0.5 h-4 bg-primary-purple rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-0.5 h-2 bg-primary-purple rounded animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                    ) : (
                      <Play size={12} className="text-light-gray/60" />
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center space-y-1 pb-4"
        >
          <p className="text-light-gray/70 text-sm">
            Take your time. Breathe deeply. Let the sounds guide you to tranquility.
          </p>
          {usingFallback && (
            <p className="text-xs text-primary-purple">
              ✨ Using AI-generated ambient sounds for the best experience
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}