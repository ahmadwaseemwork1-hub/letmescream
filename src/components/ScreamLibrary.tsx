import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Trash2, Edit3, Download, Clock, TrendingUp, X, Home } from 'lucide-react';
import { useScreams } from '../hooks/useScreams';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { Scream } from '../types/user';
import SubscriptionStatus from './SubscriptionStatus';

interface ScreamLibraryProps {
  onClose: () => void;
}

export default function ScreamLibrary({ onClose }: ScreamLibraryProps) {
  const { user } = useAuth();
  const { hasActiveSubscription } = useSubscription();
  const { screams, loading, deleteScream, updateScreamName } = useScreams(user?.id || null);
  const [playingScream, setPlayingScream] = useState<string | null>(null);
  const [editingScream, setEditingScream] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});

  const handlePlay = (scream: Scream) => {
    if (playingScream === scream.id) {
      // Pause current scream
      const audio = audioElements[scream.id];
      if (audio) {
        audio.pause();
      }
      setPlayingScream(null);
    } else {
      // Stop any currently playing scream
      if (playingScream && audioElements[playingScream]) {
        audioElements[playingScream].pause();
      }

      // Play new scream
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-off-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-soft-lavender">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-3 py-2 bg-soft-lavender hover:bg-soft-lavender/80 text-light-gray rounded-lg transition-colors"
            >
              <Home size={16} />
              <span className="text-sm">Home</span>
            </button>
            
            <div>
              <h2 className="text-2xl font-bold text-light-gray">My Screams</h2>
              <p className="text-light-gray/70 text-sm mt-1">
                Your saved scream collection
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-soft-lavender rounded-full transition-colors"
          >
            <X size={20} className="text-light-gray" />
          </button>
        </div>

        {/* Subscription Status */}
        <div className="p-6 border-b border-soft-lavender">
          <SubscriptionStatus />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!hasActiveSubscription ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-accent-pink/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play size={24} className="text-accent-pink" />
              </div>
              <h3 className="text-lg font-semibold text-light-gray mb-2">Subscription Required</h3>
              <p className="text-light-gray/70 mb-4">
                Subscribe to save and access your screams
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-primary-purple hover:bg-primary-purple/80 text-off-white rounded-lg font-medium transition-colors"
              >
                Subscribe Now
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary-purple border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : screams.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-soft-lavender rounded-full flex items-center justify-center mx-auto mb-4">
                <Play size={24} className="text-light-gray/60" />
              </div>
              <h3 className="text-lg font-semibold text-light-gray mb-2">No screams yet</h3>
              <p className="text-light-gray/70">
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
                  className="bg-pale-lilac/50 rounded-xl p-4 border border-soft-lavender hover:border-primary-purple/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {editingScream === scream.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 bg-off-white border border-soft-lavender rounded-lg px-3 py-1 text-light-gray focus:outline-none focus:ring-2 focus:ring-primary-purple"
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                            autoFocus
                          />
                          <button
                            onClick={handleSaveName}
                            className="px-3 py-1 bg-primary-purple text-off-white rounded-lg text-sm hover:bg-primary-purple/80 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingScream(null)}
                            className="px-3 py-1 bg-soft-lavender text-light-gray rounded-lg text-sm hover:bg-soft-lavender/80 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-semibold text-light-gray text-lg">
                            {scream.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-light-gray/70 mt-1">
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
                      <button
                        onClick={() => handlePlay(scream)}
                        className="p-2 bg-primary-purple hover:bg-primary-purple/80 text-off-white rounded-lg transition-colors"
                      >
                        {playingScream === scream.id ? (
                          <Pause size={16} />
                        ) : (
                          <Play size={16} />
                        )}
                      </button>

                      <button
                        onClick={() => handleEditName(scream)}
                        className="p-2 bg-soft-lavender hover:bg-soft-lavender/80 text-light-gray rounded-lg transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        onClick={() => handleDownload(scream)}
                        className="p-2 bg-calm-blue-tint hover:bg-calm-blue-tint/80 text-light-gray rounded-lg transition-colors"
                      >
                        <Download size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(scream)}
                        className="p-2 bg-accent-pink hover:bg-accent-pink/80 text-off-white rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
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