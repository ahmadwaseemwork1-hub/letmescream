import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

export interface Scream {
  id: string;
  userId: string;
  name: string;
  audioUrl: string;
  duration: number;
  maxPitch: number;
  fileSize: number;
  createdAt: Date;
  updatedAt: Date;
}

export function useScreams(userId: string | null) {
  const [screams, setScreams] = useState<Scream[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setScreams([]);
      return;
    }

    // Real-time listener for user's screams
    const q = query(
      collection(db, 'screams'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const screamsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Scream[];
      
      setScreams(screamsData);
    });

    return unsubscribe;
  }, [userId]);

  const saveScream = async (
    audioBlob: Blob,
    name: string,
    duration: number,
    maxPitch: number
  ): Promise<string> => {
    if (!userId) throw new Error('User not authenticated');

    setLoading(true);
    try {
      // Upload audio file to Firebase Storage
      const fileName = `screams/${userId}/${Date.now()}.webm`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, audioBlob);
      const audioUrl = await getDownloadURL(snapshot.ref);

      // Save scream metadata to Firestore
      const docRef = await addDoc(collection(db, 'screams'), {
        userId,
        name,
        audioUrl,
        duration,
        maxPitch,
        fileSize: audioBlob.size,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return docRef.id;
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
      // Delete audio file from Storage
      const storageRef = ref(storage, audioUrl);
      await deleteObject(storageRef);

      // Delete scream document from Firestore
      await deleteDoc(doc(db, 'screams', screamId));
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
      await updateDoc(doc(db, 'screams', screamId), {
        name: newName,
        updatedAt: new Date()
      });
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