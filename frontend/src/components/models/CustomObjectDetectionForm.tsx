import React, { useState, useEffect } from 'react';
import WebcamCapture from '../WebcamCapture';
import ResultDisplay from '../ui/ResultDisplay';
import LoadingSpinner from '../ui/LoadingSpinner';
import apiService, { TrainingStatus, PredictionResult, CustomModelData } from '../../services/apiService';
import * as tf from '@tensorflow/tfjs';
import cocoSsd from '../../cocossd';

interface CustomObjectDetectionFormProps {
  modelEndpoint?: string;
  title?: string;
  description?: string;
}

interface TrainingData {
  images: File[];
  className: string;
  progress: number;
  status: TrainingStatus['status'];
  message: string;
}

interface DetectionData {
  detectedObjects: Array<{
    bbox: [number, number, number, number];
    class: string;
    score: number;
  }> | null;
  imageSrc: string | null;
}

const CustomObjectDetectionForm: React.FC<CustomObjectDetectionFormProps> = ({
  modelEndpoint = 'object-detection',
  title = 'Custom Object Detection',
  description = 'Train and use a custom object detection model'
}) => {
  // State for model inference
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [view, setView] = useState<'train' | 'detect'>('detect');
  const [customModels, setCustomModels] = useState<CustomModelData[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('coco-ssd');
  
  // State for training
  const [trainingData, setTrainingData] = useState<TrainingData>({
    images: [],
    className: '',
    progress: 0,
    status: 'idle',
    message: ''
  });
  
  // State for detection
  const [detectionData, setDetectionData] = useState<DetectionData>({
    detectedObjects: null,
    imageSrc: null
  });
  
  // Load available custom models
  useEffect(() => {
    const loadCustomModels = async () => {
      try {
        const models = await apiService.getCustomModels();
        setCustomModels(models);
      } catch (err) {
        console.error('Error loading custom models:', err);
      }
    };
    
    loadCustomModels();
  }, []);
  
  // Load TensorFlow model when selectedModel changes
  useEffect(() => {
    const loadModel = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For now, we'll always load the coco-ssd model
        // In a real app, we'd load the custom model
        await cocoSsd.load(); // Don't store the model since we don't use it
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to load model:', err);
        setError('Failed to load the object detection model');
        setLoading(false);
      }
    };
    
    loadModel();
    
    // Cleanup TensorFlow resources
    return () => {
      if (tf.getBackend()) {
        tf.disposeVariables();
      }
    };
  }, [selectedModel]);
  
  // Handle image selection for training
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) return;
    
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );
    
    setTrainingData(prev => ({
      ...prev,
      images: [...prev.images, ...imageFiles]
    }));
  };
  
  // Remove an image from training set
  const removeImage = (index: number) => {
    setTrainingData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  // Start model training
  const startTraining = async () => {
    // Validate inputs
    if (trainingData.images.length === 0) {
      setTrainingData(prev => ({
        ...prev,
        status: 'error',
        message: 'Please upload training images first.'
      }));
      return;
    }
    
    if (!trainingData.className.trim()) {
      setTrainingData(prev => ({
        ...prev,
        status: 'error',
        message: 'Please enter a class name for the objects.'
      }));
      return;
    }
    
    try {
      // Update status
      setTrainingData(prev => ({
        ...prev,
        status: 'uploading',
        progress: 0,
        message: 'Preparing training data...'
      }));
      
      // Use the API service for training
      const result = await apiService.startTraining(
        modelEndpoint, 
        trainingData.className, 
        trainingData.images,
        undefined, // No labels file for this simple example
        (progress) => {
          // Update progress during upload
          setTrainingData(prev => ({
            ...prev,
            progress: progress,
            message: `Uploading: ${progress}% complete`
          }));
        }
      );
      
      // Check for errors
      if ('error' in result && result.error) {
        setTrainingData(prev => ({
          ...prev,
          status: 'error',
          message: result.error || 'An unknown error occurred'
        }));
        return;
      }
      
      const trainingId = result.trainingId;
      
      // If successful, update status to training
      setTrainingData(prev => ({
        ...prev,
        status: 'training',
        progress: 50,
        message: 'Training in progress...'
      }));
      
      // Poll training status
      const pollInterval = setInterval(async () => {
        try {
          const statusResult = await apiService.getTrainingStatus(trainingId);
          
          // Update training progress
          setTrainingData(prev => ({
            ...prev,
            progress: statusResult.progress,
            message: statusResult.message || 'Training in progress...'
          }));
          
          // If training is complete or failed
          if (statusResult.status === 'completed' || statusResult.status === 'failed' || statusResult.status === 'error') {
            clearInterval(pollInterval);
            
            setTrainingData(prev => ({
              ...prev,
              status: statusResult.status,
              message: statusResult.message || (statusResult.status === 'completed' ? 'Training completed successfully!' : 'Training failed.')
            }));
            
            // If training was successful, update custom models list
            if (statusResult.status === 'completed') {
              const models = await apiService.getCustomModels();
              setCustomModels(models);
            }
          }
        } catch (err) {
          console.error('Error polling training status:', err);
        }
      }, 1000); // Poll every second
      
      // Return cleanup function
      return () => clearInterval(pollInterval);
    } catch (err) {
      console.error('Error starting training:', err);
      
      setTrainingData(prev => ({
        ...prev,
        status: 'error',
        message: err instanceof Error ? err.message : 'Failed to start training.'
      }));
    }
  };
  
  // Handle webcam capture and object detection
  const handleCapture = async (imageSrc: string, detections?: Array<{
    bbox: [number, number, number, number];
    class: string;
    score: number;
  }>) => {
    // If detections are provided from the WebcamCapture, use them directly
    if (detections) {
      processDetections(imageSrc, detections);
      return;
    }
    
    // Otherwise, perform detection manually
    try {
      setLoading(true);
      
      // Create an image element from the imageSrc
      const img = new Image();
      img.src = imageSrc;
      
      // Wait for the image to load
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      // Load the model and perform detection
      const model = await cocoSsd.load();
      const detectionResults = await model.detect(img);
      
      // Process the results
      processDetections(imageSrc, detectionResults);
    } catch (err) {
      console.error('Error detecting objects:', err);
      setError('Failed to detect objects in the image');
      setDetectionData({
        imageSrc,
        detectedObjects: null
      });
      setResult({
        prediction: 'Error detecting objects',
        confidence: 0,
        probabilities: []
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to process detections
  const processDetections = (imageSrc: string, detections: Array<{
    bbox: [number, number, number, number];
    class: string;
    score: number;
  }>) => {
    // Update detection data
    setDetectionData({
      imageSrc,
      detectedObjects: detections || null
    });
    
    // Format the result for display
    if (detections && detections.length > 0) {
      const probabilities = detections.map(detection => ({
        class: detection.class,
        probability: detection.score
      }));
      
      const prediction: PredictionResult = {
        prediction: detections[0].class,
        probabilities,
        confidence: detections[0].score,
        metrics: {
          'Objects Detected': detections.length,
          'Top Confidence': `${(detections[0].score * 100).toFixed(1)}%`
        }
      };
      
      setResult(prediction);
    } else {
      setResult({
        prediction: 'No objects detected',
        confidence: 0,
        probabilities: []
      });
    }
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        
        {/* Tabs for switching between Train and Detect views */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setView('detect')}
              className={`${
                view === 'detect'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Detect Objects
            </button>
            <button
              onClick={() => setView('train')}
              className={`${
                view === 'train'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Train Model
            </button>
          </nav>
        </div>
      </div>
      
      {/* Detect View */}
      {view === 'detect' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-2">Capture Image</h4>
            
            {/* Model selection */}
            <div className="mb-4">
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                Select Model
              </label>
              <select
                id="model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 text-base text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="coco-ssd">COCO-SSD (General Objects)</option>
                {customModels.map(model => (
                  <option key={model.modelId} value={model.modelId}>
                    {model.name} ({model.classes.join(', ')})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Webcam capture component */}
            <WebcamCapture
              onCapture={handleCapture}
            />
          </div>
          
          {/* Results Section */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-2">Detection Results</h4>
            
            {/* Display captured image with detections */}
            {detectionData.imageSrc ? (
              <div className="mb-4">
                <div className="bg-white p-1 rounded-md border border-gray-200 mb-4">
                  <img
                    src={detectionData.imageSrc}
                    alt="Captured with detections"
                    className="w-full h-auto rounded"
                  />
                </div>
                
                {/* Display detection results */}
                <ResultDisplay
                  result={result}
                  isLoading={loading}
                  error={error}
                />
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-md border border-gray-200 text-center min-h-[300px] flex items-center justify-center">
                <p className="text-gray-500">Capture an image to detect objects</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Train View */}
      {view === 'train' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Training Form */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Train a Custom Model</h4>
            
            {/* Class name input */}
            <div className="mb-4">
              <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
                Object Class Name
              </label>
              <input
                type="text"
                id="className"
                value={trainingData.className}
                onChange={(e) => setTrainingData(prev => ({ ...prev, className: e.target.value }))}
                placeholder="e.g., coffee_mug, my_face, custom_object"
                className="w-full px-3 py-2 text-base text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter a class name for the object you want to detect
              </p>
            </div>
            
            {/* Image upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Training Images
              </label>
              
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H4m20-16l10-10v10m0 0h-10"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageUpload}
                        disabled={trainingData.status === 'uploading' || trainingData.status === 'training'}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                </div>
              </div>
            </div>
            
            {/* Training button */}
            <button
              onClick={startTraining}
              disabled={
                trainingData.status === 'uploading' || 
                trainingData.status === 'training' || 
                trainingData.images.length === 0 ||
                !trainingData.className.trim()
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 transition"
            >
              {trainingData.status === 'uploading' || trainingData.status === 'training' ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">
                    {trainingData.status === 'uploading' ? 'Uploading...' : 'Training...'}
                  </span>
                </div>
              ) : (
                'Start Training'
              )}
            </button>
            
            {/* Training status */}
            {(trainingData.status !== 'idle') && (
              <div className={`mt-4 p-4 rounded-md ${
                trainingData.status === 'error' ? 'bg-red-50 border border-red-200' :
                trainingData.status === 'completed' ? 'bg-green-50 border border-green-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {trainingData.status === 'error' ? (
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    ) : trainingData.status === 'completed' ? (
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      trainingData.status === 'error' ? 'text-red-800' : 
                      trainingData.status === 'completed' ? 'text-green-800' : 
                      'text-blue-800'
                    }`}>
                      {trainingData.status === 'uploading' ? 'Uploading' :
                       trainingData.status === 'training' ? 'Training in Progress' :
                       trainingData.status === 'completed' ? 'Training Complete' :
                       trainingData.status === 'error' ? 'Training Error' : 'Status'}
                    </h3>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>{trainingData.message}</p>
                    </div>
                    
                    {/* Progress bar */}
                    {(trainingData.status === 'uploading' || trainingData.status === 'training') && (
                      <div className="mt-2">
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                            <div 
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                              style={{ width: `${trainingData.progress}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div>
                              <span className="text-xs font-semibold inline-block text-blue-600">
                                {trainingData.progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Training Data Preview */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Training Images
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({trainingData.images.length} images)
              </span>
            </h4>
            
            {trainingData.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto p-2">
                {trainingData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Training item ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md border border-gray-200"
                    />
                    {trainingData.status !== 'uploading' && trainingData.status !== 'training' && (
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-md border border-gray-200 text-center min-h-[300px] flex items-center justify-center">
                <p className="text-gray-500">Upload images to start training</p>
              </div>
            )}
            
            <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="text-sm font-semibold text-gray-900">About Training</h4>
              <p className="text-xs text-gray-600 mt-1">
                To train a custom object detection model, you need to provide multiple images of the object 
                from different angles and in different environments. The more diverse your training data, 
                the better your model will perform in real-world scenarios.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomObjectDetectionForm; 