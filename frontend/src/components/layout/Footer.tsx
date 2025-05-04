import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-xl font-bold mb-4">ML Showcase</h2>
            <p className="text-gray-300 max-w-md">
              Explore 12 machine learning algorithms with interactive demos,
              from simple linear regression to advanced neural networks.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">ML Categories</h3>
              <ul className="space-y-2">
                <li><button className="text-gray-300 hover:text-white bg-transparent border-0 p-0 cursor-pointer">Regression</button></li>
                <li><button className="text-gray-300 hover:text-white bg-transparent border-0 p-0 cursor-pointer">Classification</button></li>
                <li><button className="text-gray-300 hover:text-white bg-transparent border-0 p-0 cursor-pointer">Ensemble Methods</button></li>
                <li><button className="text-gray-300 hover:text-white bg-transparent border-0 p-0 cursor-pointer">Neural Networks</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Resources</h3>
              <ul className="space-y-2">
                <li><a href="https://scikit-learn.org/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">Scikit-Learn</a></li>
                <li><a href="https://www.tensorflow.org/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">TensorFlow</a></li>
                <li><a href="https://xgboost.readthedocs.io/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">XGBoost</a></li>
                <li><a href="https://keras.io/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">Keras</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} ML Showcase. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 