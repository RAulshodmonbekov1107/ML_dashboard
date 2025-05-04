import React from 'react';
import { Link } from 'react-router-dom';
import { modelEndpoints } from '../services/api';

const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Machine Learning Showcase
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl">
              Explore 12 powerful machine learning algorithms with interactive demonstrations and real-world applications.
            </p>
            <div className="mt-10">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 transition"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Algorithms */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Featured Algorithms
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Regression */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="bg-blue-600 text-white px-4 py-2">
                <h3 className="text-lg font-semibold">Regression</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Predict continuous values like housing prices, medical costs, and stock prices.
                </p>
                <ul className="space-y-2 mb-6">
                  {modelEndpoints.regression.map((model) => (
                    <li key={model.endpoint}>
                      <Link 
                        to={`/model/${model.endpoint}`}
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        {model.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Classification */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="bg-green-600 text-white px-4 py-2">
                <h3 className="text-lg font-semibold">Classification</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Classify data into categories like spam detection, sentiment analysis, and loan approval.
                </p>
                <ul className="space-y-2 mb-6">
                  {modelEndpoints.classification.map((model) => (
                    <li key={model.endpoint}>
                      <Link 
                        to={`/model/${model.endpoint}`}
                        className="text-green-600 hover:text-green-800 transition"
                      >
                        {model.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Ensemble Methods */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="bg-purple-600 text-white px-4 py-2">
                <h3 className="text-lg font-semibold">Ensemble Methods</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Powerful combination techniques like Random Forest, AdaBoost, and XGBoost.
                </p>
                <ul className="space-y-2 mb-6">
                  {modelEndpoints.ensemble.map((model) => (
                    <li key={model.endpoint}>
                      <Link 
                        to={`/model/${model.endpoint}`}
                        className="text-purple-600 hover:text-purple-800 transition"
                      >
                        {model.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Neural Networks */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="bg-red-600 text-white px-4 py-2">
                <h3 className="text-lg font-semibold">Neural Networks</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Advanced deep learning models for image recognition, speech, and text generation.
                </p>
                <ul className="space-y-2 mb-6">
                  {modelEndpoints.neuralNetwork.map((model) => (
                    <li key={model.endpoint}>
                      <Link 
                        to={`/model/${model.endpoint}`}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        {model.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 inline-flex items-center justify-center w-16 h-16 mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Select a Model</h3>
              <p className="text-gray-600">
                Choose from 12 different machine learning algorithms across various categories.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 inline-flex items-center justify-center w-16 h-16 mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Input Your Data</h3>
              <p className="text-gray-600">
                Provide your own data or use our example data to test the model's performance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 inline-flex items-center justify-center w-16 h-16 mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Get Predictions</h3>
              <p className="text-gray-600">
                View real-time predictions and visualize the results with interactive charts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to explore machine learning?</h2>
          <p className="text-xl mb-8">
            Try out our interactive models and see machine learning in action.
          </p>
          <Link
            to="/model/linear-regression"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 transition"
          >
            Start with Linear Regression
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 