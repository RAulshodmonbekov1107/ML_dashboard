import React, { useState } from 'react';
import CSVParser from '../ui/CSVParser';
import ResultDisplay from '../ui/ResultDisplay';
import ChartDisplay from '../ui/ChartDisplay';
import LoadingSpinner from '../ui/LoadingSpinner';
import apiService, { PredictionResult } from '../../services/apiService';

interface ClassificationModelFormProps {
  modelEndpoint: string;
  title: string;
  description: string;
  supportsCSV?: boolean;
  supportsText?: boolean;
  textField?: {
    name: string;
    label: string;
    placeholder: string;
  };
  numericFields?: { name: string; label: string; defaultValue?: number }[];
  targetColumn?: string;
}

const ClassificationModelForm: React.FC<ClassificationModelFormProps> = ({
  modelEndpoint,
  title,
  description,
  supportsCSV = false,
  supportsText = false,
  textField = { name: 'text', label: 'Text Input', placeholder: 'Enter text to classify...' },
  numericFields = [{ name: 'feature1', label: 'Feature 1', defaultValue: 0 }],
  targetColumn
}) => {
  // Initialize numeric inputs
  const [numericInputs, setNumericInputs] = useState<Record<string, number>>(() => {
    const initialInputs: Record<string, number> = {};
    numericFields.forEach(field => {
      initialInputs[field.name] = field.defaultValue || 0;
    });
    return initialInputs;
  });
  
  const [textInput, setTextInput] = useState<string>('');
  const [csvData, setCSVData] = useState<{ headers: string[]; rows: any[][] } | null>(null);
  const [inputMethod, setInputMethod] = useState<'manual' | 'text' | 'csv'>(
    supportsText ? 'text' : supportsCSV ? 'csv' : 'manual'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [chartData, setChartData] = useState<any | null>(null);

  const handleNumericInputChange = (name: string, value: number) => {
    setNumericInputs(prev => ({ ...prev, [name]: value }));
    resetResults();
  };

  const handleTextInputChange = (value: string) => {
    setTextInput(value);
    resetResults();
  };

  const handleCSVData = (data: { headers: string[]; rows: any[][] }) => {
    setCSVData(data);
    resetResults();
  };

  const resetResults = () => {
    if (result) {
      setResult(null);
      setChartData(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null);
    
    try {
      let response;
      let requestData;
      
      if (inputMethod === 'csv' && csvData) {
        // Prepare CSV data for the backend
        // Convert rows to objects using header keys
        const processedData = csvData.rows.map(row => {
          const rowObj: Record<string, string> = {};
          csvData.headers.forEach((header, index) => {
            rowObj[header] = row[index];
          });
          return rowObj;
        });
        
        requestData = { 
          csv_data: {
            headers: csvData.headers,
            data: processedData
          }, 
          target_column: targetColumn 
        };
        
        console.log('Sending CSV data to API:', JSON.stringify(requestData, null, 2));
        
        response = await apiService.makePrediction<PredictionResult>(
          modelEndpoint,
          requestData
        );
      } else if (inputMethod === 'text' && textInput.trim()) {
        requestData = { [textField?.name || 'text']: textInput.trim() };
        response = await apiService.makePrediction<PredictionResult>(
          modelEndpoint,
          requestData
        );
      } else {
        requestData = numericInputs;
        response = await apiService.makePrediction<PredictionResult>(
          modelEndpoint,
          requestData
        );
      }
      
      console.log('API Response:', response);
      
      setLoading(false);
      
      if ('error' in response && response.error) {
        setError(response.error || 'Unknown error occurred');
        return;
      }
      
      setResult(response);
      
      // Generate chart data for classification results
      if (response.probabilities) {
        const labels = Object.keys(response.probabilities);
        const values = Object.values(response.probabilities);
        
        const chartData = {
          type: 'bar',
          labels: labels,
          datasets: [{
            label: 'Class Probabilities',
            data: values,
            backgroundColor: [
              '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1',
              '#EC4899', '#8B5CF6', '#14B8A6', '#06B6D4', '#0EA5E9'
            ].slice(0, labels.length)
          }]
        };
        setChartData(chartData);
      }
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'An error occurred during prediction');
      console.error('Prediction error:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        
        {/* Input Method Selection */}
        {(supportsCSV || supportsText) && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {supportsText && (
                <button
                  type="button"
                  onClick={() => setInputMethod('text')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    inputMethod === 'text'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Text Input
                </button>
              )}
              {numericFields.length > 0 && (
                <button
                  type="button"
                  onClick={() => setInputMethod('manual')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    inputMethod === 'manual'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Numeric Input
                </button>
              )}
              {supportsCSV && (
                <button
                  type="button"
                  onClick={() => setInputMethod('csv')}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    inputMethod === 'csv'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  CSV Upload
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Text Input Form */}
        {inputMethod === 'text' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor={textField.name}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {textField.label}
              </label>
              <textarea
                id={textField.name}
                value={textInput}
                onChange={(e) => handleTextInputChange(e.target.value)}
                className="w-full min-h-[100px] px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={textField.placeholder}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !textInput.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 transition"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Classifying...</span>
                </div>
              ) : (
                'Classify'
              )}
            </button>
          </form>
        )}
        
        {/* Numeric Input Form */}
        {inputMethod === 'manual' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {numericFields.map((field) => (
              <div key={field.name}>
                <label 
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {field.label}
                </label>
                <input
                  id={field.name}
                  type="number"
                  value={numericInputs[field.name]}
                  onChange={(e) => handleNumericInputChange(field.name, parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                />
              </div>
            ))}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 transition"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Classifying...</span>
                </div>
              ) : (
                'Classify'
              )}
            </button>
          </form>
        )}
        
        {/* CSV Upload Form */}
        {inputMethod === 'csv' && (
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">Upload CSV Dataset</h4>
            <p className="text-sm text-gray-600 mb-4">
              Your CSV file should have a header row. Each column represents a feature, and each row represents a sample.
              {targetColumn && <span> The "{targetColumn}" column will be used as the target for prediction.</span>}
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Make sure your CSV file is properly formatted with comma separators and consistent columns.
                    If you're having trouble, try exporting your CSV again with UTF-8 encoding.
                  </p>
                </div>
              </div>
            </div>
            
            <CSVParser
              onDataParsed={handleCSVData}
              label="Upload Dataset"
              description="Upload your CSV dataset for classification"
            />
            
            {csvData && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !csvData}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 transition"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" color="white" />
                      <span className="ml-2">Processing...</span>
                    </div>
                  ) : (
                    'Run Classification on CSV Data'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h4 className="text-sm font-semibold text-gray-900">About Classification</h4>
          <p className="text-xs text-gray-600 mt-1">
            Classification models categorize inputs into predefined classes or categories. 
            They're used for tasks like spam detection, sentiment analysis, image recognition, 
            and medical diagnosis.
          </p>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Classification Results</h3>
        
        {(result || error || loading) ? (
          <ResultDisplay
            result={result}
            isLoading={loading}
            error={error}
          />
        ) : (
          <div className="bg-gray-50 p-6 rounded-md border border-gray-200 text-center">
            <p className="text-gray-500">
              {inputMethod === 'text' ? 'Enter text' : 
               inputMethod === 'csv' ? 'Upload CSV data' : 
               'Enter values'} and click Classify to see results
            </p>
          </div>
        )}
        
        {chartData && result && (
          <div className="mt-6">
            <ChartDisplay 
              data={chartData} 
              height={250}
              title="Classification Results"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassificationModelForm; 