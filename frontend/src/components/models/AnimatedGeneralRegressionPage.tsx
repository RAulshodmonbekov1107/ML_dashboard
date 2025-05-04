import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiService from '../../services/apiService';
import Navbar from '../layout/Navbar';
import './GeneralRegression.css';

interface AnimatedGeneralRegressionPageProps {
  modelEndpoint: string;
  title: string;
  description: string;
}

interface FormData {
  prev_price: number;
  volume: number;
  market_index: number;
}

interface PredictionResult {
  prediction: number;
  explanation?: string;
  confidence?: number;
  error?: string;
}

interface CandlestickData {
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  date: string;
}

const AnimatedGeneralRegressionPage: React.FC<AnimatedGeneralRegressionPageProps> = ({
  modelEndpoint,
  title,
  description
}) => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    prev_price: 100,
    volume: 10000,
    market_index: 3000
  });

  // Prediction state
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'chart' | 'explanation'>('form');
  const [animationState, setAnimationState] = useState({
    headerVisible: false,
    formVisible: false,
    resultVisible: false,
    factorBarsVisible: false,
    chartVisible: false,
    formulaVisible: false
  });
  
  // Stock data for chart
  const [stockData, setStockData] = useState<CandlestickData[]>([]);
  
  // Highlighted formula part
  const [highlightedFormulaPart, setHighlightedFormulaPart] = useState<'price' | 'volume' | 'market' | null>(null);
  
  // Factor contributions
  const [factorContributions, setFactorContributions] = useState({
    price: 0,
    volume: 0,
    market: 0,
    total: 0
  });
  
  // Random market data
  const stockTickerData = [
    { symbol: 'AAPL', price: 169.75, change: 1.24, isUp: true },
    { symbol: 'MSFT', price: 342.88, change: -0.54, isUp: false },
    { symbol: 'GOOGL', price: 142.65, change: 0.82, isUp: true },
    { symbol: 'AMZN', price: 178.15, change: -1.43, isUp: false },
    { symbol: 'META', price: 475.22, change: 2.18, isUp: true },
    { symbol: 'TSLA', price: 176.75, change: -3.25, isUp: false },
    { symbol: 'NVDA', price: 875.35, change: 4.75, isUp: true },
    { symbol: 'JPM', price: 182.45, change: 0.35, isUp: true }
  ];
  
  // Generate random stock data for chart visualization
  useEffect(() => {
    generateStockData();
    
    // Trigger animations when the component mounts
    setTimeout(() => setAnimationState(prev => ({ ...prev, headerVisible: true })), 300);
    setTimeout(() => setAnimationState(prev => ({ ...prev, formVisible: true })), 700);
  }, []);
  
  // Update animations when prediction changes
  useEffect(() => {
    if (prediction) {
      setTimeout(() => setAnimationState(prev => ({ ...prev, resultVisible: true })), 300);
      setTimeout(() => setAnimationState(prev => ({ ...prev, factorBarsVisible: true })), 1000);
      setTimeout(() => setAnimationState(prev => ({ ...prev, chartVisible: true })), 1500);
      setTimeout(() => setAnimationState(prev => ({ ...prev, formulaVisible: true })), 2000);
      animateFormulaParts();
    }
  }, [prediction]);
  
  // Animate formula parts sequentially
  const animateFormulaParts = () => {
    if (!prediction) return;
    
    const parts = ['price', 'volume', 'market'] as const;
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
  
  // Generate random historical stock data
  const generateStockData = () => {
    const data: CandlestickData[] = [];
    let currentPrice = formData.prev_price;
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const changePercent = (Math.random() * 4) - 2; // -2% to +2%
      const volumeRandom = Math.floor(Math.random() * 20000) + 5000;
      
      const open = currentPrice;
      const close = Number((currentPrice * (1 + changePercent / 100)).toFixed(2));
      const high = Number((Math.max(open, close) * (1 + Math.random() * 0.5 / 100)).toFixed(2));
      const low = Number((Math.min(open, close) * (1 - Math.random() * 0.5 / 100)).toFixed(2));
      
      data.push({
        date: date.toLocaleDateString(),
        open,
        close,
        high,
        low,
        volume: volumeRandom
      });
      
      currentPrice = close;
    }
    
    setStockData(data);
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
      chartVisible: false,
      formulaVisible: false
    }));
    
    try {
      // Generate new stock data based on the new form values
      generateStockData();
      
      const result = await apiService.makePrediction<PredictionResult>(
        modelEndpoint,
        formData
      );
      
      setPrediction(result);
      
      // Calculate factor contributions for visualization
      // Based on the general regression formula: 
      // price_change = (0.05 * prev_price) + (volume / 1000000) + (market_index / 10000) - 0.5
      // predicted_price = prev_price * (1 + price_change / 100)
      const priceContribution = 0.05 * formData.prev_price;
      const volumeContribution = formData.volume / 1000000;
      const marketContribution = formData.market_index / 10000;
      const baseChange = -0.5; // Constant in the formula
      
      const totalChange = priceContribution + volumeContribution + marketContribution + baseChange;
      
      setFactorContributions({
        price: priceContribution,
        volume: volumeContribution,
        market: marketContribution,
        total: totalChange
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
  
  // Format percentage change
  const formatPercentChange = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };
  
  // Get price change percentage
  const getPriceChangePercent = () => {
    if (!prediction) return 0;
    const change = ((prediction.prediction - formData.prev_price) / formData.prev_price) * 100;
    return change;
  };

  return (
    <div className="general-regression-page">
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
          
          {/* Stock ticker tape */}
          <motion.div 
            className="ticker-tape mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="ticker-content">
              {stockTickerData.map((stock, index) => (
                <div key={index} className="ticker-item">
                  <span className="ticker-symbol">{stock.symbol}</span>
                  <span className="ticker-price">{formatCurrency(stock.price)}</span>
                  <span className={`ticker-change ${stock.isUp ? 'up' : 'down'}`}>
                    {stock.isUp ? '▲' : '▼'} {Math.abs(stock.change).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Stock icons animation */}
          <motion.div 
            className="stock-icons-animation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="stock-icon">📈</div>
            <div className="stock-icon">💹</div>
            <div className="stock-icon">💰</div>
            <div className="stock-icon">📊</div>
            <div className="stock-icon">💼</div>
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
                Stock Data
              </button>
              <button 
                className={`tab-button ${activeTab === 'chart' ? 'active' : ''}`}
                onClick={() => setActiveTab('chart')}
              >
                Chart
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
                  <h2 className="text-2xl font-semibold mb-4">Stock Parameters</h2>
                  
                  <div className="field-group-single">
                    <div className="field">
                      <label className="field-label">Previous Price ($)</label>
                      <input
                        type="range"
                        className="range-slider"
                        min="50"
                        max="200"
                        step="0.01"
                        value={formData.prev_price}
                        onChange={(e) => handleInputChange('prev_price', parseFloat(e.target.value))}
                      />
                      <div className="flex justify-between">
                        <span className="slider-value">$50</span>
                        <span className="slider-value font-medium">{formatCurrency(formData.prev_price)}</span>
                        <span className="slider-value">$200</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="field-group-single">
                    <div className="field">
                      <label className="field-label">Trading Volume</label>
                      <input
                        type="range"
                        className="range-slider"
                        min="1000"
                        max="50000"
                        step="100"
                        value={formData.volume}
                        onChange={(e) => handleInputChange('volume', parseFloat(e.target.value))}
                      />
                      <div className="flex justify-between">
                        <span className="slider-value">1K</span>
                        <span className="slider-value font-medium">
                          {new Intl.NumberFormat('en-US').format(formData.volume)}
                        </span>
                        <span className="slider-value">50K</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="field-group-single">
                    <div className="field">
                      <label className="field-label">Market Index</label>
                      <input
                        type="range"
                        className="range-slider"
                        min="2000"
                        max="5000"
                        step="10"
                        value={formData.market_index}
                        onChange={(e) => handleInputChange('market_index', parseFloat(e.target.value))}
                      />
                      <div className="flex justify-between">
                        <span className="slider-value">2000</span>
                        <span className="slider-value font-medium">
                          {new Intl.NumberFormat('en-US').format(formData.market_index)}
                        </span>
                        <span className="slider-value">5000</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Predict Stock Price'}
                  </button>
                </form>
              )}
              
              {activeTab === 'chart' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Historical Data</h2>
                  
                  <div className="candlestick-chart mb-4 border rounded-lg p-4 h-64 relative">
                    {stockData.slice(-15).map((data, index) => {
                      const isUp = data.close >= data.open;
                      const barHeight = Math.abs(data.close - data.open) * 2;
                      const highLowHeight = (data.high - data.low) * 2;
                      const basePosition = 200 - (Math.min(data.open, data.close) - 50) * 2;
                      const barPositionX = 20 + (index * 20);
                      const linePositionY = 200 - ((data.high - 50) * 2);
                      const lineHeight = highLowHeight;
                      
                      return (
                        <React.Fragment key={index}>
                          <motion.div 
                            className={`chart-line`}
                            style={{
                              left: barPositionX + 6,
                              top: linePositionY,
                              height: lineHeight
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.05 * index }}
                          />
                          <motion.div 
                            className={`chart-bar ${isUp ? 'up' : 'down'}`}
                            style={{
                              left: barPositionX,
                              bottom: basePosition,
                              height: barHeight
                            }}
                            initial={{ opacity: 0, scaleY: 0 }}
                            animate={{ opacity: 1, scaleY: 1 }}
                            transition={{ delay: 0.05 * index }}
                          />
                        </React.Fragment>
                      );
                    })}
                    
                    {prediction && (
                      <motion.div 
                        className="chart-prediction"
                        style={{
                          left: 20,
                          right: 20,
                          bottom: 200 - ((prediction.prediction - 50) * 2)
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                      />
                    )}
                  </div>
                  
                  <div className="chart-legend">
                    <div className="legend-item">
                      <div className="legend-color up"></div>
                      <div>Up Day</div>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color down"></div>
                      <div>Down Day</div>
                    </div>
                    {prediction && (
                      <div className="legend-item">
                        <div className="legend-color prediction"></div>
                        <div>Prediction</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <button
                      onClick={handleSubmit}
                      className="submit-button"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Predict Stock Price'}
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'explanation' && (
                <div className="explanation-content">
                  <h2 className="text-2xl font-semibold mb-4">How General Regression Works</h2>
                  
                  <div className="space-y-6">
                    <p>
                      General Regression extends linear regression to handle multiple input variables, making it useful for 
                      stock price prediction where several factors influence the outcome.
                    </p>
                    
                    <div className="explanation-step">
                      <div className="step-number">1</div>
                      <div>
                        <strong>Collect data</strong> including the target variable (stock price) and all predictor 
                        variables (previous price, trading volume, market index).
                      </div>
                    </div>
                    
                    <div className="explanation-step">
                      <div className="step-number">2</div>
                      <div>
                        <strong>Train the model</strong> to find the coefficients that best fit the historical relationship between inputs and stock price.
                        <div className="formula">
                          Y = β₀ + β₁X₁ + β₂X₂ + β₃X₃ + ... + ε
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Where Y is the future stock price, β₀ is the intercept, β₁, β₂, etc. are coefficients, 
                          X₁, X₂, etc. are the predictor variables, and ε is the error term.
                        </div>
                      </div>
                    </div>
                    
                    <div className="explanation-step">
                      <div className="step-number">3</div>
                      <div>
                        <strong>For our stock price prediction:</strong>
                        <div className="formula">
                          price_change = (0.05 × prev_price) + (volume ÷ 1,000,000) + (market_index ÷ 10,000) - 0.5
                        </div>
                        <div className="formula">
                          predicted_price = prev_price × (1 + price_change ÷ 100)
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="csv-example-card">
                    <div className="csv-example-title">CSV Format Example:</div>
                    <div className="csv-example-content">prev_price,volume,market_index
100.25,15000,3500
95.50,20000,3450
105.75,12500,3550</div>
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
                {/* Stock Card */}
                <motion.div 
                  className="stock-card"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="stock-card-header">
                    <div className="stock-card-logo">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <div className="stock-card-title">TechCorp Inc.</div>
                      <div className="stock-card-ticker">NASDAQ: TECH</div>
                    </div>
                  </div>
                  
                  <div className="stock-card-stripe"></div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-2xl font-bold flex items-center">
                      {formatCurrency(prediction.prediction)}
                      <div className={`price-change ${getPriceChangePercent() >= 0 ? 'up' : 'down'}`}>
                        <span className="price-change-arrow">{getPriceChangePercent() >= 0 ? '▲' : '▼'}</span>
                        {formatPercentChange(getPriceChangePercent())}
                      </div>
                    </div>
                    
                    <div className="market-pulse">
                      <div className="pulse-dot"></div>
                      <div className="text-xs font-medium text-gray-600">
                        {getPriceChangePercent() >= 1 ? 'Bullish' : 
                         getPriceChangePercent() <= -1 ? 'Bearish' : 'Neutral'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="stock-card-metrics">
                    <div className="metric-item">
                      <div className="metric-label">Previous Price</div>
                      <div className="metric-value">{formatCurrency(formData.prev_price)}</div>
                    </div>
                    <div className="metric-item">
                      <div className="metric-label">Predicted Price</div>
                      <div className="metric-value">{formatCurrency(prediction.prediction)}</div>
                    </div>
                    <div className="metric-item">
                      <div className="metric-label">Trading Volume</div>
                      <div className="metric-value">{new Intl.NumberFormat('en-US').format(formData.volume)}</div>
                    </div>
                    <div className="metric-item">
                      <div className="metric-label">Market Index</div>
                      <div className="metric-value">{new Intl.NumberFormat('en-US').format(formData.market_index)}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Model confidence: {prediction.confidence ? `${(prediction.confidence * 100).toFixed(1)}%` : '78.0%'}</span>
                    </div>
                  </div>
                </motion.div>
                
                {/* Factor Influence */}
                <motion.div 
                  className="factor-container"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: animationState.factorBarsVisible ? 1 : 0, 
                    y: animationState.factorBarsVisible ? 0 : 20 
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="factor-title">Factor Influence on Price Change</h3>
                  
                  <div className="factor-bar">
                    <div className="factor-name">Previous Price</div>
                    <div className="factor-track">
                      <motion.div 
                        className="factor-fill price"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.abs(factorContributions.price / 0.5) * 100}%` }}
                        transition={{ duration: 1, delay: 0.1 }}
                      ></motion.div>
                    </div>
                    <div className="factor-value">{factorContributions.price.toFixed(3)}</div>
                  </div>
                  
                  <div className="factor-bar">
                    <div className="factor-name">Trading Volume</div>
                    <div className="factor-track">
                      <motion.div 
                        className="factor-fill volume"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.abs(factorContributions.volume / 0.5) * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      ></motion.div>
                    </div>
                    <div className="factor-value">{factorContributions.volume.toFixed(3)}</div>
                  </div>
                  
                  <div className="factor-bar">
                    <div className="factor-name">Market Index</div>
                    <div className="factor-track">
                      <motion.div 
                        className="factor-fill market"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.abs(factorContributions.market / 0.5) * 100}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                      ></motion.div>
                    </div>
                    <div className="factor-value">{factorContributions.market.toFixed(3)}</div>
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
                  <h3 className="formula-title">Price Change Calculation</h3>
                  
                  <div className="formula-container">
                    <motion.div 
                      className={`formula-part price ${highlightedFormulaPart === 'price' ? 'highlight' : ''}`}
                      animate={{ scale: highlightedFormulaPart === 'price' ? 1.1 : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      (0.05 × {formData.prev_price})
                    </motion.div>
                    
                    <span>+</span>
                    
                    <motion.div 
                      className={`formula-part volume ${highlightedFormulaPart === 'volume' ? 'highlight' : ''}`}
                      animate={{ scale: highlightedFormulaPart === 'volume' ? 1.1 : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      ({formData.volume} ÷ 1,000,000)
                    </motion.div>
                    
                    <span>+</span>
                    
                    <motion.div 
                      className={`formula-part market ${highlightedFormulaPart === 'market' ? 'highlight' : ''}`}
                      animate={{ scale: highlightedFormulaPart === 'market' ? 1.1 : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      ({formData.market_index} ÷ 10,000)
                    </motion.div>
                    
                    <span>-</span>
                    
                    <span>0.5</span>
                    
                    <span>=</span>
                    
                    <motion.div className="formula-part result">
                      {factorContributions.total.toFixed(3)}
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center items-center h-full py-24">
                <div className="loading-animation">
                  <div className="loading-spinner"></div>
                  <div className="mt-6 text-gray-600">Analyzing market data...</div>
                </div>
              </div>
            ) : prediction && prediction.error ? (
              <div className="p-6 text-center">
                <div className="text-red-500 text-xl mb-4">Error</div>
                <p>{prediction.error}</p>
                <button 
                  onClick={() => handleSubmit(new Event('submit') as any)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </motion.div>
                <h3 className="text-xl text-gray-600">Enter stock parameters to predict future price</h3>
                <p className="text-gray-500 mt-2 max-w-md">
                  Our general regression model will analyze factors like previous price, trading volume, and market index to forecast stock performance
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
          <h2 className="text-2xl font-semibold mb-6">Applications of General Regression</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="application-card">
              <div className="application-icon">📈</div>
              <h3 className="text-xl font-medium mb-2">Stock Predictions</h3>
              <p>Forecast future stock prices based on historical data, market indicators, and trading volume.</p>
            </div>
            
            <div className="application-card">
              <div className="application-icon">🏦</div>
              <h3 className="text-xl font-medium mb-2">Portfolio Analysis</h3>
              <p>Analyze investment portfolios to optimize asset allocation and maximize returns.</p>
            </div>
            
            <div className="application-card">
              <div className="application-icon">🔮</div>
              <h3 className="text-xl font-medium mb-2">Market Trend Analysis</h3>
              <p>Identify emerging market trends and predict sector performance for strategic investing.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedGeneralRegressionPage; 