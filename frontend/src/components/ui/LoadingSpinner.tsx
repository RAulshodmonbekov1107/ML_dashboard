import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'white' | 'gray';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  text,
  className = ''
}) => {
  // Get size in pixels
  const sizeInPx = size === 'sm' ? 16 : size === 'md' ? 24 : 32;
  
  // Get color classes
  const colorClass = 
    color === 'blue' ? 'text-blue-600' : 
    color === 'white' ? 'text-white' : 'text-gray-500';
  
  return (
    <div className={`flex items-center ${className}`}>
      <svg 
        className={`animate-spin ${colorClass}`} 
        width={sizeInPx} 
        height={sizeInPx} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <span className={`ml-3 ${colorClass}`}>{text}</span>
      )}
    </div>
  );
};

export default LoadingSpinner; 