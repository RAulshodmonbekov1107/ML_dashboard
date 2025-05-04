import React, { useState, useRef } from 'react';
import apiService, { PredictionResult } from '../../services/apiService';
import LoadingSpinner from '../ui/LoadingSpinner';

interface PhishingResult extends PredictionResult {
  is_phishing: boolean;
  confidence: number;
  risk_factors?: string[];
  safe_indicators?: string[];
}

const URLFeatureExtractor = {
  // Extract features from URL for frontend display
  extractFeatures: (url: string) => {
    const features = {
      length: url.length,
      hasAtSymbol: url.includes('@'),
      hasIPAddress: /\d+\.\d+\.\d+\.\d+/.test(url),
      subdomainCount: (url.match(/\./g) || []).length,
      hasHttps: url.startsWith('https://'),
      hasSuspiciousKeywords: /free|login|verify|account|update|secure/.test(url.toLowerCase()),
      specialCharCount: (url.match(/[^a-zA-Z0-9.]/g) || []).length
    };
    return features;
  }
};

const PhishingDetectionForm: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [result, setResult] = useState<PhishingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<{url: string, isPhishing: boolean, timestamp: number}[]>([]);
  const [features, setFeatures] = useState<any>(null);
  
  const urlInputRef = useRef<HTMLInputElement>(null);
  
  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setResult(null);
    setError(null);
  };
  
  // Check if URL is valid format
  const isValidUrl = (urlString: string): boolean => {
    try {
      // Basic URL validation
      return Boolean(urlString) && 
        (urlString.startsWith('http://') || 
         urlString.startsWith('https://') || 
         urlString.startsWith('www.'));
    } catch (e) {
      return false;
    }
  };
  
  // Submit URL for analysis
  const handleCheckUrl = async () => {
    if (!url) {
      setError('Please enter a URL to check');
      urlInputRef.current?.focus();
      return;
    }
    
    // Simple validation
    if (!isValidUrl(url)) {
      setError('Please enter a valid URL (starting with http://, https://, or www.)');
      return;
    }
    
    setIsChecking(true);
    setError(null);
    
    try {
      // Extract features for display
      const extractedFeatures = URLFeatureExtractor.extractFeatures(url);
      setFeatures(extractedFeatures);
      
      // In a real app, we would send the URL to backend for analysis
      // For demo, we'll use the XGBoost endpoint with the URL features
      const requestData = {
        url: url,
        url_length: extractedFeatures.length,
        has_at_symbol: extractedFeatures.hasAtSymbol ? 1 : 0,
        has_ip_address: extractedFeatures.hasIPAddress ? 1 : 0,
        subdomain_count: extractedFeatures.subdomainCount,
        has_https: extractedFeatures.hasHttps ? 1 : 0,
        has_suspicious_keywords: extractedFeatures.hasSuspiciousKeywords ? 1 : 0,
        special_char_count: extractedFeatures.specialCharCount
      };
      
      // Call API
      const response = await apiService.makePrediction<PhishingResult>('xgboost', requestData);
      
      if ('error' in response && response.error) {
        setError(response.error);
      } else {
        setResult(response);
        
        // Add to recent scans
        setRecentScans(prev => [{
          url: url,
          isPhishing: response.is_phishing || false,
          timestamp: Date.now()
        }, ...prev].slice(0, 5)); // Keep last 5 scans
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Error checking URL: ${errorMessage}`);
    } finally {
      setIsChecking(false);
    }
  };
  
  // Report false detection
  const handleReportFalseDetection = () => {
    if (!result) return;
    
    // In a real app, this would send a report to the backend
    alert(`Thank you for your feedback. This URL has been reported as a ${result.is_phishing ? 'safe' : 'phishing'} URL.`);
  };
  
  // Handle demo URL click
  const handleDemoUrlClick = (demoUrl: string) => {
    setUrl(demoUrl);
    setResult(null);
    setError(null);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Phishing URL Detection</h2>
        <p className="text-gray-600 mb-6">
          Enter any URL to check if it's a potential phishing site. Our machine learning model will analyze the URL and provide a risk assessment.
        </p>
        
        {/* URL Input */}
        <div className="mb-6">
          <div className="flex">
            <input
              ref={urlInputRef}
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="Enter URL (e.g., https://example.com)"
              className="flex-grow px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleCheckUrl()}
            />
            <button
              onClick={handleCheckUrl}
              disabled={isChecking}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-r-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isChecking ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Checking...</span>
                </div>
              ) : 'Check URL'}
            </button>
          </div>
          {error && (
            <div className="mt-2 text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>
        
        {/* Demo URLs */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Example URLs to try:</p>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => handleDemoUrlClick('https://google.com')}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded"
            >
              google.com (safe)
            </button>
            <button 
              onClick={() => handleDemoUrlClick('http://amaz0n-secure-login.com.tj')}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded"
            >
              fake-amazon.com (phishing)
            </button>
            <button 
              onClick={() => handleDemoUrlClick('https://paypa1.secure-login.com/verification')}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded"
            >
              paypal-lookalike.com (phishing)
            </button>
          </div>
        </div>
      </div>
      
      {/* Results Section */}
      {result && (
        <div className={`mb-8 p-6 rounded-lg shadow-md animate-fadeDown ${
          result.is_phishing 
            ? 'bg-red-50 border border-red-200' 
            : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-start mb-4">
            <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full ${
              result.is_phishing ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'
            }`}>
              <span className="text-2xl">
                {result.is_phishing ? '⚠️' : '✅'}
              </span>
            </div>
            <div className="ml-4">
              <h3 className={`text-xl font-bold ${
                result.is_phishing ? 'text-red-700' : 'text-green-700'
              }`}>
                {result.is_phishing ? 'Phishing Detected' : 'Safe URL'}
              </h3>
              <p className="text-gray-600 mt-1">
                {result.is_phishing 
                  ? 'This URL shows characteristics commonly associated with phishing attempts.' 
                  : 'This URL appears to be legitimate based on our analysis.'}
              </p>
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-700">Confidence: </span>
                <span className="text-sm">{Math.round(result.confidence * 100)}%</span>
              </div>
            </div>
          </div>
          
          {/* URL Analysis */}
          {features && (
            <div className="mt-4 p-4 bg-white rounded border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">URL Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">URL Length:</span>
                  <span className={features.length > 75 ? 'text-red-600 font-medium' : 'text-gray-800'}>
                    {features.length} characters {features.length > 75 ? '(suspicious)' : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Has @ Symbol:</span>
                  <span className={features.hasAtSymbol ? 'text-red-600 font-medium' : 'text-gray-800'}>
                    {features.hasAtSymbol ? 'Yes (suspicious)' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Has IP Address:</span>
                  <span className={features.hasIPAddress ? 'text-red-600 font-medium' : 'text-gray-800'}>
                    {features.hasIPAddress ? 'Yes (suspicious)' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subdomain Count:</span>
                  <span className={features.subdomainCount > 3 ? 'text-red-600 font-medium' : 'text-gray-800'}>
                    {features.subdomainCount} {features.subdomainCount > 3 ? '(suspicious)' : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">HTTPS Protocol:</span>
                  <span className={!features.hasHttps ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                    {features.hasHttps ? 'Yes (secure)' : 'No (not secure)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Suspicious Keywords:</span>
                  <span className={features.hasSuspiciousKeywords ? 'text-red-600 font-medium' : 'text-gray-800'}>
                    {features.hasSuspiciousKeywords ? 'Yes (suspicious)' : 'None detected'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Report False Detection */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleReportFalseDetection}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Report {result.is_phishing ? 'false positive' : 'false negative'}
            </button>
          </div>
        </div>
      )}
      
      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 animate-fade-in">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Scans</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentScans.map((scan, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">
                      <span className="truncate block max-w-xs">{scan.url}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        scan.isPhishing 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {scan.isPhishing ? 'Phishing' : 'Safe'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(scan.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 mt-8 animate-fade-in">
        <h3 className="text-md font-medium text-gray-900 mb-2">About Phishing Detection</h3>
        <p className="text-sm text-gray-600">
          Our phishing detection system uses machine learning to analyze URLs and identify potential phishing attempts.
          The system examines various features of the URL including length, special characters, domain information,
          and other indicators commonly associated with phishing attempts.
        </p>
        <div className="mt-4 text-sm text-gray-700">
          <p className="font-medium">What to do if a phishing URL is detected:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
            <li>Do not enter any personal information on the site</li>
            <li>Close the website immediately</li>
            <li>Report the URL to appropriate authorities</li>
            <li>If you've already entered information, change your passwords</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PhishingDetectionForm; 