import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiService from '../../services/apiService';
import Navbar from '../layout/Navbar';
import './DecisionTree.css';

interface AnimatedDecisionTreePageProps {
  modelEndpoint: string;
  title: string;
  description: string;
}

interface FormData {
  income: number;
  credit_score: number;
  debt_to_income: number;
  loan_term: number;
  loan_amount: number;
}

interface PredictionResult {
  prediction: string;
  loan_approved?: boolean;
  confidence?: number;
  metrics?: {
    debt_to_income_ratio?: number;
    loan_to_income_ratio?: number;
    monthly_payment?: number;
    interest_rate?: number;
  };
  decision_path?: {
    nodes: Array<{
      question: string;
      answer: string | boolean;
    }>;
  };
  error?: string;
}

const AnimatedDecisionTreePage: React.FC<AnimatedDecisionTreePageProps> = ({
  modelEndpoint,
  title,
  description
}) => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    income: 70000,
    credit_score: 720,
    debt_to_income: 30,
    loan_term: 15,
    loan_amount: 250000
  });

  // Prediction state
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'calculator' | 'explanation'>('form');
  const [animationState, setAnimationState] = useState({
    headerVisible: false,
    formVisible: false,
    resultVisible: false,
    treeVisible: false
  });
  
  // Active tree node state for visualization
  const [activeNodePath, setActiveNodePath] = useState<number[]>([]);
  
  // Trigger animations when the component mounts
  useEffect(() => {
    setTimeout(() => setAnimationState(prev => ({ ...prev, headerVisible: true })), 300);
    setTimeout(() => setAnimationState(prev => ({ ...prev, formVisible: true })), 700);
    if (prediction) {
      setTimeout(() => setAnimationState(prev => ({ ...prev, resultVisible: true })), 300);
      animateDecisionTree();
    }
  }, [prediction]);
  
  // Animate the decision tree nodes sequentially
  const animateDecisionTree = () => {
    if (!prediction?.decision_path?.nodes) return;
    
    setActiveNodePath([]);
    setAnimationState(prev => ({ ...prev, treeVisible: true }));
    
    const nodeCount = prediction.decision_path.nodes.length;
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < nodeCount) {
        setActiveNodePath(prev => [...prev, currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 800);
    
    return () => clearInterval(interval);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
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
      treeVisible: false 
    }));
    
    try {
      const result = await apiService.makePrediction<PredictionResult>(
        modelEndpoint,
        formData
      );
      
      setPrediction(result);
      setTimeout(() => setAnimationState(prev => ({ ...prev, resultVisible: true })), 300);
    } catch (error) {
      console.error('Error making prediction:', error);
      setPrediction({
        prediction: 'Error',
        error: 'Failed to make prediction. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate loan metrics for the calculator tab
  const calculateLoanMetrics = () => {
    const loanAmount = formData.loan_amount;
    const annualRate = formData.credit_score >= 740 ? 0.0375 : 
                      formData.credit_score >= 700 ? 0.0425 : 
                      formData.credit_score >= 660 ? 0.0475 : 0.055;
    const termYears = formData.loan_term;
    const monthlyRate = annualRate / 12;
    const totalPayments = termYears * 12;
    
    // Calculate monthly payment using the loan formula
    const monthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalPayments));
    
    // Calculate total interest
    const totalInterest = (monthlyPayment * totalPayments) - loanAmount;
    
    // Calculate debt-to-income ratio
    const monthlyIncome = formData.income / 12;
    const currentDebt = (formData.debt_to_income / 100) * monthlyIncome;
    const debtToIncomeRatio = ((currentDebt + monthlyPayment) / monthlyIncome) * 100;
    
    // Loan-to-income ratio
    const loanToIncomeRatio = loanAmount / formData.income;
    
    return {
      monthly_payment: monthlyPayment,
      total_interest: totalInterest,
      annual_rate: annualRate * 100,
      debt_to_income_ratio: debtToIncomeRatio,
      loan_to_income_ratio: loanToIncomeRatio
    };
  };

  return (
    <div className="decision-tree-page">
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
          
          {/* Money animation */}
          <motion.div 
            className="money-animation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="money">100</div>
            <div className="money">500</div>
            <div className="money">1000</div>
            <div className="money">5000</div>
            <div className="money">10000</div>
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
                Loan Application
              </button>
              <button 
                className={`tab-button ${activeTab === 'calculator' ? 'active' : ''}`}
                onClick={() => setActiveTab('calculator')}
              >
                Calculator
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
                  <h2 className="text-2xl font-semibold mb-4">Loan Application</h2>
                  
                  <div className="field-group">
                    <div className="field">
                      <label className="field-label">Annual Income ($)</label>
                      <input
                        type="number"
                        name="income"
                        value={formData.income}
                        onChange={handleInputChange}
                        className={`field-input ${formData.income < 30000 ? 'danger' : formData.income < 50000 ? 'warning' : 'success'}`}
                        min="0"
                        required
                      />
                    </div>
                    <div className="field">
                      <label className="field-label">Credit Score</label>
                      <input
                        type="number"
                        name="credit_score"
                        value={formData.credit_score}
                        onChange={handleInputChange}
                        className={`field-input ${formData.credit_score < 620 ? 'danger' : formData.credit_score < 680 ? 'warning' : 'success'}`}
                        min="300"
                        max="850"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="field-group">
                    <div className="field">
                      <label className="field-label">Debt-to-Income Ratio (%)</label>
                      <input
                        type="number"
                        name="debt_to_income"
                        value={formData.debt_to_income}
                        onChange={handleInputChange}
                        className={`field-input ${formData.debt_to_income > 50 ? 'danger' : formData.debt_to_income > 35 ? 'warning' : 'success'}`}
                        min="0"
                        max="100"
                        required
                      />
                    </div>
                    <div className="field">
                      <label className="field-label">Loan Term (years)</label>
                      <input
                        type="number"
                        name="loan_term"
                        value={formData.loan_term}
                        onChange={handleInputChange}
                        className="field-input"
                        min="1"
                        max="30"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="field-group-single">
                    <div className="field">
                      <label className="field-label">Loan Amount ($)</label>
                      <input
                        type="number"
                        name="loan_amount"
                        value={formData.loan_amount}
                        onChange={handleInputChange}
                        className={`field-input ${formData.loan_amount > formData.income * 5 ? 'danger' : formData.loan_amount > formData.income * 3 ? 'warning' : 'success'}`}
                        min="1000"
                        required
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Submit Application'}
                  </button>
                </form>
              )}
              
              {activeTab === 'calculator' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Loan Calculator</h2>
                  
                  {/* Calculate metrics based on current form inputs */}
                  {(() => {
                    const metrics = calculateLoanMetrics();
                    return (
                      <div>
                        <div className="metrics-container">
                          <div className="metric-card">
                            <div className="metric-title">Monthly Payment</div>
                            <div className="metric-value">${Math.round(metrics.monthly_payment).toLocaleString()}</div>
                          </div>
                          <div className="metric-card">
                            <div className="metric-title">Interest Rate</div>
                            <div className="metric-value">{metrics.annual_rate.toFixed(2)}%</div>
                          </div>
                          <div className="metric-card">
                            <div className="metric-title">Total Interest</div>
                            <div className="metric-value">${Math.round(metrics.total_interest).toLocaleString()}</div>
                          </div>
                          <div className="metric-card">
                            <div className="metric-title">Debt-to-Income Ratio</div>
                            <div className="metric-value">{metrics.debt_to_income_ratio.toFixed(1)}%</div>
                          </div>
                        </div>
                        
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <h3 className="font-medium text-lg mb-2">Loan Assessment</h3>
                          <ul className="space-y-2">
                            <li className={`flex items-center ${metrics.debt_to_income_ratio > 43 ? 'text-red-500' : 'text-green-500'}`}>
                              <span className="mr-2">
                                {metrics.debt_to_income_ratio > 43 ? '❌' : '✅'}
                              </span>
                              <span>Debt-to-Income Ratio {metrics.debt_to_income_ratio > 43 ? 'exceeds' : 'within'} recommended maximum (43%)</span>
                            </li>
                            <li className={`flex items-center ${metrics.loan_to_income_ratio > 4 ? 'text-red-500' : 'text-green-500'}`}>
                              <span className="mr-2">
                                {metrics.loan_to_income_ratio > 4 ? '❌' : '✅'}
                              </span>
                              <span>Loan-to-Income Ratio {metrics.loan_to_income_ratio > 4 ? 'exceeds' : 'within'} recommended maximum (4.0)</span>
                            </li>
                            <li className={`flex items-center ${formData.credit_score < 660 ? 'text-red-500' : 'text-green-500'}`}>
                              <span className="mr-2">
                                {formData.credit_score < 660 ? '❌' : '✅'}
                              </span>
                              <span>Credit Score {formData.credit_score < 660 ? 'below' : 'above'} recommended minimum (660)</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="mt-4">
                    <button
                      onClick={() => setActiveTab('form')}
                      className="submit-button"
                    >
                      Apply for Loan
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'explanation' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">How Decision Trees Work</h2>
                  
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      Decision trees make predictions by asking a series of yes/no questions about your data, following a path until reaching a final decision.
                    </p>
                    
                    <h3 className="text-lg font-medium">Loan Approval Process:</h3>
                    
                    <div className="space-y-3 mt-4">
                      <div className="path-step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                          <div className="step-question">Evaluate Credit Score</div>
                          <div className="step-answer">Is the applicant's credit score above 680?</div>
                        </div>
                      </div>
                      
                      <div className="path-step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                          <div className="step-question">Assess Debt-to-Income Ratio</div>
                          <div className="step-answer">Is the debt-to-income ratio below 43%?</div>
                        </div>
                      </div>
                      
                      <div className="path-step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                          <div className="step-question">Check Loan-to-Income Ratio</div>
                          <div className="step-answer">Is the loan amount less than 5x annual income?</div>
                        </div>
                      </div>
                      
                      <div className="path-step">
                        <div className="step-number">4</div>
                        <div className="step-content">
                          <div className="step-question">Final Decision</div>
                          <div className="step-answer">Approve or reject based on combined factors</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Right column - Results */}
          <motion.div 
            className="md:col-span-7 bg-white rounded-lg shadow-md"
            initial={{ opacity: 0, x: 50 }}
            animate={{ 
              opacity: animationState.resultVisible && prediction ? 1 : 0, 
              x: animationState.resultVisible && prediction ? 0 : 50 
            }}
            transition={{ duration: 0.5 }}
          >
            {prediction && !prediction.error ? (
              <div className="result-container">
                <div className={`result-badge ${prediction.loan_approved ? 'result-badge-approved' : 'result-badge-rejected'}`}>
                  {prediction.loan_approved ? 'Loan Approved' : 'Loan Rejected'}
                </div>
                
                <p className="text-gray-600 text-lg">
                  Our decision tree algorithm has {prediction.loan_approved ? 'approved' : 'rejected'} your loan application
                  with {(prediction.confidence! * 100).toFixed(0)}% confidence.
                </p>
                
                {/* Decision tree visualization */}
                {prediction.decision_path && (
                  <motion.div 
                    className="decision-tree-container"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: animationState.treeVisible ? 1 : 0
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="text-xl font-semibold mb-4 text-left">Decision Path</h3>
                    
                    <div className="tree-diagram">
                      {/* Root node */}
                      <div className="tree-level">
                        <motion.div 
                          className={`tree-node root ${activeNodePath.includes(0) ? 'active' : ''}`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: activeNodePath.includes(0) ? 1 : 0.8, opacity: activeNodePath.includes(0) ? 1 : 0.6 }}
                        >
                          Loan Application
                          <div className="tree-connection"></div>
                        </motion.div>
                      </div>
                      
                      {/* First level - Credit Score */}
                      <div className="tree-level">
                        <motion.div 
                          className={`tree-node condition ${activeNodePath.includes(1) ? 'active' : ''}`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: activeNodePath.includes(1) ? 1 : 0.8, opacity: activeNodePath.includes(1) ? 1 : 0.6 }}
                          transition={{ delay: 0.2 }}
                        >
                          Credit Score<br/>{formData.credit_score >= 680 ? '≥ 680 ✓' : '< 680 ✗'}
                          <div className="tree-connection"></div>
                        </motion.div>
                      </div>
                      
                      {/* Second level - DTI */}
                      <div className="tree-level">
                        <motion.div 
                          className={`tree-node condition ${activeNodePath.includes(2) ? 'active' : ''}`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: activeNodePath.includes(2) ? 1 : 0.8, opacity: activeNodePath.includes(2) ? 1 : 0.6 }}
                          transition={{ delay: 0.4 }}
                        >
                          DTI Ratio<br/>{formData.debt_to_income <= 43 ? '≤ 43% ✓' : '> 43% ✗'}
                          <div className="tree-connection"></div>
                        </motion.div>
                      </div>
                      
                      {/* Third level - Loan Amount */}
                      <div className="tree-level">
                        <motion.div 
                          className={`tree-node condition ${activeNodePath.includes(3) ? 'active' : ''}`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: activeNodePath.includes(3) ? 1 : 0.8, opacity: activeNodePath.includes(3) ? 1 : 0.6 }}
                          transition={{ delay: 0.6 }}
                        >
                          Loan-to-Income<br/>{(formData.loan_amount / formData.income) <= 5 ? '≤ 5x ✓' : '> 5x ✗'}
                          <div className="tree-connection"></div>
                        </motion.div>
                      </div>
                      
                      {/* Final level - Decision */}
                      <div className="tree-level">
                        <motion.div 
                          className={`tree-node leaf ${prediction.loan_approved ? 'approve' : 'reject'} ${activeNodePath.includes(4) ? 'active' : ''}`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: activeNodePath.includes(4) ? 1 : 0.8, opacity: activeNodePath.includes(4) ? 1 : 0 }}
                          transition={{ delay: 0.8 }}
                        >
                          {prediction.loan_approved ? 'Approve Loan' : 'Reject Loan'}
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Decision path in text form */}
                    <div className="decision-path mt-8">
                      {prediction.decision_path.nodes.map((node, index) => (
                        <div className="path-step" key={index}>
                          <div className="step-number">{index + 1}</div>
                          <div className="step-content">
                            <div className="step-question">{node.question}</div>
                            <div className={`step-answer ${typeof node.answer === 'boolean' ? (node.answer ? 'yes-answer' : 'no-answer') : ''}`}>
                              {typeof node.answer === 'boolean' 
                                ? (node.answer ? 'Yes' : 'No') 
                                : node.answer}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {/* Loan details */}
                <motion.div 
                  className="result-details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <h3 className="text-xl font-semibold mb-4 text-left">Loan Details</h3>
                  
                  <div className="metrics-container">
                    <div className="metric-card">
                      <div className="metric-title">Monthly Payment</div>
                      <div className="metric-value">
                        ${Math.round(prediction.metrics?.monthly_payment || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-title">Interest Rate</div>
                      <div className="metric-value">
                        {(prediction.metrics?.interest_rate || 0).toFixed(2)}%
                      </div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-title">Debt-to-Income Ratio</div>
                      <div className="metric-value">
                        {(prediction.metrics?.debt_to_income_ratio || 0).toFixed(1)}%
                      </div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-title">Loan-to-Income Ratio</div>
                      <div className="metric-value">
                        {(prediction.metrics?.loan_to_income_ratio || 0).toFixed(2)}x
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center items-center h-full py-24">
                <div className="loading-animation">
                  <div className="loading-spinner"></div>
                  <div className="mt-6 text-gray-600">Processing loan application...</div>
                </div>
              </div>
            ) : prediction && prediction.error ? (
              <div className="p-6 text-center">
                <div className="text-red-500 text-xl mb-4">Error</div>
                <p>{prediction.error}</p>
                <button 
                  onClick={() => handleSubmit(new Event('submit') as any)}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </motion.div>
                <h3 className="text-xl text-gray-600">Submit a loan application to get started</h3>
                <p className="text-gray-500 mt-2 max-w-md">
                  Our decision tree algorithm will analyze your information and provide an instant loan decision
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
          <h2 className="text-2xl font-semibold mb-6">Applications of Decision Trees</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="application-card">
              <div className="application-icon">🏦</div>
              <h3 className="text-xl font-medium mb-2">Loan Approval</h3>
              <p>Evaluate loan applications based on credit score, income, and other financial factors.</p>
            </div>
            
            <div className="application-card">
              <div className="application-icon">🩺</div>
              <h3 className="text-xl font-medium mb-2">Medical Diagnosis</h3>
              <p>Support medical professionals in diagnosing diseases based on symptoms and test results.</p>
            </div>
            
            <div className="application-card">
              <div className="application-icon">📊</div>
              <h3 className="text-xl font-medium mb-2">Customer Segmentation</h3>
              <p>Categorize customers based on purchasing behavior, demographics, and preferences.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedDecisionTreePage; 