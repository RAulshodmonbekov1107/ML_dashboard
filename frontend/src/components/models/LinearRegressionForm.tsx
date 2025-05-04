import React, { useState } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';
import ResultDisplay from '../ui/ResultDisplay';
import apiService, { PredictionResult } from '../../services/apiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartDataItem {
  name: string;
  price: number;
  isPrediction?: boolean;
}

const LinearRegressionForm: React.FC = () => {
  const [sqft, setSqft] = useState<number>(1500);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // For chart display
  const [chartData, setChartData] = useState<ChartDataItem[]>([
    { name: '1000 sqft', price: 150000 },
    { name: '1500 sqft', price: 200000 },
    { name: '2000 sqft', price: 250000 },
    { name: '2500 sqft', price: 300000 },
    { name: '3000 sqft', price: 350000 },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.makePrediction<PredictionResult>(
        'linear-regression',
        { 
          sqft: Number(sqft)
        }
      );
      
      setLoading(false);
      
      if ('error' in response && response.error) {
        setError(response.error || 'Unknown error occurred');
        return;
      }
      
      setPrediction(response);
      
      // If we have a numeric prediction, update the chart
      const predictedPrice = typeof response.prediction === 'number' 
        ? response.prediction 
        : typeof response.prediction === 'string' 
          ? parseFloat(response.prediction) 
          : 0;
      
      if (!isNaN(predictedPrice)) {
        // Update chart with the new prediction
        setChartData(prevData => {
          const newData = [...prevData];
          // Add or update the prediction point
          const predIndex = newData.findIndex(item => item.name === `${sqft} sqft (prediction)`);
          
          if (predIndex >= 0) {
            newData[predIndex].price = predictedPrice;
          } else {
            newData.push({
              name: `${sqft} sqft (prediction)`,
              price: predictedPrice,
              isPrediction: true
            });
          }
          
          return newData;
        });
      }
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'An error occurred during prediction');
      console.error('Prediction error:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Input Form */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Housing Price Prediction</h3>
        <p className="text-gray-600 mb-6">
          Enter the square footage of the house to predict its price using linear regression.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="sqft" className="block text-sm font-medium text-gray-700 mb-1">
              Square Footage
            </label>
            <div className="flex items-center">
              <input
                type="range"
                id="sqft"
                min="500"
                max="5000"
                step="100"
                value={sqft}
                onChange={(e) => setSqft(Number(e.target.value))}
                className="w-full mr-4"
              />
              <input
                type="number"
                value={sqft}
                onChange={(e) => setSqft(Number(e.target.value))}
                className="w-24 rounded-md border-gray-300 shadow-sm px-3 py-2 text-right"
              />
              <span className="ml-2 text-gray-600">sqft</span>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 transition mt-4"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" color="white" />
                <span className="ml-2">Predicting...</span>
              </div>
            ) : (
              'Predict Price'
            )}
          </button>
        </form>
        
        {/* Use our new ResultDisplay component */}
        {(prediction || error || loading) && (
          <div className="mt-6">
            <ResultDisplay 
              result={prediction}
              isLoading={loading}
              error={error}
            />
          </div>
        )}
      </div>
      
      {/* Visualization */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Price vs. Square Footage</h3>
        <div className="bg-white rounded-lg p-4 border border-gray-200 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Price']} />
              <Legend />
              <Bar
                dataKey="price"
                name="House Price"
                fill="#3B82F6"
                fillOpacity={0.8}
                stroke="#3B82F6"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h4 className="text-sm font-semibold text-gray-900">About Linear Regression</h4>
          <p className="text-xs text-gray-600 mt-1">
            Linear regression is a statistical model that analyzes the relationship between a dependent variable
            and one or more independent variables. In this case, we're using it to predict house prices (dependent) 
            based on square footage (independent).
          </p>
        </div>
      </div>
    </div>
  );
};

export default LinearRegressionForm; 