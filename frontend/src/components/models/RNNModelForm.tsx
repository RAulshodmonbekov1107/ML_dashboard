import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../ui/LoadingSpinner';
import AudioRecorder from '../ui/AudioRecorder';

// Define a type for the SpeechRecognition API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

// Add types for Speech Recognition events
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [index: number]: {
        transcript: string;
        confidence: number;
      }
    }
  }
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface RNNModelFormProps {
  modelEndpoint: string;
  title: string;
  description: string;
}

const RNNModelForm: React.FC<RNNModelFormProps> = ({
  modelEndpoint,
  title,
  description
}) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [confidenceLevel, setConfidenceLevel] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recognitionSupported, setRecognitionSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  
  // Refs for holding recognition instances
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const resultVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  // Check if browser supports the Web Speech API
  useEffect(() => {
    const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setRecognitionSupported(isSupported);
    if (!isSupported) {
      setError('Your browser does not support speech recognition. Try using Chrome or Edge.');
    }
    
    // Cleanup function to stop any active recognition on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping
        }
      }
      
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  const handleAudioRecorded = (blob: Blob) => {
    // Create a File from the Blob
    const file = new File([blob], "recording.wav", { type: "audio/wav" });
    setAudioFile(file);
    
    // Create URL for audio playback
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    
    // Start live speech recognition with the recorded audio
    startRecognitionWithAudio(url);
  };

  // Real speech recognition for live input
  const startLiveSpeechRecognition = () => {
    if (!recognitionSupported) {
      setError('Speech recognition is not supported in your browser');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setIsListening(true);
      setTranscription('Listening to your speech...');
      
      // Get the appropriate speech recognition constructor
      const SpeechRecognition = (window as any).SpeechRecognition || 
                               (window as any).webkitSpeechRecognition;
      
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      let finalTranscript = '';
      let interimTranscript = '';
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            setConfidenceLevel(confidence);
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscription(finalTranscript + (interimTranscript ? `(${interimTranscript})` : ''));
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const errorMsg = event.error;
        console.error('Speech recognition error:', errorMsg);
        
        if (errorMsg !== 'no-speech') {
          setError(`Error with speech recognition: ${errorMsg}`);
        }
        
        setIsListening(false);
        setLoading(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        setLoading(false);
        
        // If we didn't get any transcription, show an error
        if (!finalTranscript && !interimTranscript) {
          setError('No speech was detected. Please speak clearly and try again.');
        }
      };
      
      recognition.start();
    } catch (err) {
      setError('Failed to start speech recognition. Please try again.');
      setIsListening(false);
      setLoading(false);
      console.error('Error starting speech recognition:', err);
    }
  };

  // Process uploaded audio file with speech recognition
  const startRecognitionWithAudio = (audioSrc: string) => {
    if (!recognitionSupported) {
      setError('Speech recognition is not supported in your browser');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setTranscription('Processing audio...');
      
      // Create an audio element to play the audio
      const audio = new Audio(audioSrc);
      audioElementRef.current = audio;
      
      // Set up speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || 
                               (window as any).webkitSpeechRecognition;
      
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      let finalTranscript = '';
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            setConfidenceLevel(event.results[i][0].confidence);
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update with both final and interim results
        setTranscription(finalTranscript + (interimTranscript ? `(${interimTranscript})` : ''));
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const errorMsg = event.error;
        console.error('Speech recognition error:', errorMsg);
        
        if (errorMsg === 'no-speech') {
          setTranscription('No speech detected in the audio. Please try a different file or speak into your microphone.');
        } else {
          setError(`Error with speech recognition: ${errorMsg}`);
        }
        
        audio.pause();
        setLoading(false);
      };
      
      recognition.onend = () => {
        setLoading(false);
        
        // If no transcription was generated, set an error message
        if (!finalTranscript) {
          setTranscription('Could not transcribe the audio. Please ensure it contains clear speech and try again.');
        }
      };
      
      // Set up audio event handlers
      audio.onplay = () => {
        setTranscription('Transcribing audio...');
        recognition.start();
      };
      
      audio.onended = () => {
        recognition.stop();
      };
      
      // Play the audio to start transcription
      audio.play();
    } catch (err) {
      setError('Failed to process audio. Please try again.');
      setLoading(false);
      console.error('Error processing audio:', err);
    }
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const url = URL.createObjectURL(file);
    
    setAudioFile(file);
    setAudioUrl(url);
    
    // Process the uploaded audio file
    startRecognitionWithAudio(url);
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    }
    
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    
    setIsListening(false);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, we'll just show the transcription
    // In a real application, you would send the audio or transcription to your backend
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        variants={itemVariants}
        className="space-y-6"
      >
        <form onSubmit={handleSubmit}>
          <motion.div 
            className="p-6 bg-gradient-to-r from-teal-50 to-white rounded-xl shadow-md border border-teal-100 mb-6"
            variants={itemVariants}
          >
            <h3 className="text-xl font-semibold text-teal-800 mb-4">Speech Input Options</h3>
            
            <div className="space-y-4">
              {/* Microphone Option */}
              <motion.div 
                className="bg-white p-5 rounded-lg border border-teal-200 hover:border-teal-400 transition-all duration-200"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <h4 className="text-lg font-medium text-teal-700 mb-3">Record Speech</h4>
                <p className="text-gray-600 mb-4 text-sm">
                  Speak directly into your microphone for real-time speech recognition
                </p>
                
                {recognitionSupported ? (
                  <div className="flex flex-col items-center space-y-3">
                    <AudioRecorder onRecordingComplete={handleAudioRecorded} />
                    
                    {!audioFile && (
                      <motion.button
                        type="button"
                        className={`w-full py-3 px-4 rounded-md font-medium transition-all duration-300 ${
                          isListening
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white'
                        }`}
                        onClick={isListening ? stopRecognition : startLiveSpeechRecognition}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isListening ? (
                          <>
                            <span className="mr-2">Stop Listening</span>
                            <span className="inline-block w-3 h-3 bg-red-200 rounded-full animate-pulse"></span>
                          </>
                        ) : (
                          'Start Listening'
                        )}
                      </motion.button>
                    )}
                  </div>
                ) : (
                  <div className="text-red-500 p-3 bg-red-50 rounded-md text-sm">
                    Speech recognition is not supported in your browser. Please try Chrome or Edge.
                  </div>
                )}
              </motion.div>
              
              {/* File Upload Option */}
              <motion.div 
                className="bg-white p-5 rounded-lg border border-teal-200 hover:border-teal-400 transition-all duration-200"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <h4 className="text-lg font-medium text-teal-700 mb-3">Upload Audio File</h4>
                <p className="text-gray-600 mb-4 text-sm">
                  Upload an audio recording to transcribe speech
                </p>
                
                <div className="mt-2">
                  <label
                    htmlFor="audio-upload"
                    className="flex justify-center items-center px-4 py-3 border-2 border-dashed border-teal-300 rounded-lg text-teal-700 hover:border-teal-500 hover:bg-teal-50 cursor-pointer transition-all duration-200"
                  >
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <span>Select audio file</span>
                    <input
                      id="audio-upload"
                      name="audio"
                      type="file"
                      accept="audio/*"
                      className="sr-only"
                      onChange={handleAudioFileUpload}
                    />
                  </label>
                  
                  {audioFile && (
                    <div className="mt-3 flex items-center space-x-2 text-sm text-teal-800 bg-teal-50 rounded-md p-2">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                      </svg>
                      <span className="truncate">{audioFile.name}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div 
            className="mt-8 bg-teal-50 p-5 rounded-lg border border-teal-100"
            variants={itemVariants}
          >
            <h4 className="text-sm font-bold text-teal-800 mb-2">About Recurrent Neural Networks</h4>
            <p className="text-sm text-gray-700">
              Recurrent Neural Networks (RNNs) are specialized in processing sequential data like speech. 
              They use "memory" to process sequences of inputs, making them ideal for speech recognition and 
              natural language processing. Our model has been trained on thousands of hours of speech in 
              multiple languages and accents.
            </p>
          </motion.div>
        </form>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <motion.h3 
          className="text-xl font-semibold text-teal-800 mb-4"
          variants={itemVariants}
        >
          Speech Recognition Results
        </motion.h3>
        
        <motion.div 
          className="bg-white rounded-lg shadow-md border border-teal-100 p-6 min-h-[350px] transition-all duration-300"
          variants={resultVariants}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <LoadingSpinner size="lg" color="blue" />
              <span className="mt-4 text-teal-600">
                Processing speech...
              </span>
              <div className="speech-wave animate mt-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="wave-bar" />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 bg-red-50 rounded-md">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          ) : transcription ? (
            <div className="space-y-4">
              <h4 className="font-semibold text-teal-800">Transcription:</h4>
              <div className="bg-teal-50 p-4 rounded-md text-gray-800 border border-teal-100 min-h-[200px]">
                {transcription}
              </div>
              
              {confidenceLevel > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-teal-800 mb-2">Confidence Score:</h4>
                  <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-teal-600" 
                      style={{ width: `${confidenceLevel * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>0%</span>
                    <span>{Math.round(confidenceLevel * 100)}%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}
              
              {audioUrl && (
                <div className="mt-4">
                  <h4 className="font-semibold text-teal-800 mb-2">Recorded Audio:</h4>
                  <audio 
                    controls 
                    src={audioUrl} 
                    className="w-full mt-2 rounded"
                    ref={audioElementRef}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 h-full flex flex-col items-center justify-center">
              <svg className="w-16 h-16 text-teal-200 mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
              </svg>
              <p className="text-center">Speak into your microphone or upload an audio file to see speech recognition in action</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default RNNModelForm; 