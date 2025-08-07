import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import ScreamSession from './components/ScreamSession';
import AIChat from './components/AIChat';
import BackgroundEffects from './components/BackgroundEffects';
import CalmingSounds from './components/CalmingSounds';
import AuthButton from './components/AuthButton';
import SubscriptionPaywall from './components/SubscriptionPaywall';
import ScreamLibrary from './components/ScreamLibrary';
import SaveScreamModal from './components/SaveScreamModal';
import { Coffee, MessageCircle } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useScreams } from './hooks/useScreams';
import { useSubscription } from './hooks/useSubscription';

export type AppState = 'landing' | 'screaming' | 'aftermath' | 'chat' | 'sounds' | 'paywall' | 'library';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('landing');
  const [hasScreamed, setHasScreamed] = useState(false);
  const [maxPitch, setMaxPitch] = useState<number>(0);
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  const { user } = useAuth();
  const { saveScream, loading: savingScream } = useScreams(user?.id || null);
  const { hasActiveSubscription } = useSubscription();

  // Check for subscription success/cancel in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const subscription = urlParams.get('subscription');
    
    if (subscription === 'success') {
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      // Show success message or redirect to library
      setCurrentState('library');
    } else if (subscription === 'cancelled') {
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      // Show cancelled message
      alert('Subscription cancelled. You can try again anytime!');
    }
  }, []);

  // Handle hash-based navigation for paywall
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash === 'paywall') {
        setCurrentState('paywall');
        // Clear the hash
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    // Check initial hash
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

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

  const handleProfileClick = () => {
    if (!user) {
      setCurrentState('paywall');
      return;
    }

    if (!hasActiveSubscription) {
      setCurrentState('paywall');
    } else {
      setCurrentState('library');
    }
  };

  const handleSubscribe = () => {
    // After successful subscription, redirect to library
    setCurrentState('library');
  };

  const handleSaveScream = () => {
    if (!user) {
      setCurrentState('paywall');
      return;
    }

    if (!hasActiveSubscription) {
      setCurrentState('paywall');
      return;
    }

    setShowSaveModal(true);
  };

  const handleSaveScreamConfirm = async (name: string) => {
    if (!recordedBlob || !user) return;

    try {
      await saveScream(recordedBlob, name, sessionDuration, maxPitch);
      setShowSaveModal(false);
      setRecordedBlob(null);
      alert('Scream saved successfully!');
    } catch (error) {
      alert('Failed to save scream. Please try again.');
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
    return "Extreme";
  };

  return (
    <div className="min-h-screen relative overflow-hidden gradient-bg">
      <BackgroundEffects />
      
      {/* Auth Button - Top Right */}
      <AuthButton onProfileClick={handleProfileClick} />
      
      {/* Buy Me Coffee Button - Bottom Left - Only show on landing page */}
      {currentState === 'landing' && (
        <motion.a
          href="#"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 left-6 z-30 group"
        >
          <div className="bg-gradient-to-r from-accent-pink to-primary-purple hover:from-accent-pink/80 hover:to-primary-purple/80 text-off-white px-4 py-3 rounded-full shadow-lg transition-all duration-200 flex items-center space-x-2 breathing-glow">
            <Coffee size={20} className="group-hover:animate-bounce" />
            <span className="font-medium">Buy Coffee</span>
          </div>
        </motion.a>
      )}

      {/* Chat Button - Bottom Right - Show on all screens except chat and sounds */}
      {currentState !== 'chat' && currentState !== 'sounds' && currentState !== 'paywall' && currentState !== 'library' && (
        <motion.button
          onClick={handleChatStart}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.4 }}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-30 group"
        >
          <div className="bg-gradient-to-r from-primary-purple to-accent-pink hover:from-primary-purple/80 hover:to-accent-pink/80 text-off-white px-4 py-3 rounded-full shadow-lg transition-all duration-200 flex items-center space-x-2 breathing-glow">
            <MessageCircle size={20} className="group-hover:animate-pulse" />
            <span className="font-medium">Chat anonymously</span>
          </div>
        </motion.button>
      )}
      
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {currentState === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <LandingPage onScreamStart={handleScreamStart} />
            </motion.div>
          )}

          {currentState === 'screaming' && (
            <motion.div
              key="screaming"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
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
              <div className="text-center space-y-6 max-w-2xl mx-auto px-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 mx-auto bg-gradient-to-r from-calm-blue-tint to-primary-purple rounded-full flex items-center justify-center breathing-glow"
                >
                  <span className="text-2xl">✨</span>
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl md:text-4xl font-bold text-light-gray"
                >
                  You're lighter now.
                </motion.h2>
                
                {/* Compact Graphical Pitch Representation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-pale-lilac/80 rounded-xl p-4 backdrop-blur-sm space-y-3 border border-soft-lavender"
                >
                  <h3 className="text-lg font-semibold text-light-gray mb-3">Your Scream Analysis</h3>
                  
                  {/* Pitch Visualization */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-light-gray/70">
                      <span>Whisper</span>
                      <span>Normal</span>
                      <span>Loud</span>
                      <span>Very Loud</span>
                      <span>Extreme</span>
                    </div>
                    
                    <div className="relative h-6 bg-soft-lavender rounded-full overflow-hidden">
                      {/* Background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-calm-blue-tint via-primary-purple via-accent-pink to-primary-purple"></div>
                      
                      {/* Your pitch marker */}
                      <motion.div
                        initial={{ x: 0 }}
                        animate={{ x: `${Math.min((maxPitch / 60) * 100, 100)}%` }}
                        transition={{ delay: 1, duration: 1.5, type: "spring" }}
                        className="absolute top-0 bottom-0 w-1 bg-off-white shadow-lg"
                        style={{ left: 0 }}
                      >
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-off-white text-light-gray px-2 py-1 rounded text-xs font-bold">
                          {Math.round(maxPitch)}
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Compact Stats */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="text-center">
                      <p className="text-xl font-bold text-primary-purple">{Math.round(maxPitch)}</p>
                      <p className="text-xs text-light-gray/70">Max Intensity</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-accent-pink">{sessionDuration}s</p>
                      <p className="text-xs text-light-gray/70">Duration</p>
                    </div>
                  </div>

                  <div className="text-center mt-3">
                    <p className="text-base font-semibold text-light-gray mb-1">
                      Category: <span className="text-primary-purple">{getPitchCategory(maxPitch)}</span>
                    </p>
                    <p className="text-light-gray/80 text-sm">
                      {getPitchAssumption(maxPitch)}
                    </p>
                  </div>
                </motion.div>

                {/* Save Scream Button - Only show if user is signed in and has recorded audio */}
                {user && recordedBlob && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    onClick={handleSaveScream}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-primary-purple to-accent-pink hover:from-primary-purple/80 hover:to-accent-pink/80 text-off-white rounded-full font-medium transition-all duration-300 flex items-center space-x-2 mx-auto breathing-glow"
                  >
                    <span>💾</span>
                    <span>Save This Scream</span>
                  </motion.button>
                )}

                {/* Calming Sounds Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 }}
                  onClick={handleSoundsStart}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-calm-blue-tint to-primary-purple hover:from-calm-blue-tint/80 hover:to-primary-purple/80 text-light-gray rounded-full font-medium transition-all duration-300 flex items-center space-x-2 mx-auto breathing-glow"
                >
                  <span>🎵</span>
                  <span>Play Calming Sound</span>
                </motion.button>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 }}
                    onClick={handleReset}
                    className="px-6 py-2.5 bg-gradient-to-r from-primary-purple to-accent-pink hover:from-primary-purple/80 hover:to-accent-pink/80 text-off-white rounded-full font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    Scream Again
                  </motion.button>
                  
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.0 }}
                    onClick={handleChatStart}
                    className="px-6 py-2.5 bg-soft-lavender hover:bg-soft-lavender/80 text-light-gray rounded-full font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    Want to talk about it?
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

          {currentState === 'paywall' && (
            <SubscriptionPaywall
              onClose={() => setCurrentState('landing')}
              onSubscribe={handleSubscribe}
            />
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

      {/* Footer - Only show on landing page */}
      {currentState === 'landing' && (
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-0 left-0 right-0 z-20 p-6 text-center"
        >
          <p className="text-light-gray/70 text-sm mb-2">
            No data is saved. Screams vanish into the void.
          </p>
          <div className="flex justify-center items-center space-x-4 text-xs text-light-gray/60">
            <a href="#" className="hover:text-light-gray transition-colors">
              Mental Health Resources
            </a>
            <span>•</span>
            <a href="#" className="hover:text-light-gray transition-colors">
              Crisis Helpline: 988
            </a>
          </div>
        </motion.footer>
      )}
    </div>
  );
}

export default App;