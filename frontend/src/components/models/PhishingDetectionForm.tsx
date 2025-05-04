import React, { useState } from 'react';
import { analyzeUrlForPhishing } from '../../services/api';
import './PhishingDetectionForm.css';

interface AnalysisResult {
  prediction: number;
  is_phishing: boolean;
  confidence: number;
  risk_factors?: string[];
  safe_indicators?: string[];
}

const PhishingDetectionForm: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [advancedFields, setAdvancedFields] = useState({
    url_length: 0,
    has_at_symbol: 0,
    has_ip_address: 0,
    subdomain_count: 0,
    has_https: 0,
    has_suspicious_keywords: 0,
    special_char_count: 0,
  });

  // Automatically calculate url features when URL changes
  const updateUrlFeatures = (inputUrl: string) => {
    const features = {
      url_length: inputUrl.length,
      has_at_symbol: inputUrl.includes('@') ? 1 : 0,
      has_ip_address: /\d+\.\d+\.\d+\.\d+/.test(inputUrl) ? 1 : 0,
      subdomain_count: (inputUrl.match(/\./g) || []).length,
      has_https: inputUrl.startsWith('https://') ? 1 : 0,
      has_suspicious_keywords: /password|login|bank|paypal|verify|account/.test(inputUrl.toLowerCase()) ? 1 : 0,
      special_char_count: (inputUrl.match(/[^a-zA-Z0-9]/g) || []).length,
    };
    
    setAdvancedFields(features);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    updateUrlFeatures(newUrl);
  };

  const handleAdvancedFieldChange = (field: string, value: number) => {
    setAdvancedFields({
      ...advancedFields,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = {
        url,
        ...advancedFields
      };

      const response = await analyzeUrlForPhishing(data);
      setResult(response);
    } catch (error) {
      console.error(error);
      alert('Failed to analyze URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle demo URL click
  const handleDemoUrlClick = (demoUrl: string) => {
    setUrl(demoUrl);
    updateUrlFeatures(demoUrl);
    setResult(null);
  };

  return (
    <div className="phishing-form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="form-control">
            <label htmlFor="url-input">URL to Check</label>
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="Enter URL (e.g., https://example.com)"
              required
            />
          </div>
          
          {/* Demo URLs */}
          <div className="demo-urls">
            <p>Example URLs to try:</p>
            <div className="demo-buttons">
              <button 
                type="button"
                onClick={() => handleDemoUrlClick('https://google.com')}
                className="demo-button safe"
              >
                Google.com (safe)
              </button>
              <button 
                type="button"
                onClick={() => handleDemoUrlClick('http://paypa1.secure-login.com/verification')}
                className="demo-button phishing"
              >
                Paypal lookalike (phishing)
              </button>
              <button 
                type="button"
                onClick={() => handleDemoUrlClick('http://192.168.1.1/login@account.verify')}
                className="demo-button phishing"
              >
                IP with @ symbol (phishing)
              </button>
            </div>
          </div>
          
          <div className="form-control switch-control">
            <label htmlFor="advanced-mode">Advanced Mode</label>
            <div className="toggle-switch">
              <input
                id="advanced-mode"
                type="checkbox"
                checked={advancedMode}
                onChange={() => setAdvancedMode(!advancedMode)}
              />
              <span className="slider"></span>
            </div>
          </div>

          {advancedMode && (
            <div className="advanced-features">
              <h4>Advanced Features</h4>
              <div className="advanced-fields">
                {Object.entries(advancedFields).map(([key, value]) => (
                  <div className="form-control" key={key}>
                    <label htmlFor={key}>{key.replace(/_/g, ' ')}</label>
                    <input
                      id={key}
                      type="number"
                      value={value}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleAdvancedFieldChange(key, parseInt(e.target.value, 10) || 0)
                      }
                    />
                    <div className="helper-text">
                      {key === 'url_length' && 'Length of the URL'}
                      {key === 'has_at_symbol' && 'URL contains @ symbol (0 or 1)'}
                      {key === 'has_ip_address' && 'URL contains IP address (0 or 1)'}
                      {key === 'subdomain_count' && 'Number of subdomains'}
                      {key === 'has_https' && 'URL uses HTTPS (0 or 1)'}
                      {key === 'has_suspicious_keywords' && 'Contains suspicious words (0 or 1)'}
                      {key === 'special_char_count' && 'Count of special characters'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            className={`submit-button ${loading ? 'loading' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Check URL'}
          </button>
        </div>
      </form>

      {result && (
        <div className={`result-container ${result.is_phishing ? 'danger' : 'safe'}`}>
          <h3>Analysis Result</h3>
          <div className="result-content">
            <div className="result-badge">
              {result.is_phishing ? 'Potential Phishing URL' : 'Likely Safe URL'}
            </div>
            <p className="probability">
              Phishing probability: {(result.prediction * 100).toFixed(2)}% 
              (Confidence: {(result.confidence * 100).toFixed(0)}%)
            </p>
          </div>
          
          <div className="analysis-details">
            {result.risk_factors && result.risk_factors.length > 0 && (
              <div className="risk-factors">
                <h4>Risk Factors Detected:</h4>
                <ul>
                  {result.risk_factors.map((factor, index) => (
                    <li key={index} className="risk-item">{factor}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.safe_indicators && result.safe_indicators.length > 0 && (
              <div className="safe-indicators">
                <h4>Safety Indicators:</h4>
                <ul>
                  {result.safe_indicators.map((indicator, index) => (
                    <li key={index} className="safety-item">{indicator}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhishingDetectionForm; 