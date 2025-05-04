import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { PredictionResult } from '../../services/apiService';

interface ResultDisplayProps {
  result: PredictionResult | null;
  isLoading: boolean;
  error: string | null;
  className?: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  result, 
  isLoading, 
  error,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`bg-white p-6 rounded-md border border-gray-200 text-center ${className}`}>
        <div className="flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" color="blue" />
          <p className="mt-4 text-gray-600">Processing your request...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white p-6 rounded-md border border-red-200 ${className}`}>
        <h4 className="text-red-600 font-medium mb-2">Error</h4>
        <p className="text-gray-700">{error}</p>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">None</span>;
    }
    
    if (typeof value === 'boolean') {
      return value ? 'True' : 'False';
    }
    
    if (typeof value === 'number') {
      // Check if it's a probability
      if (value >= 0 && value <= 1) {
        return `${(value * 100).toFixed(2)}%`;
      }
      // Round to 4 decimal places for other numbers
      return Math.abs(value) < 0.0001 ? value.toExponential(2) : value.toFixed(4);
    }
    
    if (typeof value === 'string') {
      // Check if it's a URL
      if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/media/')) {
        if (value.match(/\.(jpeg|jpg|gif|png)$/)) {
          return <img src={value} alt="Result" className="max-w-full h-auto rounded-md" />;
        }
        return (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {value}
          </a>
        );
      }
      
      // For longer text, use pre-wrap
      if (value.length > 100) {
        return <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded-md overflow-auto max-h-60">{value}</pre>;
      }
      
      return value;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-400">Empty array</span>;
      }
      
      return (
        <ul className="list-disc pl-5 space-y-1">
          {value.map((item, idx) => (
            <li key={idx}>{renderValue(item)}</li>
          ))}
        </ul>
      );
    }
    
    if (typeof value === 'object') {
      return (
        <div className="bg-gray-50 p-3 rounded-md">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="mb-2">
              <span className="font-medium">{key}: </span>
              {renderValue(val)}
            </div>
          ))}
        </div>
      );
    }
    
    return String(value);
  };

  // Format and display the prediction result
  return (
    <div className={`bg-white p-6 rounded-md border border-gray-200 ${className}`}>
      {/* Single prediction display */}
      {(result.prediction !== undefined || result.predicted_class !== undefined) && (
        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {result.predicted_class !== undefined ? 'Predicted Class' : 'Prediction'}
          </h4>
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100 text-blue-800 font-medium">
            {renderValue(result.predicted_class !== undefined ? result.predicted_class : result.prediction)}
          </div>
        </div>
      )}
      
      {/* Generated text for text generation models */}
      {result.generated_text && (
        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-900 mb-2">Generated Text</h4>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            {renderValue(result.generated_text)}
          </div>
        </div>
      )}
      
      {/* Transcription for speech models */}
      {result.transcription && (
        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-900 mb-2">Transcription</h4>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            {renderValue(result.transcription)}
          </div>
        </div>
      )}
      
      {/* Multiple predictions from CSV */}
      {result.predicted_values && Array.isArray(result.predicted_values) && (
        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Predictions
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({result.predicted_values.length} values)
            </span>
          </h4>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-60 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Index</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {result.predicted_values.slice(0, 10).map((value, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{renderValue(value)}</td>
                  </tr>
                ))}
                {result.predicted_values.length > 10 && (
                  <tr>
                    <td colSpan={2} className="px-3 py-2 text-center text-sm text-gray-500">
                      ... {result.predicted_values.length - 10} more rows not shown
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Probabilities for classification */}
      {(result.probabilities || result.class_probabilities) && (
        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-900 mb-2">Class Probabilities</h4>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.isArray(result.probabilities) && result.probabilities.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900">
                      {item.class || item.label}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                      {renderValue(item.probability || item.confidence)}
                    </td>
                  </tr>
                ))}
                {Array.isArray(result.class_probabilities) && result.class_probabilities.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900">
                      {item.class || item.label}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                      {renderValue(item.probability || item.confidence)}
                    </td>
                  </tr>
                ))}
                {!Array.isArray(result.probabilities) && typeof result.probabilities === 'object' && result.probabilities && 
                  Object.entries(result.probabilities).map(([className, probability], idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900">
                        {className}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                        {renderValue(probability)}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Additional metrics or information */}
      {result.metrics && (
        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-900 mb-2">Metrics</h4>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(result.metrics).map(([key, value]) => (
                <div key={key} className="flex flex-col p-3 bg-white border border-gray-100 rounded-md shadow-sm">
                  <span className="text-xs text-gray-500 uppercase">{key}</span>
                  <span className="text-lg font-medium">{renderValue(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Display any other fields */}
      {Object.entries(result)
        .filter(([key]) => !['prediction', 'predicted_class', 'predicted_values', 
                              'probabilities', 'class_probabilities', 'metrics',
                              'generated_text', 'transcription'].includes(key))
        .map(([key, value]) => (
          <div key={key} className="mb-4">
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </h4>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              {renderValue(value)}
            </div>
          </div>
        ))}
    </div>
  );
};

export default ResultDisplay; 