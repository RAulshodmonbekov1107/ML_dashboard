import GenericModelForm from './GenericModelForm';
import TranslationModelForm from './TranslationModelForm';
import AnimatedTranslationPage from './AnimatedTranslationPage';
import RNNModelForm from './RNNModelForm';
import LSTMModelForm from './LSTMModelForm';
import NeuralNetworkModelForm from './NeuralNetworkModelForm';
import FaceRecognitionModelForm from './FaceRecognitionModelForm';
import RandomForestModelForm from './RandomForestModelForm';
import AnimatedRandomForestPage from './AnimatedRandomForestPage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import LinearRegressionForm from './LinearRegressionForm';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import XGBoostCTRForm from './XGBoostCTRForm';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import PhishingDetectionForm from './PhishingDetectionForm';
import React from 'react';

// Explicitly disable eslint for unused imports
/* eslint-disable @typescript-eslint/no-unused-vars */

// Define a type for model form components
type ModelFormComponent = React.FC;

// Create factory function for model forms
const createModelForm = (modelEndpoint: string, title?: string, description?: string): ModelFormComponent => {
  return () => React.createElement(GenericModelForm, {
    modelEndpoint,
    title,
    description
  });
};

// Export components for all models using the GenericModelForm
export const MultipleLinearRegressionForm = createModelForm(
  'multiple-linear-regression', 
  'Medical Cost Prediction',
  'Predict medical costs based on patient attributes like age, BMI, and smoking status.'
);

export const GeneralRegressionForm = createModelForm(
  'general-regression',
  'Stock Price Prediction',
  'Predict stock prices based on previous price, volume, and market index.'
);

export const ClassificationForm = createModelForm(
  'classification',
  'Email Spam Detection',
  'Classify emails as spam or not spam based on various features.'
);

export const KNNForm = createModelForm(
  'knn',
  'Movie Recommendations',
  'Get movie recommendations based on genre preferences using K-Nearest Neighbors.'
);

export const LogisticRegressionForm = createModelForm(
  'logistic-regression',
  'Credit Card Fraud Detection',
  'Detect potentially fraudulent credit card transactions.'
);

export const NaiveBayesForm = createModelForm(
  'naive-bayes',
  'Sentiment Analysis',
  'Analyze text sentiment based on feature extraction.'
);

export const DecisionTreeForm = createModelForm(
  'decision-tree',
  'Loan Approval',
  'Determine loan approval based on financial attributes.'
);

// Use the animated random forest page
export const RandomForestForm: React.FC = () => {
  return React.createElement(AnimatedRandomForestPage, {
    modelEndpoint: 'random-forest',
    title: 'Retail Customer Behavior',
    description: 'Predict customer purchasing behavior based on demographics and history.'
  });
};

// Use the specialized FaceRecognitionModelForm for face recognition
export const AdaBoostForm: React.FC = () => {
  return React.createElement(FaceRecognitionModelForm, {
    modelEndpoint: 'adaboost',
    title: 'Face Recognition',
    description: 'Real-time face recognition using your webcam. The system captures video frames, processes them, and compares detected faces against a gallery of known individuals.'
  });
};

// Use the specialized XGBoostCTRForm for click-through rate prediction
export { default as XGBoostCTRForm } from './XGBoostCTRForm';

// Use the specialized NeuralNetworkModelForm for image recognition
export const NeuralNetworkForm: React.FC = () => {
  return React.createElement(NeuralNetworkModelForm, {
    modelEndpoint: 'neural-network',
    title: 'Image Recognition',
    description: 'Recognize image objects using deep learning. Upload an image for classification.'
  });
};

// Use the specialized RNN form for speech-to-text
export const RNNForm: React.FC = () => {
  return React.createElement(RNNModelForm, {
    modelEndpoint: 'rnn',
    title: 'Speech-to-Text',
    description: 'Convert audio to text using a Recurrent Neural Network model. Record your voice or upload an audio file.'
  });
};

// Use the specialized LSTM form for text generation
export const LSTMForm: React.FC = () => {
  return React.createElement(LSTMModelForm, {
    modelEndpoint: 'lstm',
    title: 'Text Generation',
    description: 'Generate text continuation using a Long Short-Term Memory network. Enter a prompt to start the generation.'
  });
};

// Use the animated translation page wrapper for a stunning UI
export const TranslationForm: React.FC = () => {
  return React.createElement(AnimatedTranslationPage, {
    modelEndpoint: 'translation',
    title: 'Text Translation',
    description: 'Translate text between different languages using Google Translate API with neural machine translation.'
  });
};

// Export the custom implemented forms
export { default as LinearRegressionForm } from './LinearRegressionForm';
export { default as PhishingDetectionForm } from './PhishingDetectionForm';

// Make sure our NeuralNetworkModelForm is properly exported
export { default as NeuralNetworkModelForm } from './NeuralNetworkModelForm';
export { default as EnhancedNeuralNetworkModelForm } from './EnhancedNeuralNetworkModelForm'; 