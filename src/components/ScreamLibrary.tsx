import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Trash2, Edit3, Download, Clock, TrendingUp, X, Home, Zap } from 'lucide-react';
import { useScreams } from '../hooks/useScreams';
import { useAuth } from '../hooks/useAuth';
import { gsap } from 'gsap';

interface ScreamLibraryProps {
  onClose: () => void;
}

export default function ScreamLibrary({ onClose }: ScreamLibraryProps) {
  const { user } = useAuth();
  const { screams, loading, deleteScream, updateScreamName } = useScreams(user?.uid || null);
  const [playingScream, setPlayingScream] = useState<string | null>(null);
  const [editingScream, setEditingScream] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});
  const libraryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP entrance animation
    if (libraryRef.current) {
      gsap.fromTo(libraryRef.current,
        { 
          scale: 0.9, 
          opacity: 0,
          rotationY: -15
        },
        { 
          scale: 1, 
          opacity: 1,
          rotationY: 0,
          duration: 0.8, 
          ease: "back.out(1.7)"
        }
      );
    }
  }, []);

  const handlePlay = (scream: any) => {
    if (playingScream === scream.id) {
      const audio = audioElements[scream.id];
      if (audio) {
        audio.pause();
      }
      setPlayingScream(null);
    } else {
      if (playingScream && audioElements[playingScream]) {
        audioElements[playingScream].pause();
      }

      let audio = audioElements[scream.id];
      if (!audio) {
        audio = new Audio(scream.audioUrl);
        audio.addEventListener('ended', () => setPlayingScream(null));
        setAudioElements(prev => ({ ...prev, [scream.id]: audio }));
      }

      audio.play();
      setPlayingScream(scream.id);
    }
  };

  const handleDelete = async (scream: any) => {
    if (confirm(`PERMANENTLY DELETE "${scream.name}"?`)) {
      try {
        await deleteScream(scream.id, scream.audioUrl);
        
        // Screen shake effect
        gsap.to(document.body, {
          x: 5,
          duration: 0.1,
          yoyo: true,
          repeat: 3,
          ease: "power2.inOut"
        });
      } catch (error) {
        alert('DELETION FAILED. TRY AGAIN.');
      }
    }
  };

  const handleEditName = (scream: any) => {
    setEditingScream(scream.id);
    setEditName(scream.name);
  };

  const handleSaveName = async () => {
    if (!editingScream || !editName.trim()) return;

    try {
      await updateScreamName(editingScream, editName.trim());
      setEditingScream(null);
      setEditName('');
    } catch (error) {
      alert('UPDATE FAILED. TRY AGAIN.');
    }
  };

  const handleDownload = (scream: any) => {
    const link = document.createElement('a');
    link.href = scream.audioUrl;
    link.download = `${scream.name}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 scanlines"
    >
      <motion.div
        ref={libraryRef}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-dark-card rounded-2xl shadow-neon-strong max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-neon-purple/30"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neon-purple/30">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all duration-300 border border-gray-600 hover:border-neon-cyan scream-button"
            >
              <Home size={16} />
              <span className="text-sm font-bold">HOME</span>
            </motion.button>
            
            <div>
              <motion.h2 
                className="text-3xl font-black text-white glow-text"
                animate={{
                  textShadow: [
                    "0 0 10px #ff3366",
                    "0 0 20px #9b5de5",
                    "0 0 15px #00ffff",
                    "0 0 10px #ff3366"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                MY SCREAMS
              </motion.h2>
              <p className="text-gray-400 text-sm mt-1 font-medium">
                YOUR DIGITAL SCREAM VAULT
              </p>
            </div>
          </div>
          
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 hover:bg-gray-800 rounded-full transition-colors border border-gray-600 hover:border-neon-pink"
          >
            <X size={20} className="text-white" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-neon-pink border-t-transparent rounded-full"
              />
            </div>
          ) : screams.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <motion.div 
                className="w-20 h-20 bg-gradient-to-r from-neon-pink to-neon-purple rounded-full flex items-center justify-center mx-auto mb-6 shadow-neon"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap size={32} className="text-white" />
              </motion.div>
              <h3 className="text-2xl font-black text-white mb-4 glow-text">NO SCREAMS YET</h3>
              <p className="text-gray-400 text-lg">
                Record your first scream to start building your collection!
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {screams.map((scream, index) => (
                <motion.div
                  key={scream.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ 
                    scale: 1.02,
                    borderColor: "rgba(255, 51, 102, 0.6)"
                  }}
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-600 hover:border-neon-pink/50 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {editingScream === scream.id ? (
                        <div className="flex items-center space-x-3">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 bg-dark border border-neon-purple/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-neon-pink glow-text"
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                            autoFocus
                          />
                          <motion.button
                            onClick={handleSaveName}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-neon-purple text-white rounded-lg text-sm font-bold hover:bg-neon-purple/80 transition-colors shadow-neon"
                          >
                            SAVE
                          </motion.button>
                          <motion.button
                            onClick={() => setEditingScream(null)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-bold hover:bg-gray-600 transition-colors"
                          >
                            CANCEL
                          </motion.button>
                        </div>
                      ) : (
                        <div>
                          <motion.h3 
                            className="font-black text-white text-xl glow-text mb-2"
                            whileHover={{ scale: 1.02 }}
                          >
                            {scream.name}
                          </motion.h3>
                          <div className="flex items-center space-x-6 text-sm text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Clock size={14} />
                              <span className="font-mono">{formatDuration(scream.duration)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TrendingUp size={14} />
                              <span className="font-mono text-neon-cyan">MAX: {Math.round(scream.maxPitch)}</span>
                            </div>
                            <span className="font-mono">{formatDate(scream.createdAt)}</span>
                            <span className="font-mono">{formatFileSize(scream.fileSize)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-6">
                      <motion.button
                        onClick={() => handlePlay(scream)}
                        whileHover={{ scale: 1.1, filter: "brightness(1.2)" }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 bg-gradient-to-r from-neon-purple to-neon-pink text-white rounded-lg transition-all duration-300 shadow-neon scream-button"
                      >
                        {playingScream === scream.id ? (
                          <Pause size={18} />
                        ) : (
                          <Play size={18} />
                        )}
                      </motion.button>

                      <motion.button
                        onClick={() => handleEditName(scream)}
                        whileHover={{ scale: 1.1, filter: "brightness(1.2)" }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-300 border border-gray-600 hover:border-neon-cyan scream-button"
                      >
                        <Edit3 size={18} />
                      </motion.button>

                      <motion.button
                        onClick={() => handleDownload(scream)}
                        whileHover={{ scale: 1.1, filter: "brightness(1.2)" }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan rounded-lg transition-all duration-300 border border-neon-cyan/50 scream-button"
                      >
                        <Download size={18} />
                      </motion.button>

                      <motion.button
                        onClick={() => handleDelete(scream)}
                        whileHover={{ 
                          scale: 1.1, 
                          filter: "brightness(1.2)",
                          rotate: [0, -5, 5, 0]
                        }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all duration-300 border border-red-500/50 scream-button"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}