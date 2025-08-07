import { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types/user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserData(session.user);
        
        // Redirect to paywall after successful sign-in
        if (event === 'SIGNED_IN') {
          // Small delay to ensure the page has loaded
          setTimeout(() => {
            window.location.hash = '#paywall';
          }, 100);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (supabaseUser: SupabaseUser) => {
    try {
      // Check if user exists in our users table
      let { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // User doesn't exist, create new user record
        const newUser = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          display_name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
          avatar_url: supabaseUser.user_metadata?.avatar_url || null,
          subscription_status: 'none' as const,
          screams_this_month: 0,
          auto_renewal: false
        };

        const { data: insertedUser, error: insertError } = await supabase
          .from('users')
          .insert(newUser)
          .select()
          .single();

        if (insertError) throw insertError;
        userData = insertedUser;
      } else if (error) {
        throw error;
      }

      if (userData) {
        setUser({
          id: userData.id,
          email: userData.email,
          displayName: userData.display_name,
          avatarUrl: userData.avatar_url,
          subscriptionStatus: userData.subscription_status,
          subscriptionId: userData.subscription_id,
          screamsThisMonth: userData.screams_this_month,
          subscriptionEndDate: userData.subscription_end_date ? new Date(userData.subscription_end_date) : null,
          autoRenewal: userData.auto_renewal
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
      
      // Use the current domain for redirect
      const redirectTo = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any temporary bypass
      localStorage.removeItem('temp_bypass_subscription');
      
      // Redirect to home
      window.location.hash = '';
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateUserSubscription = async (
    subscriptionStatus: User['subscriptionStatus'],
    subscriptionId?: string | null,
    subscriptionEndDate?: Date | null,
    autoRenewal?: boolean
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          subscription_status: subscriptionStatus,
          subscription_id: subscriptionId,
          subscription_end_date: subscriptionEndDate?.toISOString(),
          auto_renewal: autoRenewal,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => prev ? {
        ...prev,
        subscriptionStatus,
        subscriptionId,
        subscriptionEndDate,
        autoRenewal: autoRenewal || false
      } : null);
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  };

  const incrementScreamCount = async () => {
    if (!user) return;

    try {
      const newCount = user.screamsThisMonth + 1;
      const { error } = await supabase
        .from('users')
        .update({
          screams_this_month: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => prev ? { ...prev, screamsThisMonth: newCount } : null);
    } catch (error) {
      console.error('Error incrementing scream count:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signOut,
    updateUserSubscription,
    incrementScreamCount
  };
}