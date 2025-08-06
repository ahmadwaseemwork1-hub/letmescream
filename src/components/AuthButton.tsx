import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';

interface AuthButtonProps {
  onProfileClick?: () => void;
}

export default function AuthButton({ onProfileClick }: AuthButtonProps) {
  const { user, loading, signInWithGoogle } = useAuth();
  const { hasActiveSubscription } = useSubscription();

  const handleClick = () => {
    if (user) {
      onProfileClick?.();
    } else {
      signInWithGoogle();
    }
  };

  if (loading) {
    return (
      <div className="fixed top-6 right-6 z-30">
        <div className="w-10 h-10 bg-soft-lavender/80 rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed top-6 right-6 z-30 group"
    >
      {user ? (
        <div className="flex items-center space-x-2 bg-gradient-to-r from-primary-purple to-accent-pink hover:from-primary-purple/80 hover:to-accent-pink/80 text-off-white px-4 py-2 rounded-full shadow-lg transition-all duration-200">
          {user.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.displayName}
              className="w-6 h-6 rounded-full border border-off-white/20"
            />
          ) : (
            <User size={20} />
          )}
          <span className="font-medium text-sm hidden sm:block">
            {user.displayName?.split(' ')[0] || 'Profile'}
          </span>
          {hasActiveSubscription && (
            <div className="w-2 h-2 bg-off-white rounded-full"></div>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-r from-accent-pink to-primary-purple hover:from-accent-pink/80 hover:to-primary-purple/80 text-off-white px-4 py-2 rounded-full shadow-lg transition-all duration-200 flex items-center space-x-2">
          <LogIn size={20} />
          <span className="font-medium text-sm hidden sm:block">Sign In</span>
        </div>
      )}
    </motion.button>
  );
}