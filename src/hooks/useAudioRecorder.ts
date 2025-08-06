import { useState, useRef, useCallback } from 'react';

export function useAudioRecorder() {
  const [audioData, setAudioData] = useState<number[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [currentPitch, setCurrentPitch] = useState<number>(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const chunksRef = useRef<Blob[]>([]);

  // Reduced thresholds by 50% for maximum sensitivity
  const NOISE_THRESHOLD = 10; // Reduced from 20 to 10
  const VISUALIZATION_THRESHOLD = 15; // Reduced from 30 to 15

  const calculatePitch = (dataArray: Uint8Array) => {
    // Calculate average volume level
    let sum = 0;
    let maxValue = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
      }
    }
    
    const averageVolume = sum / dataArray.length;
    
    // Apply noise threshold - ignore very quiet background noise
    if (averageVolume < NOISE_THRESHOLD) {
      return 0;
    }
    
    // Return the average volume as pitch intensity (more stable than max)
    return Math.min(averageVolume * 2, 255); // Multiply by 2 to amplify sensitivity
  };

  const processAudioData = (dataArray: Uint8Array) => {
    // Calculate average to determine if we should show visualization
    const sum = dataArray.reduce((acc, val) => acc + val, 0);
    const average = sum / dataArray.length;
    
    // Show visualization for any sound above the threshold
    if (average > VISUALIZATION_THRESHOLD) {
      // Amplify the data for better visualization
      return dataArray.map(value => Math.min(value * 1.5, 255));
    } else {
      // Return low-level data instead of zeros to show some activity
      return dataArray.map(value => value > NOISE_THRESHOLD ? value * 0.5 : 0);
    }
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false, // Disable to capture full intensity
          autoGainControl: false,  // Disable to capture true volume levels
          noiseSuppression: false, // Disable to capture all sounds properly
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      
      streamRef.current = stream;
      chunksRef.current = [];
      
      // Set up MediaRecorder for saving audio
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      
      // Create audio context and analyser
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      // Configure analyser for better sensitivity to all sound levels
      analyser.fftSize = 256; // Good balance of performance and resolution
      analyser.smoothingTimeConstant = 0.3; // Moderate smoothing for stability
      analyser.minDecibels = -90; // Capture quieter sounds
      analyser.maxDecibels = -10; // Leave headroom for loud sounds
      
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Start analyzing audio
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateAudioData = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Process audio data with lower threshold filtering
          const filteredData = processAudioData(dataArray);
          setAudioData([...filteredData]);
          
          // Calculate and update current pitch with lower threshold
          const pitch = calculatePitch(dataArray);
          setCurrentPitch(pitch);
          
          animationRef.current = requestAnimationFrame(updateAudioData);
        }
      };
      
      updateAudioData();
      setIsActive(true);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setIsActive(false);
    setAudioData([]);
    setCurrentPitch(0);
    
    // Clean up refs
    audioContextRef.current = null;
    analyserRef.current = null;
    streamRef.current = null;
  }, []);

  const clearRecording = useCallback(() => {
    setRecordedBlob(null);
    chunksRef.current = [];
  }, []);

  return {
    startRecording,
    stopRecording,
    clearRecording,
    audioData,
    isActive,
    currentPitch,
    recordedBlob,
  };
}