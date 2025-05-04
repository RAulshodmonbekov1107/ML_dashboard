import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../ui/LoadingSpinner';
import apiService from '../../services/apiService';

interface RandomForestModelFormProps {
  modelEndpoint: string;
  title: string;
  description: string;
}

interface RetailCustomerResult {
  customer_category: string;
  confidence: number;
}

const RandomForestModelForm: React.FC<RandomForestModelFormProps> = ({
  modelEndpoint,
  title,
  description
}) => {
  const [formData, setFormData] = useState({
    age: 35,
    income: 75000,
    previous_purchases: 12,
    average_basket_value: 150,
    days_since_last_purchase: 14
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RetailCustomerResult | null>(null);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'previous_purchases' || name === 'days_since_last_purchase' 
        ? parseInt(value, 10) 
        : parseFloat(value)
    }));
    
    // Clear previous results when form is changed
    setResult(null);
    setError(null);
  };
  
  // Submit form for prediction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.makePrediction<RetailCustomerResult>(
        modelEndpoint,
        formData
      );
      
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during prediction');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Use sample data
  const handleSampleData = () => {
    const samples = [
      {
        age: 28, 
        income: 45000, 
        previous_purchases: 5, 
        average_basket_value: 75, 
        days_since_last_purchase: 20
      },
      {
        age: 42, 
        income: 85000, 
        previous_purchases: 18, 
        average_basket_value: 160, 
        days_since_last_purchase: 5
      },
      {
        age: 65, 
        income: 110000, 
        previous_purchases: 30, 
        average_basket_value: 240, 
        days_since_last_purchase: 2
      }
    ];
    
    const randomSample = samples[Math.floor(Math.random() * samples.length)];
    setFormData(randomSample);
    setResult(null);
    setError(null);
  };
  
  // Define animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-lg shadow-sm p-6 border border-green-100"
        >
          <motion.div variants={itemVariants}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={itemVariants} className="space-y-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Age
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                    </div>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleInputChange}
                      min="18"
                      max="100"
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Income ($)
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      id="income"
                      name="income"
                      type="number"
                      value={formData.income}
                      onChange={handleInputChange}
                      min="0"
                      step="1000"
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="previous_purchases" className="block text-sm font-medium text-gray-700 mb-1">
                    Previous Purchases (Count)
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </span>
                    </div>
                    <input
                      id="previous_purchases"
                      name="previous_purchases"
                      type="number"
                      value={formData.previous_purchases}
                      onChange={handleInputChange}
                      min="0"
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="average_basket_value" className="block text-sm font-medium text-gray-700 mb-1">
                    Average Basket Value ($)
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      id="average_basket_value"
                      name="average_basket_value"
                      type="number"
                      value={formData.average_basket_value}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="days_since_last_purchase" className="block text-sm font-medium text-gray-700 mb-1">
                    Days Since Last Purchase
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </span>
                    </div>
                    <input
                      id="days_since_last_purchase"
                      name="days_since_last_purchase"
                      type="number"
                      value={formData.days_since_last_purchase}
                      onChange={handleInputChange}
                      min="0"
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="pt-4 flex gap-3">
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 transition shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" color="white" />
                      <span className="ml-2">Analyzing...</span>
                    </div>
                  ) : 'Analyze Customer'}
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={handleSampleData}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-green-700 font-medium rounded-md border border-green-200 shadow-sm hover:shadow-md transition"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Use Sample Data
                </motion.button>
              </motion.div>
            </form>
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600"
              >
                {error}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {result ? (
            <ResultDisplay result={result} formData={formData} />
          ) : (
            <InitialState />
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Component for initial empty state
const InitialState = () => (
  <motion.div
    className="bg-gradient-to-br from-green-50 to-green-100 border border-green-100 rounded-lg p-6 h-full flex flex-col items-center justify-center text-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.2 }}
  >
    <div className="text-green-500 mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-700 mb-2">Customer Analysis</h3>
    <p className="text-sm text-gray-500 max-w-md">
      Fill out the form with customer attributes and submit to get an analysis of their customer value category and tailored recommendations.
    </p>
    
    <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-md">
      <div className="bg-white rounded-lg shadow-sm p-3 text-center">
        <div className="text-green-500 font-bold text-lg">LTV</div>
        <div className="text-xs text-gray-500">Lifetime Value</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-3 text-center">
        <div className="text-green-500 font-bold text-lg">ROI</div>
        <div className="text-xs text-gray-500">Marketing Return</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-3 text-center">
        <div className="text-green-500 font-bold text-lg">CLV</div>
        <div className="text-xs text-gray-500">Customer Value</div>
      </div>
    </div>
  </motion.div>
);

// Component to display the result with animations
const ResultDisplay = ({ result, formData }: { result: RetailCustomerResult, formData: any }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="bg-white rounded-lg shadow-sm p-6 border border-green-100 h-full"
  >
    <motion.h3 
      className="text-xl font-semibold mb-4 text-green-800"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      Customer Analysis Results
    </motion.h3>
    
    <motion.div 
      className="flex flex-col gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <motion.div 
        className="flex items-center"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mr-4 ${
          result.customer_category === "Very High Value" ? "bg-green-100" :
          result.customer_category === "High Value" ? "bg-green-50" :
          result.customer_category === "Medium Value" ? "bg-yellow-50" :
          "bg-gray-50"
        }`}>
          <span className={`text-2xl ${
            result.customer_category === "Very High Value" ? "text-green-600" :
            result.customer_category === "High Value" ? "text-green-500" :
            result.customer_category === "Medium Value" ? "text-yellow-500" :
            "text-gray-400"
          }`}>
            {result.customer_category === "Very High Value" ? "★★★" :
             result.customer_category === "High Value" ? "★★" :
             result.customer_category === "Medium Value" ? "★" : "○"}
          </span>
        </div>
        <div>
          <h4 className="text-lg font-medium">
            {result.customer_category} Customer
          </h4>
          <div className="flex items-center">
            <p className="text-sm text-gray-500 mr-2">
              Confidence: 
            </p>
            <div className="relative w-32 h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className={`absolute top-0 left-0 h-full rounded-full ${
                  result.confidence > 0.9 ? "bg-green-500" :
                  result.confidence > 0.7 ? "bg-green-400" :
                  "bg-yellow-400"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(result.confidence * 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
              />
            </div>
            <p className="text-sm font-medium ml-2">{Math.round(result.confidence * 100)}%</p>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="border-t border-gray-100 pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h4 className="font-medium mb-2">Recommendations:</h4>
        <ul className="list-none pl-0 space-y-2 text-gray-600">
          {result.customer_category === "Very High Value" && (
            <>
              <RecommendationItem text="Offer premium loyalty program benefits" delay={0.5} />
              <RecommendationItem text="Provide personal shopping assistant" delay={0.6} />
              <RecommendationItem text="Send exclusive early access to new products" delay={0.7} />
              <RecommendationItem text="Create customized shopping experiences" delay={0.8} />
            </>
          )}
          {result.customer_category === "High Value" && (
            <>
              <RecommendationItem text="Develop targeted loyalty rewards" delay={0.5} />
              <RecommendationItem text="Offer moderate discounts on related products" delay={0.6} />
              <RecommendationItem text="Send personalized product recommendations" delay={0.7} />
              <RecommendationItem text="Increase communication frequency" delay={0.8} />
            </>
          )}
          {result.customer_category === "Medium Value" && (
            <>
              <RecommendationItem text="Create upgrade paths to increase purchase frequency" delay={0.5} />
              <RecommendationItem text="Offer bundle deals to increase basket value" delay={0.6} />
              <RecommendationItem text="Send regular promotional offers" delay={0.7} />
              <RecommendationItem text="Encourage product reviews for engagement" delay={0.8} />
            </>
          )}
          {result.customer_category === "Low Value" && (
            <>
              <RecommendationItem text="Focus on retention strategies" delay={0.5} />
              <RecommendationItem text="Provide incentives for next purchase" delay={0.6} />
              <RecommendationItem text="Send re-engagement campaigns" delay={0.7} />
              <RecommendationItem text="Gather feedback to improve experience" delay={0.8} />
            </>
          )}
        </ul>
      </motion.div>
      
      <motion.div 
        className="bg-gray-50 p-4 rounded-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h4 className="font-medium mb-2">Customer Profile Insights:</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <ProfileInsight label="Age" value={`${formData.age}`} />
          <ProfileInsight label="Income" value={`$${formData.income.toLocaleString()}`} />
          <ProfileInsight label="Purchases" value={`${formData.previous_purchases}`} />
          <ProfileInsight label="Basket Value" value={`$${formData.average_basket_value}`} />
          <ProfileInsight label="Last Purchase" value={`${formData.days_since_last_purchase} days ago`} />
        </div>
      </motion.div>
    </motion.div>
  </motion.div>
);

// Helper component for animated recommendation items
const RecommendationItem = ({ text, delay }: { text: string, delay: number }) => (
  <motion.li 
    className="flex items-center py-1 border-b border-gray-100"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
  >
    <span className="text-green-500 mr-2">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    </span>
    {text}
  </motion.li>
);

// Helper component for profile insights
const ProfileInsight = ({ label, value }: { label: string, value: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.7 }}
  >
    <span className="text-gray-500 text-sm">{label}:</span>
    <span className="ml-2 font-medium">{value}</span>
  </motion.div>
);

export default RandomForestModelForm; 