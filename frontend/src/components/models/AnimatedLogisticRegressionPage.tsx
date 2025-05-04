import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import Navbar from '../layout/Navbar';
import './LogisticRegression.css';

interface AnimatedLogisticRegressionPageProps {
  modelEndpoint: string;
  title: string;
  description: string;
}

interface FormData {
  transactionAmount: number;
  merchantCategory: string;
  timeSincePrevTransaction: number;
  distanceFromHome: number;
  foreignTransaction: boolean;
  frequentMerchant: boolean;
}

interface PredictionResult {
  prediction: string;
  confidence: number;
  probabilities?: {
    [key: string]: number;
  };
  error?: string;
}

const AnimatedLogisticRegressionPage: React.FC<AnimatedLogisticRegressionPageProps> = ({
  modelEndpoint,
  title,
  description
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    transactionAmount: 500,
    merchantCategory: 'retail',
    timeSincePrevTransaction: 24,
    distanceFromHome: 5,
    foreignTransaction: false,
    frequentMerchant: true
  });
  
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [animatedElements, setAnimatedElements] = useState({
    headerAnimation: false,
    formAnimation: false,
    resultAnimation: false
  });

  // Trigger animations in sequence when component mounts
  React.useEffect(() => {
    setTimeout(() => setAnimatedElements(prev => ({ ...prev, headerAnimation: true })), 300);
    setTimeout(() => setAnimatedElements(prev => ({ ...prev, formAnimation: true })), 800);
    if (prediction) {
      setTimeout(() => setAnimatedElements(prev => ({ ...prev, resultAnimation: true })), 1200);
    }
  }, [prediction]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseFloat(value) : 
               value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPrediction(null);
    setAnimatedElements(prev => ({ ...prev, resultAnimation: false }));
    
    try {
      const result = await apiService.makePrediction<PredictionResult>(
        modelEndpoint,
        formData
      );
      
      setPrediction(result);
      setTimeout(() => setAnimatedElements(prev => ({ ...prev, resultAnimation: true })), 500);
    } catch (error) {
      console.error('Error making prediction:', error);
      setPrediction({
        prediction: 'Error',
        confidence: 0,
        error: 'Failed to make prediction. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSliderColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage < 30) return '#4ade80'; // green
    if (percentage < 70) return '#facc15'; // yellow
    return '#ef4444'; // red
  };

  // Animation variants for framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  // Animated risk meter
  const RiskMeter = ({ fraudProbability }: { fraudProbability: number }) => {
    const angle = fraudProbability * 180;
    
    return (
      <div className="risk-meter-container">
        <div className="risk-meter">
          <div className="risk-meter-scale">
            <div className="risk-meter-label risk-meter-label-low">Low</div>
            <div className="risk-meter-label risk-meter-label-med">Medium</div>
            <div className="risk-meter-label risk-meter-label-high">High</div>
          </div>
          <motion.div 
            className="risk-meter-needle"
            initial={{ rotate: 0 }}
            animate={{ rotate: angle }}
            transition={{ type: "spring", stiffness: 60, damping: 10 }}
          />
        </div>
        <motion.div 
          className="fraud-probability"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <span>{(fraudProbability * 100).toFixed(1)}%</span>
          <span className="fraud-label">Risk</span>
        </motion.div>
      </div>
    );
  };

  // Animated feature importance visualization
  const FeatureImportance = () => {
    // These would be dynamic in a real model
    const features = [
      { name: 'Transaction Amount', importance: formData.transactionAmount > 1000 ? 0.8 : 0.4 },
      { name: 'Foreign Transaction', importance: formData.foreignTransaction ? 0.75 : 0.2 },
      { name: 'Distance From Home', importance: formData.distanceFromHome > 50 ? 0.7 : 0.3 },
      { name: 'Merchant Category', importance: formData.merchantCategory === 'online' ? 0.65 : 0.25 },
      { name: 'Time Since Last', importance: formData.timeSincePrevTransaction < 1 ? 0.6 : 0.15 },
      { name: 'Frequent Merchant', importance: formData.frequentMerchant ? 0.1 : 0.5 },
    ];
    
    return (
      <div className="feature-importance">
        <h3 className="text-xl font-semibold mb-4">Feature Importance</h3>
        <div className="feature-bars">
          {features.map((feature, index) => (
            <motion.div 
              key={feature.name}
              className="feature-bar-container"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
            >
              <div className="feature-name">{feature.name}</div>
              <div className="feature-bar-background">
                <motion.div 
                  className="feature-bar"
                  initial={{ width: 0 }}
                  animate={{ width: `${feature.importance * 100}%` }}
                  transition={{ duration: 1, type: "spring" }}
                  style={{ 
                    backgroundColor: 
                      feature.importance > 0.6 ? '#ef4444' : 
                      feature.importance > 0.3 ? '#facc15' : '#4ade80' 
                  }}
                />
              </div>
              <div className="feature-value">{(feature.importance * 100).toFixed(0)}%</div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // Transaction security score visualization
  const SecurityViolations = () => {
    const violations = [
      { 
        id: 'amount', 
        name: 'Unusual Amount', 
        active: formData.transactionAmount > 1000,
        icon: '💰'
      },
      { 
        id: 'location', 
        name: 'Unusual Location', 
        active: formData.distanceFromHome > 50,
        icon: '📍'
      },
      { 
        id: 'foreign', 
        name: 'Foreign Transaction', 
        active: formData.foreignTransaction,
        icon: '🌐'
      },
      { 
        id: 'merchant', 
        name: 'Unknown Merchant', 
        active: !formData.frequentMerchant,
        icon: '🏬'
      },
      { 
        id: 'timing', 
        name: 'Unusual Timing', 
        active: formData.timeSincePrevTransaction < 1,
        icon: '⏱️'
      },
    ];
    
    const activeViolations = violations.filter(v => v.active);
    
    return (
      <div className="security-violations">
        <h3 className="text-xl font-semibold mb-4">Security Alerts</h3>
        {activeViolations.length === 0 ? (
          <motion.div 
            className="no-violations"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="icon">✅</span>
            <span>No security alerts detected</span>
          </motion.div>
        ) : (
          <div className="violations-list">
            {activeViolations.map((violation, index) => (
              <motion.div 
                key={violation.id}
                className="violation-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
              >
                <span className="violation-icon">{violation.icon}</span>
                <span className="violation-name">{violation.name}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="logistic-regression-page">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: animatedElements.headerAnimation ? 1 : 0, y: animatedElements.headerAnimation ? 0 : -20 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold">{title}</h1>
          <p className="text-xl text-gray-600 mt-2">{description}</p>
          
          <motion.div 
            className="credit-card-animation"
            initial={{ rotate: -15, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <div className="credit-card">
              <div className="credit-card-chip"></div>
              <div className="credit-card-logo">
                <div className="cc-circle cc-circle-left"></div>
                <div className="cc-circle cc-circle-right"></div>
              </div>
              <div className="credit-card-number">•••• •••• •••• 1234</div>
              <div className="credit-card-info">
                <div>CARDHOLDER NAME</div>
                <div>VALID THRU: 12/25</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <motion.div 
            className="md:col-span-1 bg-white rounded-lg shadow-md"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: animatedElements.formAnimation ? 1 : 0, x: animatedElements.formAnimation ? 0 : -50 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Transaction Details</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Transaction Amount ($)</label>
                  <input
                    type="number"
                    name="transactionAmount"
                    value={formData.transactionAmount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    step="0.01"
                    required
                  />
                  <div className="fraud-meter mt-1">
                    <div className="fraud-meter-bar" style={{ 
                      width: `${Math.min(100, (formData.transactionAmount / 2000) * 100)}%`,
                      backgroundColor: getSliderColor(formData.transactionAmount, 2000)
                    }}></div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Merchant Category</label>
                  <select
                    name="merchantCategory"
                    value={formData.merchantCategory}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="retail">Retail</option>
                    <option value="online">Online</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="travel">Travel</option>
                    <option value="gaming">Gaming</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Hours Since Previous Transaction</label>
                  <input
                    type="number"
                    name="timeSincePrevTransaction"
                    value={formData.timeSincePrevTransaction}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    step="0.1"
                    required
                  />
                  <div className="fraud-meter mt-1">
                    <div className="fraud-meter-bar" style={{ 
                      width: `${Math.min(100, 100 - (formData.timeSincePrevTransaction / 72) * 100)}%`,
                      backgroundColor: getSliderColor(72 - formData.timeSincePrevTransaction, 72)
                    }}></div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Distance From Home (km)</label>
                  <input
                    type="number"
                    name="distanceFromHome"
                    value={formData.distanceFromHome}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    required
                  />
                  <div className="fraud-meter mt-1">
                    <div className="fraud-meter-bar" style={{ 
                      width: `${Math.min(100, (formData.distanceFromHome / 100) * 100)}%`,
                      backgroundColor: getSliderColor(formData.distanceFromHome, 100)
                    }}></div>
                  </div>
                </div>
                
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    name="foreignTransaction"
                    checked={formData.foreignTransaction}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-gray-700">Foreign Transaction</label>
                </div>
                
                <div className="mb-6 flex items-center">
                  <input
                    type="checkbox"
                    name="frequentMerchant"
                    checked={formData.frequentMerchant}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-gray-700">Frequent Merchant</label>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Analyzing...' : 'Analyze Transaction'}
                </button>
              </form>
            </div>
          </motion.div>
          
          <motion.div 
            className="md:col-span-2 bg-white rounded-lg shadow-md"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: animatedElements.resultAnimation && prediction ? 1 : 0, x: animatedElements.resultAnimation && prediction ? 0 : 50 }}
            transition={{ duration: 0.5 }}
          >
            {prediction && !prediction.error ? (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="prediction-result">
                    <h2 className="text-2xl font-semibold mb-6">Transaction Analysis</h2>
                    
                    <div className="text-center mb-8">
                      <div className={`prediction-tag ${prediction.prediction === 'fraud' ? 'prediction-fraud' : 'prediction-legitimate'}`}>
                        {prediction.prediction === 'fraud' ? 'Potentially Fraudulent' : 'Likely Legitimate'}
                      </div>
                      
                      <RiskMeter fraudProbability={prediction.probabilities?.fraud || prediction.confidence || 0} />
                    </div>
                    
                    <SecurityViolations />
                  </div>
                  
                  <div>
                    <FeatureImportance />
                    
                    <motion.div 
                      className="fraud-decision-tree mt-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      <h3 className="text-xl font-semibold mb-4">Decision Process</h3>
                      <div className="decision-path">
                        <div className="decision-node">
                          <div className="node-content">
                            <div className="node-question">Unusual amount?</div>
                            <div className="node-answer">{formData.transactionAmount > 1000 ? 'Yes' : 'No'}</div>
                          </div>
                          <div className="node-connector"></div>
                        </div>
                        <div className="decision-node">
                          <div className="node-content">
                            <div className="node-question">Foreign transaction?</div>
                            <div className="node-answer">{formData.foreignTransaction ? 'Yes' : 'No'}</div>
                          </div>
                          <div className="node-connector"></div>
                        </div>
                        <div className="decision-node">
                          <div className="node-content">
                            <div className="node-question">Unusual location?</div>
                            <div className="node-answer">{formData.distanceFromHome > 50 ? 'Yes' : 'No'}</div>
                          </div>
                          <div className="node-connector"></div>
                        </div>
                        <div className="decision-node">
                          <div className="node-content final-node">
                            <div className="node-question">Final Prediction</div>
                            <div className={`node-answer ${prediction.prediction === 'fraud' ? 'text-red-500' : 'text-green-500'}`}>
                              {prediction.prediction === 'fraud' ? 'Fraud Detected' : 'Transaction Safe'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center items-center h-full py-24">
                <div className="loading-animation">
                  <div className="loading-pulse"></div>
                  <div className="mt-4 text-gray-600">Analyzing transaction...</div>
                </div>
              </div>
            ) : prediction && prediction.error ? (
              <div className="p-6 text-center">
                <div className="text-red-500 text-xl mb-4">Error</div>
                <p>{prediction.error}</p>
                <button 
                  onClick={() => handleSubmit(new Event('submit') as any)}
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-full py-20 px-6 text-center">
                <motion.div 
                  className="placeholder-icon"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 5
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-16 h-16 text-indigo-300">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </motion.div>
                <h3 className="text-xl text-gray-600 mt-4">Enter transaction details and click 'Analyze Transaction'</h3>
                <p className="text-gray-500 mt-2 max-w-md">
                  Our logistic regression model will assess the risk level of the transaction based on multiple factors
                </p>
              </div>
            )}
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-12 bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: animatedElements.headerAnimation ? 1 : 0, y: animatedElements.headerAnimation ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold mb-4">About Logistic Regression</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="info-card">
              <div className="info-card-icon">📊</div>
              <h3 className="text-xl font-medium mb-2">How It Works</h3>
              <p>Logistic regression estimates the probability of a binary outcome based on one or more independent variables. It's perfect for fraud detection where the outcome is binary (fraud or legitimate).</p>
            </div>
            
            <div className="info-card">
              <div className="info-card-icon">🧮</div>
              <h3 className="text-xl font-medium mb-2">The Math</h3>
              <p>The algorithm uses a logistic function to transform its output to a probability between 0 and 1. It calculates p(Y=1) = 1/(1+e^-(b0+b1X1+b2X2+...)).</p>
            </div>
            
            <div className="info-card">
              <div className="info-card-icon">💳</div>
              <h3 className="text-xl font-medium mb-2">Fraud Detection</h3>
              <p>Credit card fraud detection uses logistic regression to analyze transaction patterns, flagging suspicious activities that deviate from normal behavior.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedLogisticRegressionPage; 