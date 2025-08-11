import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Scream } from '../types/user';

export function useScreams(userId: string | null) {
  const [screams, setScreams] = useState<Scream[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setScreams([]);
      return;
    }

    loadScreams();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('screams_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'screams',
          filter: `user_id=eq.${userId}`
        }, 
        () => {
          loadScreams();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const loadScreams = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('screams')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const screamsData = data.map(scream => ({
        id: scream.id,
        userId: scream.user_id,
        name: scream.name,
        audioUrl: scream.audio_url,
        duration: scream.duration,
        maxPitch: scream.max_pitch,
        fileSize: scream.file_size,
        createdAt: new Date(scream.created_at),
        updatedAt: new Date(scream.updated_at)
      }));

      setScreams(screamsData);
    } catch (error) {
      console.error('Error loading screams:', error);
    }
  };

  const saveScream = async (
    audioBlob: Blob,
    name: string,
    duration: number,
    maxPitch: number
  ): Promise<string> => {
    if (!userId) throw new Error('User not authenticated');

    setLoading(true);
    try {
      // Upload audio file to Supabase Storage
      const fileName = `${userId}/${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('screams')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('screams')
        .getPublicUrl(fileName);

      // Save scream metadata to database
      const { data, error } = await supabase
        .from('screams')
        .insert({
          user_id: userId,
          name,
          audio_url: publicUrl,
          duration,
          max_pitch: maxPitch,
          file_size: audioBlob.size
        })
        .select()
        .single();

      if (error) throw error;

      return data.id;
    } catch (error) {
      console.error('Error saving scream:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteScream = async (screamId: string, audioUrl: string) => {
    setLoading(true);
    try {
      // Extract file path from URL
      const urlParts = audioUrl.split('/');
      const fileName = urlParts.slice(-2).join('/'); // Get userId/filename.webm

      // Delete audio file from Storage
      const { error: storageError } = await supabase.storage
        .from('screams')
        .remove([fileName]);

      if (storageError) {
        console.warn('Error deleting file from storage:', storageError);
      }

      // Delete scream record from database
      const { error } = await supabase
        .from('screams')
        .delete()
        .eq('id', screamId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting scream:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateScreamName = async (screamId: string, newName: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('screams')
        .update({
          name: newName,
          updated_at: new Date().toISOString()
        })
        .eq('id', screamId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating scream name:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    screams,
    loading,
    saveScream,
    deleteScream,
    updateScreamName
  };
}