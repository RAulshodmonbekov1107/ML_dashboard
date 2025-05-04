import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Import model forms from index
import {
  LinearRegressionForm,
  MultipleLinearRegressionForm,
  GeneralRegressionForm,
  ClassificationForm,
  KNNForm,
  LogisticRegressionForm,
  NaiveBayesForm,
  DecisionTreeForm,
  RandomForestForm,
  AdaBoostForm,
  PhishingDetectionForm,
  NeuralNetworkForm,
  RNNForm,
  LSTMForm,
  TranslationForm
} from '../components/models';

// Define model info interface
interface ModelInfo {
  model: string;
  use_case: string;
  description: string;
  input_example: any;
}

const ModelDetailPage: React.FC = () => {
  const { modelEndpoint } = useParams<{ modelEndpoint: string }>();
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // If the modelEndpoint is one of the special pages, redirect to it
    if (modelEndpoint === 'translation') {
      navigate('/model/translation', { replace: true });
      return;
    }
    
    if (modelEndpoint === 'lstm') {
      navigate('/model/lstm', { replace: true });
      return;
    }
    
    if (modelEndpoint === 'rnn') {
      navigate('/model/rnn', { replace: true });
      return;
    }
    
    if (modelEndpoint === 'neural-network') {
      navigate('/model/neural-network', { replace: true });
      return;
    }

    if (modelEndpoint === 'adaboost') {
      navigate('/model/adaboost', { replace: true });
      return;
    }
    
    if (modelEndpoint === 'classification') {
      navigate('/model/classification', { replace: true });
      return;
    }
    
    if (modelEndpoint === 'knn') {
      navigate('/model/knn', { replace: true });
      return;
    }
    
    if (modelEndpoint === 'logistic-regression') {
      navigate('/model/logistic-regression', { replace: true });
      return;
    }
    
    if (modelEndpoint === 'naive-bayes') {
      navigate('/model/naive-bayes', { replace: true });
      return;
    }
    
    if (modelEndpoint === 'decision-tree') {
      navigate('/model/decision-tree', { replace: true });
      return;
    }
    
    if (modelEndpoint === 'multiple-linear-regression') {
      navigate('/model/multiple-linear-regression', { replace: true });
      return;
    }
    
    if (modelEndpoint === 'general-regression') {
      navigate('/model/general-regression', { replace: true });
      return;
    }

    if (modelEndpoint === 'linear-regression') {
      navigate('/model/linear-regression', { replace: true });
      return;
    }

    const fetchModelInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        if (modelEndpoint) {
          const info = await api.getModelInfo(modelEndpoint);
          setModelInfo(info);
        }
      } catch (err) {
        setError('Failed to load model information. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchModelInfo();
  }, [modelEndpoint, navigate]);
  
  // Function to render the appropriate form based on model endpoint
  const renderModelForm = () => {
    if (!modelEndpoint) return null;
    
    switch (modelEndpoint) {
      case 'linear-regression':
        return <div className="text-gray-600">Redirecting to linear regression page...</div>;
      case 'multiple-linear-regression':
        return <MultipleLinearRegressionForm />;
      case 'general-regression':
        return <GeneralRegressionForm />;
      case 'classification':
        // This is now handled by redirection in useEffect
        return <div className="text-gray-600">Redirecting to classification page...</div>;
      case 'knn':
        // This is now handled by redirection in useEffect
        return <div className="text-gray-600">Redirecting to KNN movie recommendations page...</div>;
      case 'logistic-regression':
        // This is now handled by redirection in useEffect
        return <div className="text-gray-600">Redirecting to logistic regression page...</div>;
      case 'naive-bayes':
        // This is now handled by redirection in useEffect
        return <div className="text-gray-600">Redirecting to sentiment analysis page...</div>;
      case 'decision-tree':
        return <DecisionTreeForm />;
      case 'random-forest':
        return <RandomForestForm />;
      case 'adaboost':
        return <AdaBoostForm />;
      case 'xgboost':
        return <PhishingDetectionForm />;
      // Neural Network, RNN, LSTM, and Translation cases are handled by redirection in useEffect
      default:
        return <div className="text-red-600">Model not found</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" text="Loading model..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-7xl mx-auto my-8" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {modelInfo && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{modelInfo.model}</h1>
          <h2 className="text-xl text-gray-700 mb-4">{modelInfo.use_case}</h2>
          <p className="text-gray-600 mb-6">{modelInfo.description}</p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">About this model</h3>
            <p className="text-gray-600">
              This is an interactive demonstration of the {modelInfo.model} algorithm applied to {modelInfo.use_case.toLowerCase()}.
              You can input your own values below to see how the model makes predictions in real-time.
            </p>
          </div>
        </div>
      )}
      
      {/* Model-specific form */}
      <div className="bg-white shadow-md rounded-lg p-6">
        {renderModelForm()}
      </div>
    </div>
  );
};

export default ModelDetailPage; 