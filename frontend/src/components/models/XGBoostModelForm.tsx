import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import apiService, { PredictionResult } from '../../services/apiService';
import LoadingSpinner from '../ui/LoadingSpinner';

interface XGBoostResult extends PredictionResult {
  prediction: string;
  probability: number;
  feature_importance?: Record<string, number>;
}

interface XGBoostModelFormProps {
  modelEndpoint: string;
  title?: string;
  description?: string;
}

const XGBoostModelForm: React.FC<XGBoostModelFormProps> = ({ modelEndpoint }) => {
  const [formData, setFormData] = useState({
    age: 35,
    income: 55000,
    creditScore: 680,
    accountAge: 5,
    numTransactions: 120,
    avgTransactionAmount: 150,
    hasLoan: 'no',
    education: 'bachelors',
    occupation: 'professional'
  });
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<XGBoostResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const formRef = useRef<HTMLFormElement>(null);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Convert number inputs to numbers
    const parsedValue = type === 'number' ? parseFloat(value) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
    
    // Clear previous results when form is changed
    setResult(null);
    setError(null);
  };
  
  // Form validation
  const validateForm = (): boolean => {
    // Check if any numeric fields are NaN
    const numericFields = ['age', 'income', 'creditScore', 'accountAge', 'numTransactions', 'avgTransactionAmount'];
    for (const field of numericFields) {
      if (isNaN(formData[field as keyof typeof formData] as number)) {
        setError(`Invalid value for ${field}`);
        return false;
      }
    }
    
    return true;
  };
  
  // Submit form data for prediction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Call the API with form data
      const response = await apiService.makePrediction<XGBoostResult>(modelEndpoint, formData);
      
      if ('error' in response && response.error) {
        setError(response.error);
      } else {
        setResult(response);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Use sample data
  const useSampleData = () => {
    const samples = [
      {
        age: 42,
        income: 78000,
        creditScore: 720,
        accountAge: 8,
        numTransactions: 250,
        avgTransactionAmount: 180,
        hasLoan: 'yes',
        education: 'masters',
        occupation: 'executive'
      },
      {
        age: 23,
        income: 35000,
        creditScore: 620,
        accountAge: 1,
        numTransactions: 75,
        avgTransactionAmount: 65,
        hasLoan: 'no',
        education: 'high_school',
        occupation: 'student'
      },
      {
        age: 65,
        income: 95000,
        creditScore: 780,
        accountAge: 15,
        numTransactions: 50,
        avgTransactionAmount: 350,
        hasLoan: 'no',
        education: 'bachelors',
        occupation: 'retired'
      }
    ];
    
    const randomSample = samples[Math.floor(Math.random() * samples.length)];
    setFormData(randomSample);
    setResult(null);
    setError(null);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        className="bg-white shadow-xl rounded-lg p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-green-800 mb-4">XGBoost Prediction Model</h2>
        <p className="text-gray-600 mb-6">
          This advanced model predicts customer behavior using the XGBoost algorithm, which combines multiple decision trees for superior accuracy.
        </p>
        
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Age Input */}
            <motion.div 
              className="form-group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <label className="block text-green-700 font-medium mb-2" htmlFor="age">
                Age
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                min="18"
                max="100"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                required
              />
            </motion.div>
            
            {/* Income Input */}
            <motion.div 
              className="form-group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <label className="block text-green-700 font-medium mb-2" htmlFor="income">
                Annual Income ($)
              </label>
              <input
                type="number"
                id="income"
                name="income"
                value={formData.income}
                onChange={handleInputChange}
                min="0"
                step="1000"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                required
              />
            </motion.div>
            
            {/* Credit Score Input */}
            <motion.div 
              className="form-group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <label className="block text-green-700 font-medium mb-2" htmlFor="creditScore">
                Credit Score
              </label>
              <input
                type="number"
                id="creditScore"
                name="creditScore"
                value={formData.creditScore}
                onChange={handleInputChange}
                min="300"
                max="850"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                required
              />
            </motion.div>
            
            {/* Account Age Input */}
            <motion.div 
              className="form-group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <label className="block text-green-700 font-medium mb-2" htmlFor="accountAge">
                Account Age (years)
              </label>
              <input
                type="number"
                id="accountAge"
                name="accountAge"
                value={formData.accountAge}
                onChange={handleInputChange}
                min="0"
                max="50"
                step="1"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                required
              />
            </motion.div>
            
            {/* Number of Transactions Input */}
            <motion.div 
              className="form-group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <label className="block text-green-700 font-medium mb-2" htmlFor="numTransactions">
                Monthly Transactions
              </label>
              <input
                type="number"
                id="numTransactions"
                name="numTransactions"
                value={formData.numTransactions}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                required
              />
            </motion.div>
            
            {/* Average Transaction Amount Input */}
            <motion.div 
              className="form-group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <label className="block text-green-700 font-medium mb-2" htmlFor="avgTransactionAmount">
                Avg. Transaction Amount ($)
              </label>
              <input
                type="number"
                id="avgTransactionAmount"
                name="avgTransactionAmount"
                value={formData.avgTransactionAmount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                required
              />
            </motion.div>
            
            {/* Has Loan Select */}
            <motion.div 
              className="form-group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <label className="block text-green-700 font-medium mb-2" htmlFor="hasLoan">
                Has Active Loan
              </label>
              <select
                id="hasLoan"
                name="hasLoan"
                value={formData.hasLoan}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                required
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </motion.div>
            
            {/* Education Select */}
            <motion.div 
              className="form-group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <label className="block text-green-700 font-medium mb-2" htmlFor="education">
                Education Level
              </label>
              <select
                id="education"
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                required
              >
                <option value="high_school">High School</option>
                <option value="bachelors">Bachelor's Degree</option>
                <option value="masters">Master's Degree</option>
                <option value="phd">PhD</option>
              </select>
            </motion.div>
            
            {/* Occupation Select */}
            <motion.div 
              className="form-group col-span-1 md:col-span-2"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <label className="block text-green-700 font-medium mb-2" htmlFor="occupation">
                Occupation
              </label>
              <select
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                required
              >
                <option value="student">Student</option>
                <option value="professional">Professional</option>
                <option value="executive">Executive</option>
                <option value="self_employed">Self-Employed</option>
                <option value="retired">Retired</option>
              </select>
            </motion.div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Processing...</span>
                </>
              ) : 'Run Prediction'}
            </motion.button>
            
            <motion.button
              type="button"
              onClick={useSampleData}
              className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Use Sample Data
            </motion.button>
          </div>
        </form>
      </motion.div>
      
      {/* Results Section */}
      {result && (
        <motion.div 
          className="bg-white shadow-xl rounded-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Prediction Results</h3>
          
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-full md:w-1/2">
              <div className={`p-6 rounded-lg mb-4 ${
                result.prediction === 'high_value' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-center mb-4">
                  <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full ${
                    result.prediction === 'high_value' 
                      ? 'bg-green-100 text-green-500' 
                      : 'bg-blue-100 text-blue-500'
                  }`}>
                    <span className="text-2xl">
                      {result.prediction === 'high_value' ? '★' : '→'}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h4 className={`text-lg font-bold ${
                      result.prediction === 'high_value' 
                        ? 'text-green-700' 
                        : 'text-blue-700'
                    }`}>
                      {result.prediction === 'high_value' 
                        ? 'High-Value Customer' 
                        : 'Standard Customer'}
                    </h4>
                    <p className="text-gray-600 mt-1">
                      Confidence: {Math.round(result.probability * 100)}%
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-600">
                  {result.prediction === 'high_value' 
                    ? 'This customer profile is likely to generate significant value. Consider premium offerings and personalized services.' 
                    : 'This customer has standard value potential. Focus on engagement and gradual conversion strategies.'}
                </p>
              </div>
            </div>
            
            {/* Feature Importance Visualization */}
            {result.feature_importance && (
              <div className="w-full md:w-1/2">
                <h4 className="text-lg font-medium text-gray-800 mb-3">Feature Importance</h4>
                {Object.entries(result.feature_importance)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([feature, importance], index) => (
                    <div key={feature} className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {feature.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm text-gray-600">
                          {Math.round(importance * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <motion.div 
                          className="h-2.5 rounded-full bg-green-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${importance * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        ></motion.div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default XGBoostModelForm; 