import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiService from '../../services/apiService';
import Navbar from '../layout/Navbar';
import './MultipleLinearRegression.css';

interface AnimatedMultipleLinearRegressionPageProps {
  modelEndpoint: string;
  title: string;
  description: string;
}

interface FormData {
  age: number;
  bmi: number;
  smoker: number;
}

interface PredictionResult {
  prediction: number;
  explanation?: string;
  r2_score?: number;
  error?: string;
}

const AnimatedMultipleLinearRegressionPage: React.FC<AnimatedMultipleLinearRegressionPageProps> = ({
  modelEndpoint,
  title,
  description
}) => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    age: 35,
    bmi: 25,
    smoker: 0
  });

  // Prediction state
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'formula' | 'explanation'>('form');
  const [animationState, setAnimationState] = useState({
    headerVisible: false,
    formVisible: false,
    resultVisible: false,
    factorBarsVisible: false,
    formulaVisible: false
  });
  
  // Highlighted formula part
  const [highlightedFormulaPart, setHighlightedFormulaPart] = useState<'age' | 'bmi' | 'smoker' | 'base' | null>(null);
  
  // Calculated contributions for the visualization
  const [factorContributions, setFactorContributions] = useState({
    age: 0,
    bmi: 0,
    smoker: 0,
    base: 0,
    total: 0
  });
  
  // Trigger animations when the component mounts
  useEffect(() => {
    setTimeout(() => setAnimationState(prev => ({ ...prev, headerVisible: true })), 300);
    setTimeout(() => setAnimationState(prev => ({ ...prev, formVisible: true })), 700);
    if (prediction) {
      setTimeout(() => setAnimationState(prev => ({ ...prev, resultVisible: true })), 300);
      setTimeout(() => setAnimationState(prev => ({ ...prev, factorBarsVisible: true })), 1000);
      setTimeout(() => setAnimationState(prev => ({ ...prev, formulaVisible: true })), 1500);
      animateFormulaParts();
    }
  }, [prediction]);
  
  // Animate formula parts sequentially
  const animateFormulaParts = () => {
    if (!prediction) return;
    
    const parts = ['age', 'bmi', 'smoker', 'base'] as const;
    let currentIndex = 0;
    
    setHighlightedFormulaPart(null);
    
    const interval = setInterval(() => {
      if (currentIndex < parts.length) {
        setHighlightedFormulaPart(parts[currentIndex]);
        currentIndex++;
      } else {
        setHighlightedFormulaPart(null);
        clearInterval(interval);
      }
    }, 800);
    
    return () => clearInterval(interval);
  };

  // Handle form input changes
  const handleInputChange = (name: keyof FormData, value: number) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPrediction(null);
    setAnimationState(prev => ({ 
      ...prev, 
      resultVisible: false,
      factorBarsVisible: false,
      formulaVisible: false
    }));
    
    try {
      const result = await apiService.makePrediction<PredictionResult>(
        modelEndpoint,
        formData
      );
      
      setPrediction(result);
      
      // Calculate factor contributions for visualization
      const ageContribution = formData.age * 100;
      const bmiContribution = formData.bmi * 200;
      const smokerContribution = formData.smoker * 5000;
      const baseContribution = 2000;
      const total = ageContribution + bmiContribution + smokerContribution + baseContribution;
      
      setFactorContributions({
        age: ageContribution,
        bmi: bmiContribution,
        smoker: smokerContribution,
        base: baseContribution,
        total: total
      });
      
      setTimeout(() => setAnimationState(prev => ({ ...prev, resultVisible: true })), 300);
    } catch (error) {
      console.error('Error making prediction:', error);
      setPrediction({
        prediction: 0,
        error: 'Failed to make prediction. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format currency value
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="multiple-linear-regression-page">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="page-header text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: animationState.headerVisible ? 1 : 0, 
            y: animationState.headerVisible ? 0 : -20 
          }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
          <p className="text-xl text-gray-600 mt-2 max-w-3xl mx-auto">{description}</p>
          
          {/* Medical icons animation */}
          <motion.div 
            className="medical-icons-animation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="medical-icon">💊</div>
            <div className="medical-icon">🩺</div>
            <div className="medical-icon">🏥</div>
            <div className="medical-icon">💉</div>
            <div className="medical-icon">🧪</div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left column - Form */}
          <motion.div 
            className="md:col-span-5 bg-white rounded-lg shadow-md overflow-hidden"
            initial={{ opacity: 0, x: -50 }}
            animate={{ 
              opacity: animationState.formVisible ? 1 : 0, 
              x: animationState.formVisible ? 0 : -50 
            }}
            transition={{ duration: 0.5 }}
          >
            <div className="tab-navigation bg-gray-50 border-b flex">
              <button 
                className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
                onClick={() => setActiveTab('form')}
              >
                Patient Data
              </button>
              <button 
                className={`tab-button ${activeTab === 'formula' ? 'active' : ''}`}
                onClick={() => setActiveTab('formula')}
              >
                Formula
              </button>
              <button 
                className={`tab-button ${activeTab === 'explanation' ? 'active' : ''}`}
                onClick={() => setActiveTab('explanation')}
              >
                How It Works
              </button>
            </div>
            
            <div className="form-container">
              {activeTab === 'form' && (
                <form onSubmit={handleSubmit}>
                  <h2 className="text-2xl font-semibold mb-4">Patient Information</h2>
                  
                  <div className="field-group-single">
                    <div className="field">
                      <label className="field-label">Age</label>
                      <input
                        type="range"
                        className="range-slider"
                        min="18"
                        max="80"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                      />
                      <div className="flex justify-between">
                        <span className="slider-value">18</span>
                        <span className="slider-value font-medium">{formData.age} years</span>
                        <span className="slider-value">80</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="field-group-single">
                    <div className="field">
                      <label className="field-label">BMI (Body Mass Index)</label>
                      <input
                        type="range"
                        className="range-slider"
                        min="15"
                        max="40"
                        step="0.1"
                        value={formData.bmi}
                        onChange={(e) => handleInputChange('bmi', parseFloat(e.target.value))}
                      />
                      <div className="flex justify-between">
                        <span className="slider-value">15</span>
                        <span className={`slider-value font-medium ${
                          formData.bmi < 18.5 ? 'text-blue-500' :
                          formData.bmi < 25 ? 'text-green-500' :
                          formData.bmi < 30 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>
                          {formData.bmi.toFixed(1)} {
                            formData.bmi < 18.5 ? '(Underweight)' :
                            formData.bmi < 25 ? '(Normal)' :
                            formData.bmi < 30 ? '(Overweight)' :
                            '(Obese)'
                          }
                        </span>
                        <span className="slider-value">40</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="field-group-single">
                    <div className="field">
                      <label className="field-label">Smoker</label>
                      <div className="flex gap-4 mt-2">
                        <label className={`flex-1 cursor-pointer p-3 border rounded-md text-center transition-all ${formData.smoker === 0 ? 'bg-green-50 border-green-500 font-medium' : 'border-gray-300'}`}>
                          <input
                            type="radio"
                            name="smoker"
                            className="hidden"
                            checked={formData.smoker === 0}
                            onChange={() => handleInputChange('smoker', 0)}
                          />
                          No
                        </label>
                        <label className={`flex-1 cursor-pointer p-3 border rounded-md text-center transition-all ${formData.smoker === 1 ? 'bg-red-50 border-red-500 font-medium' : 'border-gray-300'}`}>
                          <input
                            type="radio"
                            name="smoker"
                            className="hidden"
                            checked={formData.smoker === 1}
                            onChange={() => handleInputChange('smoker', 1)}
                          />
                          Yes
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Calculate Medical Costs'}
                  </button>
                </form>
              )}
              
              {activeTab === 'formula' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Cost Prediction Formula</h2>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="mb-3">For our multiple linear regression model, we use the following formula to predict medical costs:</p>
                    
                    <div className="formula">
                      <code>Medical Cost = (Age × 100) + (BMI × 200) + (Smoker × 5000) + 2000</code>
                    </div>
                    
                    <p className="mt-3 text-sm text-gray-600">
                      Each factor contributes differently to the final cost. Being a smoker has the largest 
                      impact, followed by BMI and then age. The +2000 term is the base cost.
                    </p>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-2">With your data:</h3>
                    
                    <div className="formula">
                      <code>Medical Cost = ({formData.age} × 100) + ({formData.bmi.toFixed(1)} × 200) + ({formData.smoker} × 5000) + 2000</code>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setActiveTab('form')}
                        className="submit-button"
                      >
                        Calculate Medical Costs
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'explanation' && (
                <div className="explanation-content">
                  <h2 className="text-2xl font-semibold mb-4">How Multiple Linear Regression Works</h2>
                  
                  <div className="space-y-6">
                    <p>
                      Multiple Linear Regression predicts an outcome variable based on two or more explanatory variables, 
                      finding the best-fitting straight line through the observed data points.
                    </p>
                    
                    <div className="explanation-step">
                      <div className="step-number">1</div>
                      <div>
                        <strong>Collect data</strong> including the target variable (medical cost) and all predictor 
                        variables (age, BMI, smoking status, etc.)
                      </div>
                    </div>
                    
                    <div className="explanation-step">
                      <div className="step-number">2</div>
                      <div>
                        <strong>Find coefficients</strong> that minimize the difference between predicted and actual values.
                        <div className="formula">
                          Y = β₀ + β₁X₁ + β₂X₂ + β₃X₃ + ... + ε
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Where Y is the target variable, β₀ is the intercept, β₁, β₂, etc. are coefficients, 
                          X₁, X₂, etc. are the predictor variables, and ε is the error term.
                        </div>
                      </div>
                    </div>
                    
                    <div className="explanation-step">
                      <div className="step-number">3</div>
                      <div>
                        <strong>For our medical cost prediction:</strong>
                        <div className="formula">
                          Cost = 2000 + 100×(Age) + 200×(BMI) + 5000×(Smoker)
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="csv-example-card">
                    <div className="csv-example-title">CSV Format Example:</div>
                    <div className="csv-example-content">age,bmi,smoker
25,22.5,0
42,30.2,1
35,24.7,0</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Right column - Results */}
          <motion.div 
            className="md:col-span-7 bg-white rounded-lg shadow-md overflow-hidden"
            initial={{ opacity: 0, x: 50 }}
            animate={{ 
              opacity: animationState.resultVisible && prediction ? 1 : 0, 
              x: animationState.resultVisible && prediction ? 0 : 50 
            }}
            transition={{ duration: 0.5 }}
          >
            {prediction && !prediction.error ? (
              <div className="result-container">
                {/* Medical Card */}
                <motion.div 
                  className="medical-card"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="medical-card-header">
                    <div className="medical-card-logo">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <div className="medical-card-title">Healthcare Cost Estimate</div>
                      <div className="text-gray-500 text-sm">Patient: <span className="font-medium">Age {formData.age}{formData.smoker === 1 ? ', Smoker' : ''}</span></div>
                    </div>
                  </div>
                  
                  <div className="medical-card-stripe"></div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <div className="text-gray-500 text-sm">Patient Details</div>
                      <div className="mt-1">
                        <div>Age: <span className="font-medium">{formData.age} years</span></div>
                        <div>BMI: <span className="font-medium">{formData.bmi.toFixed(1)}</span></div>
                        <div>Smoker: <span className="font-medium">{formData.smoker ? 'Yes' : 'No'}</span></div>
                      </div>
                    </div>
                    <div>
                      <div className="medical-card-cost-label">Estimated Cost</div>
                      <div className="medical-card-cost">{formatCurrency(prediction.prediction)}</div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Factor Breakdown */}
                <motion.div 
                  className="factor-bar-container"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: animationState.factorBarsVisible ? 1 : 0, 
                    y: animationState.factorBarsVisible ? 0 : 20 
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="factor-bar-title">Cost Breakdown</h3>
                  
                  <div className="factor-bar">
                    <div className="factor-name">Age</div>
                    <div className="factor-track">
                      <motion.div 
                        className="factor-fill age"
                        initial={{ width: 0 }}
                        animate={{ width: `${(factorContributions.age / factorContributions.total) * 100}%` }}
                        transition={{ duration: 1, delay: 0.1 }}
                      ></motion.div>
                    </div>
                    <div className="factor-value">{formatCurrency(factorContributions.age)}</div>
                  </div>
                  
                  <div className="factor-bar">
                    <div className="factor-name">BMI</div>
                    <div className="factor-track">
                      <motion.div 
                        className="factor-fill bmi"
                        initial={{ width: 0 }}
                        animate={{ width: `${(factorContributions.bmi / factorContributions.total) * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      ></motion.div>
                    </div>
                    <div className="factor-value">{formatCurrency(factorContributions.bmi)}</div>
                  </div>
                  
                  <div className="factor-bar">
                    <div className="factor-name">Smoker</div>
                    <div className="factor-track">
                      <motion.div 
                        className="factor-fill smoker"
                        initial={{ width: 0 }}
                        animate={{ width: `${(factorContributions.smoker / factorContributions.total) * 100}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                      ></motion.div>
                    </div>
                    <div className="factor-value">{formatCurrency(factorContributions.smoker)}</div>
                  </div>
                  
                  <div className="factor-bar">
                    <div className="factor-name">Base Cost</div>
                    <div className="factor-track">
                      <motion.div 
                        className="factor-fill base"
                        initial={{ width: 0 }}
                        animate={{ width: `${(factorContributions.base / factorContributions.total) * 100}%` }}
                        transition={{ duration: 1, delay: 0.4 }}
                      ></motion.div>
                    </div>
                    <div className="factor-value">{formatCurrency(factorContributions.base)}</div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="factor-bar">
                      <div className="factor-name font-semibold">Total</div>
                      <div className="flex-grow"></div>
                      <div className="factor-value font-semibold">{formatCurrency(factorContributions.total)}</div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Formula Visualization */}
                <motion.div 
                  className="formula-visualization"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: animationState.formulaVisible ? 1 : 0, 
                    y: animationState.formulaVisible ? 0 : 20 
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="formula-title">Prediction Formula</h3>
                  
                  <div className="formula-container">
                    <motion.div 
                      className={`formula-part base ${highlightedFormulaPart === 'base' ? 'highlight' : ''}`}
                      animate={{ scale: highlightedFormulaPart === 'base' ? 1.1 : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      2000
                    </motion.div>
                    
                    <span>+</span>
                    
                    <motion.div 
                      className={`formula-part age ${highlightedFormulaPart === 'age' ? 'highlight' : ''}`}
                      animate={{ scale: highlightedFormulaPart === 'age' ? 1.1 : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      ({formData.age} × 100)
                    </motion.div>
                    
                    <span>+</span>
                    
                    <motion.div 
                      className={`formula-part bmi ${highlightedFormulaPart === 'bmi' ? 'highlight' : ''}`}
                      animate={{ scale: highlightedFormulaPart === 'bmi' ? 1.1 : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      ({formData.bmi.toFixed(1)} × 200)
                    </motion.div>
                    
                    <span>+</span>
                    
                    <motion.div 
                      className={`formula-part smoker ${highlightedFormulaPart === 'smoker' ? 'highlight' : ''}`}
                      animate={{ scale: highlightedFormulaPart === 'smoker' ? 1.1 : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      ({formData.smoker} × 5000)
                    </motion.div>
                    
                    <span>=</span>
                    
                    <motion.div className="formula-part result">
                      {formatCurrency(prediction.prediction)}
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center items-center h-full py-24">
                <div className="loading-animation">
                  <div className="loading-spinner"></div>
                  <div className="mt-6 text-gray-600">Calculating medical costs...</div>
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
              <div className="flex flex-col justify-center items-center h-full py-24 px-6 text-center">
                <motion.div 
                  className="w-20 h-20 mb-6"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 5
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </motion.div>
                <h3 className="text-xl text-gray-600">Enter patient data to estimate medical costs</h3>
                <p className="text-gray-500 mt-2 max-w-md">
                  Our multiple linear regression model will analyze factors like age, BMI and smoking status to predict healthcare costs
                </p>
              </div>
            )}
          </motion.div>
        </div>
        
        {/* Applications Section */}
        <motion.div 
          className="mt-12 bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: animationState.headerVisible ? 1 : 0, 
            y: animationState.headerVisible ? 0 : 20 
          }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold mb-6">Applications of Multiple Linear Regression</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="application-card">
              <div className="application-icon">🏥</div>
              <h3 className="text-xl font-medium mb-2">Healthcare Costs</h3>
              <p>Predict medical expenses based on patient factors like age, BMI, and lifestyle choices.</p>
            </div>
            
            <div className="application-card">
              <div className="application-icon">🏠</div>
              <h3 className="text-xl font-medium mb-2">Real Estate Pricing</h3>
              <p>Estimate property values using features like location, size, age, and number of rooms.</p>
            </div>
            
            <div className="application-card">
              <div className="application-icon">📊</div>
              <h3 className="text-xl font-medium mb-2">Sales Forecasting</h3>
              <p>Project future sales based on advertising budget, seasonality, and economic indicators.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedMultipleLinearRegressionPage; 