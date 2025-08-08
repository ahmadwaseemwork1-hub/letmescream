import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import ScreamSession from './components/ScreamSession';
import AIChat from './components/AIChat';
import BackgroundEffects from './components/BackgroundEffects';
import CalmingSounds from './components/CalmingSounds';
import VoiceAuth from './components/VoiceAuth';
import ScreamLibrary from './components/ScreamLibrary';
import SaveScreamModal from './components/SaveScreamModal';
import CursorEffects from './components/CursorEffects';
import { MessageCircle } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useScreams } from './hooks/useScreams';

export type AppState = 'auth' | 'landing' | 'screaming' | 'aftermath' | 'chat' | 'sounds' | 'library';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('auth');
  const [hasScreamed, setHasScreamed] = useState(false);
  const [maxPitch, setMaxPitch] = useState<number>(0);
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  const { user, loading } = useAuth();
  const { saveScream, loading: savingScream } = useScreams(user?.uid || null);

  useEffect(() => {
    if (!loading && user) {
      setCurrentState('landing');
    } else if (!loading && !user) {
      setCurrentState('auth');
    }
  }, [user, loading]);

  const handleScreamStart = () => {
    setCurrentState('screaming');
  };

  const handleScreamEnd = (pitch: number, duration: number, audioBlob?: Blob) => {
    setHasScreamed(true);
    setMaxPitch(pitch);
    setSessionDuration(duration);
    setRecordedBlob(audioBlob || null);
    setCurrentState('aftermath');
  };

  const handleChatStart = () => {
    setCurrentState('chat');
  };

  const handleSoundsStart = () => {
    setCurrentState('sounds');
  };

  const handleReset = () => {
    setCurrentState('landing');
    setHasScreamed(false);
    setMaxPitch(0);
    setSessionDuration(0);
    setRecordedBlob(null);
  };

  const handleLibraryOpen = () => {
    setCurrentState('library');
  };

  const handleSaveScream = () => {
    setShowSaveModal(true);
  };

  const handleSaveScreamConfirm = async (name: string) => {
    if (!recordedBlob || !user) return;

    try {
      await saveScream(recordedBlob, name, sessionDuration, maxPitch);
      setShowSaveModal(false);
      setRecordedBlob(null);
      // Show success with screen shake effect
      document.body.style.animation = 'screenShake 0.5s ease-in-out';
      setTimeout(() => {
        document.body.style.animation = '';
      }, 500);
    } catch (error) {
      console.error('Failed to save scream:', error);
    }
  };

  const getPitchAssumption = (pitch: number) => {
    if (pitch < 15) return "A gentle release - you're finding your inner peace.";
    if (pitch < 30) return "Moderate intensity - you're letting go of daily stress.";
    if (pitch < 40) return "Strong expression - you're releasing deep tension.";
    if (pitch < 50) return "Powerful release - you're breaking through barriers.";
    return "Maximum intensity - you've unleashed your inner warrior!";
  };

  const getPitchCategory = (pitch: number) => {
    if (pitch < 15) return "Whisper";
    if (pitch < 30) return "Normal";
    if (pitch < 40) return "Loud";
    if (pitch < 50) return "Very Loud";
    return "EXTREME";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 border-4 border-neon-pink border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-dark">
      <CursorEffects />
      <BackgroundEffects />
      
      {/* Chat Button - Show on main screens */}
      {currentState !== 'chat' && currentState !== 'auth' && (
        <motion.button
          onClick={handleChatStart}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.4 }}
          whileHover={{ 
            scale: 1.1, 
            x: -5,
            filter: "brightness(1.2)"
          }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 z-30 group scream-button"
        >
          <div className="bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-purple/80 hover:to-neon-pink/80 text-white px-6 py-3 rounded-full shadow-neon transition-all duration-200 flex items-center space-x-2">
            <MessageCircle size={20} className="group-hover:animate-pulse" />
            <span className="font-bold">VENT ANONYMOUSLY</span>
          </div>
        </motion.button>
      )}

      {/* Library Button - Show when user is authenticated */}
      {user && currentState !== 'library' && currentState !== 'auth' && (
        <motion.button
          onClick={handleLibraryOpen}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          whileHover={{ 
            scale: 1.1,
            y: -2,
            filter: "brightness(1.2)"
          }}
          whileTap={{ scale: 0.9 }}
          className="fixed top-6 right-6 z-30 group scream-button"
        >
          <div className="bg-gradient-to-r from-neon-cyan to-neon-purple text-white px-4 py-2 rounded-full shadow-neon transition-all duration-200 flex items-center space-x-2">
            <span className="font-bold text-sm">MY SCREAMS</span>
          </div>
        </motion.button>
      )}
      
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {currentState === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <VoiceAuth onAuthSuccess={() => setCurrentState('landing')} />
            </motion.div>
          )}

          {currentState === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <LandingPage onScreamStart={handleScreamStart} />
            </motion.div>
          )}

          {currentState === 'screaming' && (
            <motion.div
              key="screaming"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <ScreamSession onScreamEnd={handleScreamEnd} />
            </motion.div>
          )}

          {currentState === 'aftermath' && (
            <motion.div
              key="aftermath"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="min-h-screen flex items-center justify-center py-8"
            >
              <div className="text-center space-y-8 max-w-2xl mx-auto px-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
                  className="w-24 h-24 mx-auto bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full flex items-center justify-center shadow-neon"
                >
                  <motion.span 
                    className="text-3xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ✨
                  </motion.span>
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-4xl md:text-5xl font-black text-white glow-text"
                >
                  YOU'RE LIGHTER NOW.
                </motion.h2>
                
                {/* Enhanced Pitch Analysis */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-dark-card rounded-2xl p-6 border border-neon-purple/30 shadow-neon space-y-4"
                >
                  <h3 className="text-xl font-bold text-white mb-4 glow-text">SCREAM ANALYSIS</h3>
                  
                  {/* Pitch Visualization */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>WHISPER</span>
                      <span>NORMAL</span>
                      <span>LOUD</span>
                      <span>VERY LOUD</span>
                      <span>EXTREME</span>
                    </div>
                    
                    <div className="relative h-8 bg-gray-800 rounded-full overflow-hidden border border-neon-purple/30">
                      <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-purple via-neon-pink to-neon-purple"></div>
                      
                      <motion.div
                        initial={{ x: 0 }}
                        animate={{ x: `${Math.min((maxPitch / 60) * 100, 100)}%` }}
                        transition={{ delay: 1, duration: 1.5, type: "spring" }}
                        className="absolute top-0 bottom-0 w-2 bg-white shadow-neon rounded-full"
                        style={{ left: 0 }}
                      >
                        <motion.div 
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-dark px-3 py-1 rounded-full text-xs font-bold shadow-neon"
                          animate={{ y: [-2, 2, -2] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          {Math.round(maxPitch)}
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <motion.div 
                      className="text-center p-4 bg-gray-800/50 rounded-xl border border-neon-cyan/30"
                      whileHover={{ scale: 1.05, borderColor: "rgba(0, 255, 255, 0.6)" }}
                    >
                      <p className="text-2xl font-black text-neon-cyan glow-text">{Math.round(maxPitch)}</p>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">MAX INTENSITY</p>
                    </motion.div>
                    <motion.div 
                      className="text-center p-4 bg-gray-800/50 rounded-xl border border-neon-pink/30"
                      whileHover={{ scale: 1.05, borderColor: "rgba(255, 51, 102, 0.6)" }}
                    >
                      <p className="text-2xl font-black text-neon-pink glow-text">{sessionDuration}s</p>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">DURATION</p>
                    </motion.div>
                  </div>

                  <div className="text-center mt-4">
                    <motion.p 
                      className="text-lg font-bold text-white mb-2"
                      animate={{ textShadow: ["0 0 10px #ff3366", "0 0 20px #ff3366", "0 0 10px #ff3366"] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      CATEGORY: <span className="text-neon-pink">{getPitchCategory(maxPitch)}</span>
                    </motion.p>
                    <p className="text-gray-300 text-sm">
                      {getPitchAssumption(maxPitch)}
                    </p>
                  </div>
                </motion.div>

                {/* Save Scream Button */}
                {user && recordedBlob && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    onClick={handleSaveScream}
                    whileHover={{ 
                      scale: 1.05,
                      filter: "brightness(1.2)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-neon-purple to-neon-pink text-white rounded-full font-black text-lg transition-all duration-300 flex items-center space-x-3 mx-auto shadow-neon scream-button"
                  >
                    <span>💾</span>
                    <span>SAVE THIS SCREAM</span>
                  </motion.button>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6 }}
                    onClick={handleSoundsStart}
                    whileHover={{ 
                      scale: 1.05,
                      filter: "brightness(1.2)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple text-white rounded-full font-bold transition-all duration-300 flex items-center space-x-2 mx-auto shadow-neon scream-button"
                  >
                    <span>🎵</span>
                    <span>CALM DOWN</span>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 }}
                    onClick={handleReset}
                    whileHover={{ 
                      scale: 1.05,
                      filter: "brightness(1.2)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-neon-pink to-neon-purple text-white rounded-full font-bold transition-all duration-300 scream-button shadow-neon"
                  >
                    SCREAM AGAIN
                  </motion.button>
                  
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.0 }}
                    onClick={handleChatStart}
                    whileHover={{ 
                      scale: 1.05,
                      filter: "brightness(1.2)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-bold transition-all duration-300 border border-gray-600 hover:border-neon-cyan scream-button"
                  >
                    TALK ABOUT IT
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {currentState === 'sounds' && (
            <motion.div
              key="sounds"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <CalmingSounds onHome={handleReset} onScreamAgain={handleScreamStart} />
            </motion.div>
          )}

          {currentState === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <AIChat onReset={handleReset} />
            </motion.div>
          )}

          {currentState === 'library' && (
            <ScreamLibrary onClose={() => setCurrentState('landing')} />
          )}
        </AnimatePresence>
      </div>

      {/* Save Scream Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <SaveScreamModal
            onSave={handleSaveScreamConfirm}
            onCancel={() => setShowSaveModal(false)}
            isLoading={savingScream}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;