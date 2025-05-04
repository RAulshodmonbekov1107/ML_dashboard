import React, { useRef, useState, useEffect } from 'react';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string, imageBlob: Blob) => void;
  onError?: (error: string) => void;
  width?: number;
  height?: number;
  autoCapture?: boolean;
  captureInterval?: number;
  facingMode?: 'user' | 'environment';
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({
  onCapture,
  onError,
  width = 640,
  height = 480,
  autoCapture = false,
  captureInterval = 1000,
  facingMode = 'user'
}) => {
  // Basic refs and state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  
  // Simple state management
  const [isActive, setIsActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(autoCapture);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize camera on component mount
  useEffect(() => {
    // Auto-start if requested
    if (autoCapture) {
      startCamera();
    }
    
    // Clean up on unmount
    return () => {
      stopCamera();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Start the camera
  const startCamera = async () => {
    try {
      // Clean up existing camera if any
      stopCamera();
      
      // Reset error state
      setError(null);
      
      // Request camera access with simple constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: width },
          height: { ideal: height },
          facingMode
        }
      });
      
      // Store stream reference
      streamRef.current = stream;
      
      // Connect to video element if available
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for metadata to load before playing to avoid interruptions
        const playVideo = async () => {
          try {
            // Add event listener for loadedmetadata to safely play
            await new Promise<void>((resolve) => {
              if (!videoRef.current) return;
              
              const handleLoadedMetadata = () => {
                videoRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
                resolve();
              };
              
              // If metadata is already loaded, resolve immediately
              if (videoRef.current.readyState >= 1) {
                resolve();
              } else {
                videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
              }
            });
            
            // Now safely play the video
            if (videoRef.current) {
              await videoRef.current.play();
            }
            
            setIsActive(true);
            
            // Start capture if autoCapture is enabled
            if (autoCapture) {
              startCapture();
            }
          } catch (err) {
            console.error('Error playing video:', err);
          }
        };
        
        playVideo();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Camera access failed';
      setError(message);
      if (onError) onError(message);
      console.error("Camera error:", err);
    }
  };
  
  // Stop the camera
  const stopCamera = () => {
    // Stop capturing
    stopCapture();
    
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Reset video element
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }
    
    setIsActive(false);
  };
  
  // Start capturing frames
  const startCapture = () => {
    if (!isActive) return;
    
    setIsCapturing(true);
    
    // Clear any existing timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    
    // Start interval timer
    timerRef.current = window.setInterval(() => {
      captureFrame();
    }, captureInterval);
  };
  
  // Stop capturing frames
  const stopCapture = () => {
    setIsCapturing(false);
    
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  // Capture a single frame
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (!isActive) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Skip if video isn't ready yet
    if (video.readyState !== 4) return;
    
    // Get canvas context
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);
    
    // Get image data in two formats
    try {
      // Get data URL
      const imageSrc = canvas.toDataURL('image/jpeg');
      
      // Get blob
      canvas.toBlob((blob) => {
        if (blob) {
          onCapture(imageSrc, blob);
        }
      }, 'image/jpeg');
    } catch (err) {
      console.error("Error capturing frame:", err);
    }
  };
  
  // Toggle camera on/off
  const toggleCamera = () => {
    if (isActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };
  
  // Toggle capture on/off
  const toggleCapture = () => {
    if (!isActive) {
      // Start camera first if it's not active
      startCamera();
      return;
    }
    
    if (isCapturing) {
      stopCapture();
    } else {
      startCapture();
    }
  };
  
  // Create canvas if it doesn't exist
  if (!canvasRef.current) {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current?.videoWidth || width;
    canvas.height = videoRef.current?.videoHeight || height;
    canvasRef.current = canvas;
    
    // Append it to a container element for debugging if needed
    const container = document.getElementById('canvas-container');
    if (container) {
      canvas.style.display = 'block';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.zIndex = '20';
      canvas.style.pointerEvents = 'none';
      container.appendChild(canvas);
    }
  }
  
  return (
    <div className="webcam-container">
      {/* Camera display */}
      <div 
        className={`relative border-2 rounded-lg overflow-hidden ${
          isActive ? 'border-green-500' : 'border-gray-300'
        }`}
        style={{ width: `${width}px`, height: `${height}px`, background: 'black' }}
      >
        {/* Video element */}
        <video
          ref={videoRef}
          width={width}
          height={height}
          autoPlay
          playsInline
          muted
          className="max-w-full h-auto"
        />
        
        {/* Status overlay */}
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
            <div className="text-white text-center p-4">
              <p className="mb-2">Camera is off</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-green-600 text-white rounded-md"
              >
                Start Camera
              </button>
            </div>
          </div>
        )}
        
        {/* Status indicators */}
        <div className="absolute top-2 right-2 flex space-x-2">
          {isActive && (
            <div className="bg-green-500 text-white px-2 py-1 text-xs rounded-md">
              Camera On
            </div>
          )}
          {isCapturing && (
            <div className="bg-blue-500 text-white px-2 py-1 text-xs rounded-md animate-pulse">
              Capturing
            </div>
          )}
        </div>
        
        {/* Frame capture indicator */}
        {isCapturing && (
          <div className="absolute inset-0 border-2 border-blue-400 rounded-lg border-opacity-50"></div>
        )}
      </div>
      
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Controls */}
      <div className="mt-4 flex space-x-4">
        <button
          onClick={toggleCamera}
          className={`px-4 py-2 ${isActive ? 'bg-red-500' : 'bg-green-500'} text-white rounded-md`}
        >
          {isActive ? 'Stop Camera' : 'Start Camera'}
        </button>
        
        <button
          onClick={toggleCapture}
          disabled={!isActive}
          className={`px-4 py-2 ${isCapturing ? 'bg-red-500' : 'bg-blue-500'} text-white rounded-md disabled:opacity-50`}
        >
          {isCapturing ? 'Stop Capture' : 'Start Capture'}
        </button>
        
        <button
          onClick={captureFrame}
          disabled={!isActive}
          className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50"
        >
          Capture Frame
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
          <p className="font-medium">Camera Error:</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 px-2 py-1 bg-red-200 hover:bg-red-300 text-red-800 rounded text-xs"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture; 