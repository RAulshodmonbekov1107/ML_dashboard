import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string, detections?: Array<{
    bbox: [number, number, number, number],
    class: string,
    score: number
  }>) => void;
  width?: number;
  height?: number;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({
  onCapture,
  width = 640,
  height = 480
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize webcam when component mounts
  useEffect(() => {
    startCamera();
    
    // Cleanup function
    return () => {
      stopCamera();
    };
  }, []);
  
  // Initialize webcam
  const startCamera = async () => {
    setCameraActive(false);
    setError(null);
    
    try {
      const constraints = {
        video: {
          width: { ideal: width },
          height: { ideal: height },
          facingMode: 'environment' // Use back camera if available
        }
      };
      
      // Get user media stream
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Set the stream as the video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraActive(true);
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access the camera. Please ensure camera permissions are granted and try again.');
    }
  };
  
  // Stop the camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };
  
  // Capture frame from video stream
  const captureFrame = async () => {
    if (!cameraActive) {
      setError('Camera is not active. Please start the camera first.');
      return;
    }
    
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera not ready. Please try again.');
      return;
    }
    
    setIsCapturing(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        setError('Could not get canvas context. Please try again.');
        setIsCapturing(false);
        return;
      }
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame onto the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data as a base64 string
      const imageSrc = canvas.toDataURL('image/jpeg');
      
      // Pass the image to parent component
      onCapture(imageSrc);
    } catch (err) {
      console.error('Error capturing frame:', err);
      setError('Error processing image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };
  
  return (
    <div className="webcam-container">
      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="relative">
        {/* Video feed from webcam */}
        <video 
          ref={videoRef} 
          className={`rounded-lg shadow-md ${!cameraActive ? 'hidden' : ''}`}
          width={width} 
          height={height} 
          muted 
          playsInline
        />
        
        {/* Canvas for capturing frames */}
        <canvas 
          ref={canvasRef} 
          className="hidden"
          width={width} 
          height={height}
        />
        
        {/* Placeholder when camera is inactive */}
        {!cameraActive && (
          <div 
            className="bg-gray-200 rounded-lg flex items-center justify-center"
            style={{ width, height }}
          >
            <div className="text-center p-4">
              <svg 
                className="w-16 h-16 text-gray-400 mx-auto mb-2"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
              <p className="text-gray-500">Camera is not available or permission denied</p>
            </div>
          </div>
        )}
        
        {/* Capture button */}
        {cameraActive && (
          <motion.button
            onClick={captureFrame}
            disabled={isCapturing}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-indigo-600 rounded-full p-3 shadow-lg border border-indigo-100"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="rounded-full w-12 h-12 flex items-center justify-center border-2 border-indigo-600">
              <div className="rounded-full w-10 h-10 bg-indigo-600"></div>
            </div>
          </motion.button>
        )}
        
        {/* Loading overlay */}
        {isCapturing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-white">
              <svg className="animate-spin h-8 w-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p>Capturing...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture; 