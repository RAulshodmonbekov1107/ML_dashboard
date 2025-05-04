import React, { useState } from 'react';
import { motion } from 'framer-motion';
import WebcamCapture from '../ui/WebcamCapture';
import FaceGallery, { FacePerson } from '../ui/FaceGallery';
import ResultDisplay from '../ui/ResultDisplay';
import LoadingSpinner from '../ui/LoadingSpinner';
import { uploadImageForPrediction } from '../../services/api';

// Sample faces for the gallery
const sampleFaces: FacePerson[] = [
  {
    id: 0,
    name: 'John Doe',
    imageSrc: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: 1,
    name: 'Jane Smith',
    imageSrc: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: 2,
    name: 'Michael Johnson',
    imageSrc: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    id: 3,
    name: 'Sarah Williams',
    imageSrc: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: 4,
    name: 'David Brown',
    imageSrc: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    id: 5,
    name: 'Emily Davis',
    imageSrc: 'https://randomuser.me/api/portraits/women/3.jpg',
  },
];

interface FaceRecognitionModelFormProps {
  modelEndpoint: string;
  title: string;
  description: string;
}

interface RecognitionResult {
  person_id: number;
  confidence: number;
}

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

const FaceRecognitionModelForm: React.FC<FaceRecognitionModelFormProps> = ({
  modelEndpoint,
  title,
  description
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [faces, setFaces] = useState<FacePerson[]>(sampleFaces);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [bestMatch, setBestMatch] = useState<FacePerson | null>(null);
  const [autoProcessing, setAutoProcessing] = useState<boolean>(false);
  const [selectedFace, setSelectedFace] = useState<FacePerson | null>(null);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  // Define a constant for the processing interval instead of state since it's not changing
  const processingInterval = 2000; // 2 seconds

  // Handle image capture from webcam
  const handleCapture = (imageSrc: string, imageBlob: Blob) => {
    setCapturedImage(imageSrc);
    setCapturedBlob(imageBlob);
    
    // Auto process if enabled
    if (autoProcessing) {
      processImage(imageBlob);
    }
  };

  // Handle webcam errors
  const handleWebcamError = (errorMsg: string) => {
    setError(`Webcam error: ${errorMsg}`);
  };

  // Process the captured image for face recognition
  const processImage = async (blob: Blob) => {
    if (!blob) {
      setError('No image captured');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create a file from the blob for API upload
      const file = new File([blob], "face-capture.jpg", { type: 'image/jpeg' });
      
      // Log debug info
      setDebugInfo(`Processing image: ${file.name}, size: ${file.size} bytes`);
      
      // Call API to process the image
      const result = await uploadImageForPrediction(file, modelEndpoint);
      
      // Set recognition result
      setRecognitionResult(result);
      
      // Update debug info
      setDebugInfo(prev => `${prev}\nAPI Response: ${JSON.stringify(result)}`);
      
      // Update match percentages in faces
      const updatedFaces = faces.map(face => {
        if (face.id === result.person_id) {
          return { 
            ...face, 
            matchPercentage: result.confidence 
          };
        }
        return { 
          ...face, 
          matchPercentage: Math.random() * 0.3 // Random low match for others
        };
      });
      
      setFaces(updatedFaces);
      
      // Set best match
      const match = updatedFaces.find(face => face.id === result.person_id);
      if (match) {
        setBestMatch(match);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process image';
      setError(errorMessage);
      setDebugInfo(prev => `${prev}\nError: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual processing button
  const handleProcessClick = () => {
    if (capturedBlob) {
      processImage(capturedBlob);
    } else {
      setError('Please capture an image first');
    }
  };

  // Toggle auto processing
  const toggleAutoProcessing = () => {
    setAutoProcessing(prev => !prev);
  };

  // Handle face selection from gallery
  const handleSelectFace = (face: FacePerson) => {
    setSelectedFace(face);
  };

  // Add a new face to the gallery
  const handleAddFace = () => {
    if (capturedImage && selectedFace === null) {
      const newId = faces.length > 0 ? Math.max(...faces.map(f => f.id)) + 1 : 0;
      const newFace: FacePerson = {
        id: newId,
        name: `Person ${newId + 1}`,
        imageSrc: capturedImage,
      };
      setFaces([...faces, newFace]);
      setDebugInfo(prev => `${prev}\nAdded new face: ${newFace.name} (ID: ${newFace.id})`);
    }
  };

  // Toggle debug mode
  const toggleDebugMode = () => {
    setDebugMode(prev => !prev);
  };

  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <motion.div className="mb-6" variants={itemVariants}>
          <WebcamCapture 
            onCapture={handleCapture}
            onError={handleWebcamError}
            autoCapture={autoProcessing}
            captureInterval={processingInterval}
          />
        </motion.div>
        
        {/* Controls */}
        <motion.div className="mt-6 flex flex-wrap gap-3" variants={itemVariants}>
          <motion.button
            onClick={handleProcessClick}
            disabled={!capturedBlob || loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" color="white" />
                <span className="ml-2">Processing...</span>
              </div>
            ) : 'Process Image'}
          </motion.button>
          
          <motion.button
            onClick={toggleAutoProcessing}
            className={`px-4 py-2 rounded-md font-medium transition-all shadow-lg hover:shadow-xl ${
              autoProcessing 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {autoProcessing ? 'Stop Auto Processing' : 'Start Auto Processing'}
          </motion.button>
          
          <motion.button
            onClick={handleAddFace}
            disabled={!capturedImage || selectedFace !== null}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add to Gallery
          </motion.button>
          
          <motion.button
            onClick={toggleDebugMode}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-all shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
          </motion.button>
        </motion.div>
        
        {/* Error display */}
        {error && (
          <motion.div 
            className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}
        
        {/* Debug info */}
        {debugMode && debugInfo && (
          <motion.div 
            className="mt-4 bg-gray-800 p-3 rounded-md border border-gray-700 text-xs text-blue-300 whitespace-pre-wrap overflow-auto max-h-40"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.5 }}
          >
            <strong>Debug Info:</strong>
            <div>{debugInfo}</div>
          </motion.div>
        )}
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <motion.h3 
          className="text-lg font-medium text-white mb-4"
          variants={itemVariants}
        >
          Recognition Results
        </motion.h3>
        
        {/* Facial scanning animation */}
        <motion.div 
          className="mb-8 flex justify-center"
          variants={itemVariants}
          animate={{ opacity: loading ? 1 : 0.5 }}
        >
          <div className="face-scan-animation">
            <div className="face-grid"></div>
            {loading && <div className="scan-line"></div>}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const x = Math.cos(angle) * 40 + 60;
              const y = Math.sin(angle) * 40 + 60;
              
              return (
                <motion.div
                  key={`dot-${i}`}
                  className="face-dot"
                  style={{ left: x, top: y }}
                  animate={{ 
                    opacity: loading ? [0.3, 1, 0.3] : 0.3,
                    scale: loading ? [1, 1.5, 1] : 1 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              );
            })}
          </div>
        </motion.div>
        
        {/* Result display */}
        <motion.div variants={itemVariants}>
          {recognitionResult ? (
            <ResultDisplay
              result={{
                prediction: recognitionResult.person_id,
                confidence: recognitionResult.confidence,
                probabilities: faces.map(face => ({
                  class: face.name,
                  probability: face.matchPercentage || 0
                }))
              }}
              isLoading={false}
              error={null}
              className="mt-5"
            />
          ) : (
            <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-lg text-center text-gray-300">
              No face recognized yet. Capture an image to begin.
            </div>
          )}
        </motion.div>
        
        {/* Face gallery */}
        <motion.div 
          className="mt-8"
          variants={itemVariants}
        >
          <FaceGallery 
            faces={faces} 
            onSelectFace={handleSelectFace}
            bestMatch={bestMatch}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default FaceRecognitionModelForm; 