import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { modelEndpoints } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Sample data for charts
  const modelCategoryCounts = [
    { name: 'Regression', count: modelEndpoints.regression.length },
    { name: 'Classification', count: modelEndpoints.classification.length },
    { name: 'Ensemble', count: modelEndpoints.ensemble.length },
    { name: 'Neural Networks', count: modelEndpoints.neuralNetwork.length },
  ];

  // Sample accuracy data (this would typically come from the backend)
  const modelAccuracyData = [
    { name: 'Linear Regression', accuracy: 0.85 },
    { name: 'Multiple Linear Regression', accuracy: 0.82 },
    { name: 'Classification', accuracy: 0.90 },
    { name: 'KNN', accuracy: 0.87 },
    { name: 'Naive Bayes', accuracy: 0.78 },
    { name: 'Random Forest', accuracy: 0.92 },
    { name: 'XGBoost', accuracy: 0.94 },
    { name: 'Neural Network', accuracy: 0.88 },
  ];

  // Icons for the model cards
  const getModelIcon = (category: string) => {
    switch (category) {
      case 'regression':
        return (
          <div className="rounded-full bg-blue-100 p-3 text-blue-600">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        );
      case 'classification':
        return (
          <div className="rounded-full bg-green-100 p-3 text-green-600">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
        );
      case 'ensemble':
        return (
          <div className="rounded-full bg-purple-100 p-3 text-purple-600">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        );
      case 'neuralNetwork':
        return (
          <div className="rounded-full bg-red-100 p-3 text-red-600">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  // Colors for pie chart
  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#EF4444'];
  
  // Get all models to display based on the active tab
  const getDisplayModels = () => {
    switch (activeTab) {
      case 'regression':
        return modelEndpoints.regression;
      case 'classification':
        return modelEndpoints.classification;
      case 'ensemble':
        return modelEndpoints.ensemble;
      case 'neural-network':
        return modelEndpoints.neuralNetwork;
      case 'all':
      default:
        return [
          ...modelEndpoints.regression,
          ...modelEndpoints.classification,
          ...modelEndpoints.ensemble,
          ...modelEndpoints.neuralNetwork
        ];
    }
  };

  // Get the model category label and color
  const getModelCategory = (model: { endpoint: string }) => {
    if (modelEndpoints.regression.some(m => m.endpoint === model.endpoint)) {
      return { label: 'Regression', color: 'bg-blue-100 text-blue-800', category: 'regression' };
    }
    if (modelEndpoints.classification.some(m => m.endpoint === model.endpoint)) {
      return { label: 'Classification', color: 'bg-green-100 text-green-800', category: 'classification' };
    }
    if (modelEndpoints.ensemble.some(m => m.endpoint === model.endpoint)) {
      return { label: 'Ensemble', color: 'bg-purple-100 text-purple-800', category: 'ensemble' };
    }
    if (modelEndpoints.neuralNetwork.some(m => m.endpoint === model.endpoint)) {
      return { label: 'Neural Network', color: 'bg-red-100 text-red-800', category: 'neuralNetwork' };
    }
    return { label: 'Other', color: 'bg-gray-100 text-gray-800', category: 'other' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">ML Models Dashboard</h1>
      <p className="text-gray-600 mb-8">Explore and interact with 12 machine learning models across different categories.</p>
      
      {/* Dashboard summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Models</p>
              <p className="text-2xl font-semibold">
                {modelEndpoints.regression.length + 
                 modelEndpoints.classification.length + 
                 modelEndpoints.ensemble.length + 
                 modelEndpoints.neuralNetwork.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Highest Accuracy</p>
              <p className="text-2xl font-semibold">94%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">ML Categories</p>
              <p className="text-2xl font-semibold">4</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Use Cases</p>
              <p className="text-2xl font-semibold">12</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Model Distribution Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Model Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modelCategoryCounts}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {modelCategoryCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Model Accuracy Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Model Accuracy Comparison</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={modelAccuracyData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(0)}%`} />
                <Legend />
                <Bar dataKey="accuracy" name="Accuracy" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Model Category Tabs */}
      <div className="mb-6">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">Select a tab</label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="all">All Models</option>
            <option value="regression">Regression</option>
            <option value="classification">Classification</option>
            <option value="ensemble">Ensemble</option>
            <option value="neural-network">Neural Networks</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('all')}
              className={`${
                activeTab === 'all'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              All Models
            </button>
            <button
              onClick={() => setActiveTab('regression')}
              className={`${
                activeTab === 'regression'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              Regression
            </button>
            <button
              onClick={() => setActiveTab('classification')}
              className={`${
                activeTab === 'classification'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              Classification
            </button>
            <button
              onClick={() => setActiveTab('ensemble')}
              className={`${
                activeTab === 'ensemble'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              Ensemble
            </button>
            <button
              onClick={() => setActiveTab('neural-network')}
              className={`${
                activeTab === 'neural-network'
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              Neural Networks
            </button>
          </nav>
        </div>
      </div>
      
      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {getDisplayModels().map(model => {
          const { label, color, category } = getModelCategory(model);
          
          return (
            <div key={model.endpoint} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-start">
                  {getModelIcon(category)}
                  <div className="ml-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                      {label}
                    </span>
                    <h3 className="text-lg font-semibold mt-1">
                      {model.name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {getModelDescription(model.endpoint)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Link
                    to={`/model/${model.endpoint}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Try Model
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper function to get model description
const getModelDescription = (modelEndpoint: string): string => {
  switch (true) {
    case modelEndpoint.includes('linear-regression'):
      return 'Predicts housing prices based on square footage using linear regression.';
    case modelEndpoint.includes('multiple-linear-regression'):
      return 'Predicts medical costs based on patient attributes like age and BMI.';
    case modelEndpoint.includes('general-regression'):
      return 'Predicts stock prices based on previous price, volume, and market index.';
    case modelEndpoint.includes('classification'):
      return 'Classifies emails as spam or not spam based on various features.';
    case modelEndpoint.includes('knn'):
      return 'Recommends movies based on genre preferences using K-Nearest Neighbors.';
    case modelEndpoint.includes('logistic-regression'):
      return 'Detects potentially fraudulent credit card transactions.';
    case modelEndpoint.includes('naive-bayes'):
      return 'Analyzes text sentiment based on feature extraction.';
    case modelEndpoint.includes('decision-tree'):
      return 'Determines loan approval based on financial attributes.';
    case modelEndpoint.includes('random-forest'):
      return 'Predicts customer behavior based on demographics and history.';
    case modelEndpoint.includes('adaboost'):
      return 'Recognizes faces based on simplified extracted features.';
    case modelEndpoint.includes('xgboost'):
      return 'Predicts click-through rate for online advertisements.';
    case modelEndpoint.includes('neural-network'):
      return 'Recognizes image objects using simplified extracted features.';
    case modelEndpoint.includes('rnn'):
      return 'Converts audio features to text using a simplified RNN model.';
    case modelEndpoint.includes('lstm'):
      return 'Generates text continuation based on a seed sequence.';
    default:
      return 'Implements machine learning algorithms for predictive modeling.';
  }
};

export default DashboardPage; 