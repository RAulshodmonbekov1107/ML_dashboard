import React, { useState } from 'react';
import CSVParser from '../ui/CSVParser';
import ResultDisplay from '../ui/ResultDisplay';
import ChartDisplay from '../ui/ChartDisplay';
import LoadingSpinner from '../ui/LoadingSpinner';
import apiService, { PredictionResult } from '../../services/apiService';

interface RegressionModelFormProps {
  modelEndpoint: string;
  title: string;
  description: string;
  inputFields?: { name: string; label: string; defaultValue?: number }[];
  supportsCSV?: boolean;
  targetColumn?: string;
}

const RegressionModelForm: React.FC<RegressionModelFormProps> = ({
  modelEndpoint,
  title,
  description,
  inputFields = [{ name: 'x', label: 'Input Value', defaultValue: 0 }],
  supportsCSV = false,
  targetColumn
}) => {
  const [inputs, setInputs] = useState<Record<string, number>>(() => {
    const initialInputs: Record<string, number> = {};
    inputFields.forEach(field => {
      initialInputs[field.name] = field.defaultValue || 0;
    });
    return initialInputs;
  });

  const [csvData, setCSVData] = useState<{ headers: string[]; rows: any[][] } | null>(null);
  const [inputMethod, setInputMethod] = useState<'manual' | 'csv'>(supportsCSV ? 'csv' : 'manual');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [chartData, setChartData] = useState<any | null>(null);

  const handleInputChange = (name: string, value: number) => {
    setInputs(prev => ({ ...prev, [name]: value }));
    // Reset results when inputs change
    if (result) {
      setResult(null);
      setChartData(null);
    }
  };

  const handleCSVData = (data: { headers: string[]; rows: any[][] }) => {
    setCSVData(data);
    // Reset results when CSV changes
    if (result) {
      setResult(null);
      setChartData(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (inputMethod === 'csv' && csvData) {
        response = await apiService.makePrediction<PredictionResult>(
          modelEndpoint,
          { csv_data: csvData, target_column: targetColumn }
        );
      } else {
        response = await apiService.makePrediction<PredictionResult>(
          modelEndpoint,
          inputs
        );
      }
      
      setLoading(false);
      
      if ('error' in response && response.error) {
        setError(response.error || 'Failed to make prediction');
        return;
      }
      
      setResult(response);
      
      // Generate chart data for regression results
      if ('predicted_values' in response || 'prediction' in response) {
        // For single prediction
        if (!Array.isArray(response.prediction) && typeof response.prediction === 'number') {
          const chartData = {
            type: 'bar',
            labels: ['Predicted Value'],
            datasets: [{
              label: 'Prediction',
              data: [response.prediction],
              backgroundColor: ['#3B82F6']
            }]
          };
          setChartData(chartData);
        } 
        // For multiple predictions from CSV data
        else if ('predicted_values' in response && Array.isArray(response.predicted_values)) {
          const chartData = {
            type: 'line',
            labels: response.predicted_values.map((_: any, idx: number) => `Sample ${idx + 1}`),
            datasets: [{
              label: 'Predictions',
              data: response.predicted_values,
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              borderWidth: 2,
              tension: 0.1
            }]
          };
          setChartData(chartData);
        }
      }
    } catch (err) {
      setLoading(false);
      setError('Failed to make prediction. Please try again.');
      console.error('Error making prediction:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        
        {supportsCSV && (
          <div className="mb-6">
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setInputMethod('manual')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  inputMethod === 'manual'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Manual Input
              </button>
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
            </div>
          </div>
        )}
        
        {inputMethod === 'manual' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {inputFields.map((field) => (
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
                  value={inputs[field.name]}
                  onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                />
              </div>
            ))}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 transition mt-4"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Processing...</span>
                </div>
              ) : (
                'Predict'
              )}
            </button>
          </form>
        ) : (
          <div>
            <CSVParser 
              onDataParsed={handleCSVData}
              className="mb-4"
            />
            
            {csvData && (
              <button
                onClick={handleSubmit}
                disabled={loading || !csvData}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 transition mt-4"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" color="white" />
                    <span className="ml-2">Processing...</span>
                  </div>
                ) : (
                  'Run Prediction on CSV Data'
                )}
              </button>
            )}
          </div>
        )}
        
        <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h4 className="text-sm font-semibold text-gray-900">About Regression</h4>
          <p className="text-xs text-gray-600 mt-1">
            Regression models predict continuous numerical values based on input features. 
            They're used for forecasting, trend analysis, and understanding relationships 
            between variables.
          </p>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Prediction Results</h3>
        
        {(result || error || loading) ? (
          <ResultDisplay
            result={result}
            isLoading={loading}
            error={error}
          />
        ) : (
          <div className="bg-gray-50 p-6 rounded-md border border-gray-200 text-center">
            <p className="text-gray-500">Enter values and click Predict to see results</p>
          </div>
        )}
        
        {chartData && result && (
          <div className="mt-6">
            <ChartDisplay 
              data={chartData} 
              height={250}
              title="Prediction Results"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RegressionModelForm; 