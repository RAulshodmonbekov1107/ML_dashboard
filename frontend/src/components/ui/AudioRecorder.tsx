import React, { useState, useRef, useEffect } from 'react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  maxDurationSeconds?: number;
  label?: string;
  className?: string;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  maxDurationSeconds = 60,
  label = 'Record Audio',
  className = '',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  // Clean up on component unmount
  useEffect(() => {
    // Cleanup function to stop recording and release resources
    const cleanupFn = () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
    
    return cleanupFn;
  }, [audioUrl]);

  const startRecording = async () => {
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Reset chunks
      chunksRef.current = [];
      
      // Set up event handlers for the MediaRecorder
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setIsRecording(false);
        onRecordingComplete(audioBlob);
        
        // Reset timer
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          
          // Stop recording if max duration is reached
          if (newTime >= maxDurationSeconds) {
            stopRecording();
          }
          
          return newTime;
        });
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Could not access microphone. Please ensure you have granted permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
  };

  // Format seconds to mm:ss format
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {label && <div className="text-sm font-medium text-gray-700">{label}</div>}
      
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          {!isRecording && !audioUrl && (
            <button
              type="button"
              onClick={startRecording}
              className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-full p-3 transition focus:outline-none focus:ring-2 focus:ring-red-300"
              aria-label="Start Recording"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
              </svg>
            </button>
          )}
          
          {isRecording && (
            <>
              <div className="text-red-500 animate-pulse font-medium">
                {formatTime(recordingTime)}
              </div>
              
              <button
                type="button"
                onClick={stopRecording}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-full p-3 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-label="Stop Recording"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
                </svg>
              </button>
            </>
          )}
          
          {audioUrl && !isRecording && (
            <>
              <audio 
                controls 
                src={audioUrl} 
                className="max-w-full"
              />
              
              <button
                type="button"
                onClick={resetRecording}
                className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-full p-2 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-label="Record Again"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
            </>
          )}
        </div>
        
        {isRecording && (
          <div className="text-sm text-gray-500">
            Recording... (max {formatTime(maxDurationSeconds)})
          </div>
        )}
        
        {error && (
          <div className="text-sm text-red-500">{error}</div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder; 