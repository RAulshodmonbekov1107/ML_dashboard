import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../ui/LoadingSpinner';
import WebcamCapture from '../WebcamCapture';
import axios from 'axios';

interface EnhancedNeuralNetworkModelFormProps {
  modelEndpoint: string;
  title: string;
  description: string;
}

interface DetectionResult {
  class: string;
  probability: number;
}

const EnhancedNeuralNetworkModelForm: React.FC<EnhancedNeuralNetworkModelFormProps> = ({
  modelEndpoint,
}) => {
  // State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<DetectionResult[] | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // Handle image upload from file
  const handleImageUpload = (file: File) => {
    setSelectedImage(file);
    const imageUrl = URL.createObjectURL(file);
    setPreviewUrl(imageUrl);
    
    // Reset results when new image is selected
    setResults(null);
    setError(null);
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleImageUpload(file);
    }
  };
  
  // Handle webcam capture
  const handleWebcamCapture = (
    imageSrc: string,
    detections?: Array<{
      bbox: [number, number, number, number];
      class: string;
      score: number;
    }>
  ) => {
    // Convert the base64 image to a blob
    const fetchImage = async () => {
      try {
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        const file = new File([blob], "webcam-capture.jpg", { type: "image/jpeg" });
        
        setSelectedImage(file);
        setPreviewUrl(imageSrc);
        setIsCameraActive(true);
        
        // Reset results
        setResults(null);
        setError(null);
      } catch (err) {
        console.error("Error processing webcam image:", err);
        setError("Failed to process webcam image");
      }
    };
    
    fetchImage();
  };
  
  // Toggle camera
  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive);
    
    if (isCameraActive) {
      // If turning off camera, keep the current image
    } else {
      // If turning on camera, reset selected image
      setSelectedImage(null);
      setPreviewUrl(null);
      setResults(null);
    }
  };
  
  // Convert image to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  // Submit image for analysis using Clarifai API
  const analyzeImage = async () => {
    if (!selectedImage && !previewUrl) {
      setError("Please select an image or use the camera");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Using Clarifai's general image recognition model
      // Note: In a production app, you should store API keys securely on a backend
      const CLARIFAI_API_KEY = process.env.REACT_APP_CLARIFAI_API_KEY || '8f826d55c76b4f0692071fb883b87e56'; // User's verified personal access token
      // Using the general prediction model ID that is known to work
      const MODEL_ID = 'general-image-recognition'; // Match the URL in debug script
      const USER_ID = 'clarifai';
      const APP_ID = 'main'; // Clarifai requires app_id for newer API versions
      
      console.log('Sending API request to Clarifai with the following details:');
      console.log('API_KEY:', CLARIFAI_API_KEY ? `${CLARIFAI_API_KEY.substring(0, 5)}...` : 'Not set');
      console.log('MODEL_ID:', MODEL_ID);
      console.log('USER_ID:', USER_ID);
      console.log('APP_ID:', APP_ID);
      
      let requestData = {
        "user_app_id": {
          "user_id": USER_ID,
          "app_id": APP_ID
        },
        "inputs": [
          {
            "data": {
              "image": {}
            }
          }
        ]
      };
      
      // If we have a selected image file, convert it to base64
      if (selectedImage) {
        const base64Image = await convertToBase64(selectedImage);
        const base64Content = base64Image.split(',')[1]; // Remove the data URL prefix
        
        console.log('Image converted to base64, size:', Math.round((base64Content.length * 3/4) / 1024), 'KB');
        
        // Use base64 image data
        requestData.inputs[0].data.image = { "base64": base64Content };
      } 
      // Otherwise, if we have a preview URL from a sample image, use the URL directly
      else if (previewUrl && previewUrl.startsWith('http')) {
        console.log('Using image URL:', previewUrl);
        requestData.inputs[0].data.image = { "url": previewUrl };
      }
      // If neither is available (shouldn't happen due to earlier check)
      else {
        throw new Error("No image data available");
      }
      
      console.log('Using proxy server to avoid CORS issues');
      
      // Use local proxy server instead of direct API call
      const response = await axios({
        method: 'POST',
        url: 'http://localhost:3001/api/clarifai',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          apiKey: CLARIFAI_API_KEY,
          modelId: MODEL_ID,
          data: requestData
        }
      });
      
      console.log('Response received from proxy server');
      
      // Process the response
      if (response.data && response.data.outputs && response.data.outputs.length > 0) {
        const concepts = response.data.outputs[0].data.concepts;
        
        // Convert to our detection result format
        const detectionResults: DetectionResult[] = concepts
          .filter((concept: any) => concept.value > 0.5) // Filter to concepts with > 50% confidence
          .map((concept: any) => ({
            class: concept.name,
            probability: concept.value
          }))
          .slice(0, 10); // Get top 10 results
        
        setResults(detectionResults);
        
        console.log("Successfully processed image. Top result:", 
          detectionResults.length > 0 ? 
          `${detectionResults[0].class} (${Math.round(detectionResults[0].probability * 100)}%)` : 
          "No results above threshold");
      } else {
        console.error("Unexpected API response format:", response.data);
        setError("Failed to analyze image: The API returned an unexpected response format.");
      }
    } catch (err: any) {
      console.error("Error analyzing image:", err);
      
      // Log more detailed error information
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
        
        // Extract specific error messages from Clarifai response
        if (err.response.data && err.response.data.status) {
          const statusCode = err.response.data.status.code;
          const statusDesc = err.response.data.status.description;
          const statusDetails = err.response.data.status.details;
          
          console.error("API Error Code:", statusCode);
          console.error("API Error Description:", statusDesc);
          console.error("API Error Details:", statusDetails);
          
          // Set more specific error message for user
          setError(`Failed to analyze image: ${statusDesc || 'Unknown error'}`);
        } else {
          setError(`Failed to analyze image. HTTP status: ${err.response.status}`);
        }
      } else if (err.request) {
        console.error("No response received from server");
        setError("Failed to analyze image. No response from server. Check your internet connection.");
      } else {
        console.error("Error message:", err.message);
        setError(`Failed to analyze image: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Analyze a sample image from Clarifai
  const analyzeSampleImage = async () => {
    setLoading(true);
    setError(null);
    setSelectedImage(null); // Clear selected image since we're using a URL
    
    try {
      // Using Clarifai's general image recognition model
      const CLARIFAI_API_KEY = process.env.REACT_APP_CLARIFAI_API_KEY || '8f826d55c76b4f0692071fb883b87e56'; 
      const MODEL_ID = 'general-image-recognition';
      const USER_ID = 'clarifai';
      const APP_ID = 'main';
      
      console.log('Testing with sample image from Clarifai...');
      
      // Use Clarifai's sample image
      const sampleImageUrl = 'https://samples.clarifai.com/dog2.jpeg';
      
      // Set the preview image
      setPreviewUrl(sampleImageUrl);
      
      const requestData = {
        "user_app_id": {
          "user_id": USER_ID,
          "app_id": APP_ID
        },
        "inputs": [
          {
            "data": {
              "image": {
                "url": sampleImageUrl
              }
            }
          }
        ]
      };
      
      console.log('Using proxy server to avoid CORS issues');
      
      // Use local proxy server instead of direct API call
      const response = await axios({
        method: 'POST',
        url: 'http://localhost:3001/api/clarifai',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          apiKey: CLARIFAI_API_KEY,
          modelId: MODEL_ID,
          data: requestData
        }
      });
      
      console.log('Response received from proxy server');
      
      // Process the response
      if (response.data && response.data.outputs && response.data.outputs.length > 0) {
        const concepts = response.data.outputs[0].data.concepts;
        
        // Convert to our detection result format
        const detectionResults: DetectionResult[] = concepts
          .filter((concept: any) => concept.value > 0.5) // Filter to concepts with > 50% confidence
          .map((concept: any) => ({
            class: concept.name,
            probability: concept.value
          }))
          .slice(0, 10); // Get top 10 results
        
        setResults(detectionResults);
        
        console.log("Successfully processed sample image.");
      } else {
        console.error("Unexpected API response format for sample image:", response.data);
        setError("Failed to analyze sample image: The API returned an unexpected response format.");
      }
    } catch (err: any) {
      console.error("Error analyzing sample image:", err);
      
      // Log more detailed error information
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
        
        // Extract specific error messages from Clarifai response
        if (err.response.data && err.response.data.status) {
          const statusCode = err.response.data.status.code;
          const statusDesc = err.response.data.status.description;
          
          console.error("API Error Code:", statusCode);
          console.error("API Error Description:", statusDesc);
          
          setError(`Failed to analyze sample image: ${statusDesc || 'Unknown error'}`);
        } else {
          setError(`Failed to analyze sample image. HTTP status: ${err.response.status}`);
        }
      } else if (err.request) {
        console.error("No response received from server");
        setError("Failed to analyze sample image. No response from server.");
      } else {
        console.error("Error message:", err.message);
        setError(`Failed to analyze sample image: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Trigger file select dialog
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
        <motion.div 
          className="p-6 bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-md border border-indigo-100 mb-6"
          variants={itemVariants}
        >
          <h3 className="text-xl font-semibold text-indigo-800 mb-4">Image Input Options</h3>
          
          <div className="space-y-6">
            {/* Upload Option */}
            <motion.div 
              className="bg-white p-5 rounded-lg border border-indigo-200 hover:border-indigo-400 transition-all duration-200 nn-card"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <h4 className="text-lg font-medium text-indigo-700 mb-3">Upload Image</h4>
              <p className="text-gray-600 mb-4 text-sm">
                Upload an image file to analyze its contents
              </p>
              
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                <motion.button
                  type="button"
                  onClick={openFileSelector}
                  className="w-full flex justify-center items-center px-4 py-3 border-2 border-dashed border-indigo-300 rounded-lg text-indigo-700 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>Select image file</span>
                </motion.button>
              </div>
            </motion.div>
            
            {/* Test with Sample Image Button */}
            <motion.div 
              className="bg-white p-5 rounded-lg border border-indigo-200 hover:border-indigo-400 transition-all duration-200 nn-card"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <h4 className="text-lg font-medium text-indigo-700 mb-3">Test with Sample Image</h4>
              <p className="text-gray-600 mb-4 text-sm">
                Test the API with a pre-configured sample image
              </p>
              
              <motion.button
                type="button"
                onClick={analyzeSampleImage}
                className="w-full py-3 px-4 rounded-md font-medium bg-green-500 hover:bg-green-600 text-white transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Use Sample Image'}
              </motion.button>
            </motion.div>
            
            {/* Camera Option */}
            <motion.div 
              className="bg-white p-5 rounded-lg border border-indigo-200 hover:border-indigo-400 transition-all duration-200 nn-card"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <h4 className="text-lg font-medium text-indigo-700 mb-3">Use Camera</h4>
              <p className="text-gray-600 mb-4 text-sm">
                Capture an image with your camera
              </p>
              
              <motion.button
                type="button"
                onClick={toggleCamera}
                className={`w-full py-3 px-4 rounded-md font-medium transition-all duration-300 ${
                  isCameraActive
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isCameraActive ? 'Disable Camera' : 'Enable Camera'}
              </motion.button>
              
              {isCameraActive && (
                <div className="mt-4 border border-indigo-200 rounded-lg overflow-hidden">
                  <WebcamCapture onCapture={handleWebcamCapture} />
                </div>
              )}
            </motion.div>
          </div>
          
          {/* Analyze Button */}
          <motion.button
            onClick={analyzeImage}
            disabled={loading || (!selectedImage && !previewUrl)}
            className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-md disabled:opacity-50 transition duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            variants={itemVariants}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" color="white" />
                <span className="ml-2">Analyzing Image...</span>
              </div>
            ) : (
              'Analyze Image'
            )}
          </motion.button>
        </motion.div>
        
        <motion.div 
          className="bg-indigo-50 p-5 rounded-lg border border-indigo-100"
          variants={itemVariants}
        >
          <h4 className="text-sm font-bold text-indigo-800 mb-2">About Neural Networks for Image Recognition</h4>
          <p className="text-sm text-gray-700">
            Convolutional Neural Networks (CNNs) excel at analyzing visual imagery by processing pixel data 
            through multiple specialized layers. They can identify objects, faces, scenes, and more with 
            remarkable accuracy. Our model is powered by Clarifai's image recognition technology that can 
            recognize thousands of everyday objects.
          </p>
        </motion.div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <motion.h3 
          className="text-xl font-semibold text-indigo-800 mb-4"
          variants={itemVariants}
        >
          Image Analysis Results
        </motion.h3>
        
        <motion.div 
          className="bg-white rounded-lg shadow-md border border-indigo-100 p-6 min-h-[400px] transition-all duration-300 nn-card"
          variants={resultVariants}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <LoadingSpinner size="lg" color="blue" />
              <span className="mt-4 text-indigo-600">
                Analyzing image...
              </span>
              <div className="neural-network mt-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="neuron" />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 bg-red-50 rounded-md">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          ) : previewUrl ? (
            <div className="space-y-4">
              <h4 className="font-semibold text-indigo-800">Image Preview:</h4>
              <div className="relative border border-indigo-100 rounded-lg overflow-hidden">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-auto object-contain max-h-[200px]" 
                />
              </div>
              
              {results && (
                <div className="mt-6">
                  <h4 className="font-semibold text-indigo-800 mb-2">Detected Objects:</h4>
                  <div className="space-y-2">
                    {results.map((item, index) => (
                      <div key={index} className="bg-indigo-50 p-3 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-indigo-900">{item.class}</span>
                          <span className="text-indigo-600 font-medium">{Math.round(item.probability * 100)}%</span>
                        </div>
                        <div className="mt-1 w-full bg-indigo-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500" 
                            style={{ width: `${item.probability * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 h-full flex flex-col items-center justify-center">
              <svg className="w-16 h-16 text-indigo-200 mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
              </svg>
              <p className="text-center">Upload an image or use your camera to analyze its contents</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedNeuralNetworkModelForm; 