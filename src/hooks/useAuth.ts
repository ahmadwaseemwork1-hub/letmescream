import { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, signInWithGoogle as firebaseSignIn, signOut as firebaseSignOut } from '../lib/firebase';
import { User } from '../types/user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await loadUserData(firebaseUser);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: userData.displayName || firebaseUser.displayName || 'User',
          avatarUrl: userData.avatarUrl || firebaseUser.photoURL,
          subscriptionStatus: 'unlimited', // Everyone gets unlimited access now
          screamsThisMonth: userData.screamsCount || 0,
          subscriptionEndDate: null,
          autoRenewal: false
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await firebaseSignIn();
    } catch (error) {
      console.error('Error signing in:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const incrementScreamCount = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.id);
      const newCount = user.screamsThisMonth + 1;
      
      await updateDoc(userRef, {
        screamsCount: newCount,
        lastScream: new Date()
      });

      setUser(prev => prev ? { ...prev, screamsThisMonth: newCount } : null);
    } catch (error) {
      console.error('Error incrementing scream count:', error);
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signOut,
    incrementScreamCount
  };
}