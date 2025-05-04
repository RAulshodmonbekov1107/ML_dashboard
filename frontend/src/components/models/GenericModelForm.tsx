import React, { useState, useEffect } from 'react';
import FormGenerator from '../ui/FormGenerator';
import ResultDisplay from '../ui/ResultDisplay';
import ChartDisplay from '../ui/ChartDisplay';
import apiService, { PredictionResult } from '../../services/apiService';

interface GenericModelFormProps {
  modelEndpoint: string;
  title?: string;
  description?: string;
}

// Define ChartData interface here instead of importing it
interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea';
  labels: string[];
  datasets: {
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    tension?: number;
    fill?: boolean;
  }[];
}

const GenericModelForm: React.FC<GenericModelFormProps> = ({ 
  modelEndpoint, 
  title, 
  description 
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [predicting, setPredicting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [modelName, setModelName] = useState<string>('');
  const [modelDescription, setModelDescription] = useState<string>('');

  // Load model information
  useEffect(() => {
    const loadModelInfo = async () => {
      if (!modelEndpoint) return;
      
      setLoading(true);
      
      try {
        // Use the API service to list models instead of the removed getModelInformation
        const response = await apiService.listModels();
        
        if ('error' in response && response.error) {
          setError(response.error || 'Failed to fetch model information');
          return;
        }
        
        // Find the model info from the list
        const modelInfo = response.models.find(model => model.id === modelEndpoint);
        
        if (modelInfo) {
          setModelName(modelInfo.name || modelEndpoint);
          setModelDescription(modelInfo.description || '');
        } else {
          // Fallback to a default model info
          setModelName(modelEndpoint.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '));
          setModelDescription('A machine learning model for predictions');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load model information');
      } finally {
        setLoading(false);
      }
    };
    
    loadModelInfo();
  }, [modelEndpoint]);

  const handleSubmit = async (formData: Record<string, any>) => {
    setPredicting(true);
    setError(null);
    
    try {
      // Make prediction with form data
      const response = await apiService.makePrediction<PredictionResult>(modelEndpoint, formData);
      
      setPredicting(false);
      
      if ('error' in response && response.error) {
        setError(response.error || 'Failed to make prediction');
        return;
      }
      
      // Set result
      setResult(response);
      
      // Generate chart data based on the result
      if (response.probabilities) {
        const probabilities = response.probabilities;
        const chartData: ChartData = {
          type: 'bar',
          labels: Array.isArray(probabilities) 
            ? probabilities.map(p => p.class || p.label || 'Unknown')
            : Object.keys(probabilities),
          datasets: [{
            label: 'Probability',
            data: Array.isArray(probabilities)
              ? probabilities.map(p => (p.probability || p.confidence || 0) * 100)
              : Object.values(probabilities).map(v => typeof v === 'number' ? v * 100 : 0),
            backgroundColor: [
              '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
              '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#0EA5E9'
            ]
          }]
        };
        setChartData(chartData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make prediction');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Model</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Input Form */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title || modelName || 'Model Prediction'}
        </h3>
        <p className="text-gray-600 mb-6">
          {description || modelDescription || 'Enter parameters to make a prediction.'}
        </p>
        
        <FormGenerator
          fields={[]}
          onSubmit={handleSubmit}
          loading={predicting}
          submitButtonText="Make Prediction"
        />
        
        <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h4 className="text-sm font-semibold text-gray-900">About {modelName}</h4>
          <p className="text-xs text-gray-600 mt-1">
            {modelName} is a {getModelDescription(modelEndpoint)}
          </p>
        </div>
      </div>
      
      {/* Results Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Results</h3>
        
        {(result || error || predicting) ? (
          <ResultDisplay
            result={result}
            isLoading={predicting}
            error={error}
          />
        ) : (
          <div className="bg-gray-50 p-6 rounded-md border border-gray-200 text-center">
            <p className="text-gray-500">Submit the form to see prediction results</p>
          </div>
        )}
        
        {/* Chart display */}
        {chartData && result && (
          <div className="mt-6">
            <ChartDisplay 
              data={chartData} 
              height={250}
              title="Prediction Visualization"
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get model description
const getModelDescription = (modelEndpoint: string): string => {
  switch (true) {
    case modelEndpoint.includes('linear-regression'):
      return 'statistical model that analyzes the relationship between a dependent variable and one or more independent variables.';
    case modelEndpoint.includes('logistic-regression'):
      return 'statistical model used for binary classification that estimates the probability of an event.';
    case modelEndpoint.includes('naive-bayes'):
      return 'probabilistic classifier based on applying Bayes\' theorem with strong independence assumptions.';
    case modelEndpoint.includes('decision-tree'):
      return 'decision support tool that uses a tree-like model of decisions and their possible consequences.';
    case modelEndpoint.includes('knn'):
      return 'non-parametric method used for classification and regression, where the output is based on the k closest training examples.';
    case modelEndpoint.includes('random-forest'):
      return 'ensemble learning method that operates by constructing multiple decision trees during training.';
    case modelEndpoint.includes('adaboost'):
      return 'boosting algorithm that combines multiple "weak learners" into a single "strong learner".';
    case modelEndpoint.includes('xgboost'):
      return 'optimized distributed gradient boosting library designed to be highly efficient and flexible.';
    case modelEndpoint.includes('neural-network'):
      return 'computing system inspired by biological neural networks that can learn tasks by analyzing examples.';
    case modelEndpoint.includes('rnn'):
      return 'class of neural networks where connections between nodes form a directed graph along a temporal sequence.';
    case modelEndpoint.includes('lstm'):
      return 'specialized recurrent neural network architecture designed to process sequential data and long-term dependencies.';
    case modelEndpoint.includes('translation'):
      return 'neural machine translation model that can translate text between different languages with context awareness.';
    default:
      return 'machine learning model for making predictions and solving complex problems.';
  }
};

export default GenericModelForm; 