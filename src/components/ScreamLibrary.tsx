import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Trash2, Edit3, Download, Clock, TrendingUp, X, Home, Zap } from 'lucide-react';
import { useScreams } from '../hooks/useScreams';
import { useAuth } from '../hooks/useAuth';
import { Scream } from '../types/user';

interface ScreamLibraryProps {
  onClose: () => void;
}

export default function ScreamLibrary({ onClose }: ScreamLibraryProps) {
  const { user } = useAuth();
  const { screams, loading, deleteScream, updateScreamName } = useScreams(user?.id || null);
  const [playingScream, setPlayingScream] = useState<string | null>(null);
  const [editingScream, setEditingScream] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});

  const handlePlay = (scream: Scream) => {
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

  const handleDelete = async (scream: Scream) => {
    if (confirm(`Are you sure you want to delete "${scream.name}"?`)) {
      try {
        await deleteScream(scream.id, scream.audioUrl);
      } catch (error) {
        alert('Failed to delete scream. Please try again.');
      }
    }
  };

  const handleEditName = (scream: Scream) => {
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
      alert('Failed to update scream name. Please try again.');
    }
  };

  const handleDownload = (scream: Scream) => {
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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-dark-surface rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-neon-purple/30 neon-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neon-purple/30">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-3 py-2 bg-dark-bg hover:bg-dark-bg/80 text-neon-white rounded-lg transition-colors border border-neon-purple/30"
            >
              <Home size={16} />
              <span className="text-sm">Home</span>
            </button>
            
            <div>
              <h2 className="text-2xl font-bold text-neon-white neon-text">My Screams</h2>
              <p className="text-neon-white/70 text-sm mt-1">
                Your digital scream collection
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-bg rounded-full transition-colors"
          >
            <X size={20} className="text-neon-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full"
              />
            </div>
          ) : screams.length === 0 ? (
            <div className="text-center py-12">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 bg-gradient-to-r from-neon-purple to-neon-pink rounded-full flex items-center justify-center mx-auto mb-4 neon-glow"
              >
                <Zap size={24} className="text-dark-bg" />
              </motion.div>
              <h3 className="text-lg font-semibold text-neon-white mb-2 neon-text">No screams yet</h3>
              <p className="text-neon-white/70">
                Record your first scream to start building your collection!
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {screams.map((scream, index) => (
                <motion.div
                  key={scream.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-dark-bg/50 rounded-xl p-4 border border-neon-purple/30 hover:border-neon-pink/50 transition-all duration-300 neon-border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {editingScream === scream.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 bg-dark-surface border border-neon-purple/30 rounded-lg px-3 py-1 text-neon-white focus:outline-none focus:ring-2 focus:ring-neon-purple"
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                            autoFocus
                          />
                          <button
                            onClick={handleSaveName}
                            className="px-3 py-1 bg-neon-purple text-dark-bg rounded-lg text-sm hover:bg-neon-purple/80 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingScream(null)}
                            className="px-3 py-1 bg-dark-surface text-neon-white rounded-lg text-sm hover:bg-dark-surface/80 transition-colors border border-neon-purple/30"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-semibold text-neon-white text-lg neon-text">
                            {scream.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-neon-white/70 mt-1">
                            <div className="flex items-center space-x-1">
                              <Clock size={14} />
                              <span>{formatDuration(scream.duration)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TrendingUp size={14} />
                              <span>Max: {Math.round(scream.maxPitch)}</span>
                            </div>
                            <span>{formatDate(scream.createdAt)}</span>
                            <span>{formatFileSize(scream.fileSize)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <motion.button
                        onClick={() => handlePlay(scream)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-neon-purple hover:bg-neon-purple/80 text-dark-bg rounded-lg transition-colors neon-glow"
                      >
                        {playingScream === scream.id ? (
                          <Pause size={16} />
                        ) : (
                          <Play size={16} />
                        )}
                      </motion.button>

                      <motion.button
                        onClick={() => handleEditName(scream)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-dark-surface hover:bg-dark-surface/80 text-neon-white rounded-lg transition-colors border border-neon-purple/30"
                      >
                        <Edit3 size={16} />
                      </motion.button>

                      <motion.button
                        onClick={() => handleDownload(scream)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-neon-cyan hover:bg-neon-cyan/80 text-dark-bg rounded-lg transition-colors neon-glow"
                      >
                        <Download size={16} />
                      </motion.button>

                      <motion.button
                        onClick={() => handleDelete(scream)}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-neon-pink hover:bg-neon-pink/80 text-dark-bg rounded-lg transition-colors neon-glow"
                      >
                        <Trash2 size={16} />
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