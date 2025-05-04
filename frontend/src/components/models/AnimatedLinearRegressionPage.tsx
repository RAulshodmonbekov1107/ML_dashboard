import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../services/apiService';
import Navbar from '../layout/Navbar';
import './LinearRegression.css';

interface AnimatedLinearRegressionPageProps {
  modelEndpoint: string;
  title: string;
  description: string;
}

interface FormData {
  sqft: number;
}

interface PredictionResult {
  prediction: number;
  explanation?: string;
  confidence?: number;
  error?: string;
}

interface DataPoint {
  sqft: number;
  price: number;
  isPrediction?: boolean;
}

const AnimatedLinearRegressionPage: React.FC<AnimatedLinearRegressionPageProps> = ({
  modelEndpoint,
  title,
  description
}) => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    sqft: 1500
  });

  // Prediction state
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'chart' | 'explanation'>('form');
  const [animationState, setAnimationState] = useState({
    headerVisible: false,
    formVisible: false,
    resultVisible: false,
    chartVisible: false,
    formulaVisible: false
  });
  
  // Scatter plot data
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  
  // Tooltip for selected point
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  
  // Reference to the scatter plot element
  const scatterPlotRef = useRef<HTMLDivElement>(null);
  
  // Highlighted formula part
  const [highlightedFormulaPart, setHighlightedFormulaPart] = useState<'intercept' | 'slope' | 'variable' | null>(null);
  
  // Model parameters (would be calculated from data in a real implementation)
  const modelParams = useMemo(() => ({
    intercept: 50000, // base price in dollars
    slope: 100       // dollars per square foot
  }), []);
  
  // House features for slider
  const houseFeatures = useMemo(() => [
    { icon: '🏠', name: 'Square Footage' },
    { icon: '🛌', name: 'Bedrooms' },
    { icon: '🚿', name: 'Bathrooms' },
    { icon: '🚗', name: 'Garage' },
    { icon: '🏊', name: 'Pool' },
    { icon: '🌳', name: 'Lot Size' },
    { icon: '📅', name: 'Year Built' },
    { icon: '🏫', name: 'School Rating' },
    { icon: '🔐', name: 'Security' },
    { icon: '📬', name: 'Zip Code' },
    { icon: '🧱', name: 'Construction' },
    { icon: '🌡️', name: 'Energy Rating' }
  ], []);
  
  // Generate sample data points for visualization
  useEffect(() => {
    generateSampleData();
    
    // Trigger animations when the component mounts
    const animations = [
      { state: 'headerVisible', delay: 300 },
      { state: 'formVisible', delay: 700 },
      { state: 'chartVisible', delay: 1000 } // Always enable chart visibility
    ];
    
    animations.forEach(({ state, delay }) => {
      const timer = setTimeout(() => {
        setAnimationState(prev => ({ ...prev, [state]: true }));
      }, delay);
      
      return () => clearTimeout(timer);
    });
  }, []);
  
  // Generate realistic sample data
  const generateSampleData = () => {
    const sampleData: DataPoint[] = [];
    
    // Generate points around the line with some noise to look realistic
    for (let i = 0; i < 20; i++) {
      const sqft = Math.floor(Math.random() * 3500) + 500;
      const basePrice = modelParams.intercept + (sqft * modelParams.slope);
      // Add some noise to make it realistic (±15%)
      const noise = (Math.random() * 0.3) - 0.15;
      const price = Math.round(basePrice * (1 + noise));
      sampleData.push({ sqft, price });
    }
    
    setDataPoints(sampleData);
  };
  
  // Update animations when prediction changes
  useEffect(() => {
    if (prediction) {
      const animations = [
        { state: 'resultVisible', delay: 300 },
        { state: 'chartVisible', delay: 1000 },
        { state: 'formulaVisible', delay: 1500 }
      ];
      
      animations.forEach(({ state, delay }) => {
        const timer = setTimeout(() => {
          setAnimationState(prev => ({ ...prev, [state]: true }));
        }, delay);
        
        return () => clearTimeout(timer);
      });
      
      animateFormulaParts();
      
      // Update dataPoints with prediction
      const predictionPoint: DataPoint = {
        sqft: formData.sqft,
        price: prediction.prediction,
        isPrediction: true
      };
      
      setDataPoints(prev => {
        // Remove any previous prediction points
        const filtered = prev.filter(p => !p.isPrediction);
        // Add the new prediction point
        return [...filtered, predictionPoint];
      });
    }
  }, [prediction, formData.sqft]);
  
  // Animate formula parts sequentially
  const animateFormulaParts = () => {
    const parts = ['intercept', 'slope', 'variable'] as const;
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
    setError(null);
    setAnimationState(prev => ({ 
      ...prev, 
      resultVisible: false,
      chartVisible: false,
      formulaVisible: false
    }));
    
    try {
      const result = await apiService.makePrediction<PredictionResult>(
        modelEndpoint,
        formData
      );
      
      if (result.error) {
        setError(result.error);
      } else {
        setPrediction(result);
      }
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format as currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format square footage
  const formatSqft = (value: number) => {
    return `${value.toLocaleString()} sq ft`;
  };
  
  // Render data points and regression line in scatter plot
  const renderScatterPlot = () => {
    // Always ensure we generate sample data if there are none
    if (dataPoints.length === 0) {
      generateSampleData();
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600">Preparing visualization...</p>
          </div>
        </div>
      );
    }
    
    // Force the component to render even if ref isn't ready yet
    const container = scatterPlotRef.current;
    const width = container?.clientWidth || 800;
    const height = container?.clientHeight || 400;
    
    // Fixed dimensions to ensure rendering
    const padding = { left: 80, right: 30, top: 30, bottom: 60 };
    
    // Calculate the plot dimensions
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    
    // Find min and max values for scaling with fallbacks to ensure rendering
    const minSqft = Math.min(...dataPoints.map(p => p.sqft)) || 500;
    const maxSqft = Math.max(...dataPoints.map(p => p.sqft)) || 5000;
    const minPrice = Math.min(...dataPoints.map(p => p.price)) || 50000;
    const maxPrice = Math.max(...dataPoints.map(p => p.price)) || 550000;
    
    // Add some padding to min/max values
    const sqftPadding = (maxSqft - minSqft) * 0.1;
    const pricePadding = (maxPrice - minPrice) * 0.1;
    
    const paddedMinSqft = Math.max(0, minSqft - sqftPadding);
    const paddedMaxSqft = maxSqft + sqftPadding;
    const paddedMinPrice = Math.max(0, minPrice - pricePadding);
    const paddedMaxPrice = maxPrice + pricePadding;
    
    // Scale function to convert data to pixel coordinates
    const scaleX = (sqft: number) => {
      return padding.left + ((sqft - paddedMinSqft) / (paddedMaxSqft - paddedMinSqft)) * plotWidth;
    };
    
    const scaleY = (price: number) => {
      return height - padding.bottom - ((price - paddedMinPrice) / (paddedMaxPrice - paddedMinPrice)) * plotHeight;
    };
    
    // Calculate regression line endpoints
    const startX = scaleX(paddedMinSqft);
    const startY = scaleY(modelParams.intercept + modelParams.slope * paddedMinSqft);
    const endX = scaleX(paddedMaxSqft);
    const endY = scaleY(modelParams.intercept + modelParams.slope * paddedMaxSqft);
    
    // Calculate angle and length for the line
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Calculate ticks for axes (more professional with fewer ticks)
    const xTicks = [];
    const yTicks = [];
    const numTicks = 4; // Fewer ticks for a cleaner look
    
    for (let i = 0; i <= numTicks; i++) {
      const sqft = paddedMinSqft + (i / numTicks) * (paddedMaxSqft - paddedMinSqft);
      const price = paddedMinPrice + (i / numTicks) * (paddedMaxPrice - paddedMinPrice);
      
      xTicks.push(
        <div
          key={`x-tick-${i}`}
          className="axis-tick x-tick"
          style={{ 
            position: 'absolute',
            left: `${scaleX(sqft)}px`, 
            bottom: `${padding.bottom - 25}px`,
            transform: 'translateX(-50%)' 
          }}
        >
          <div className="tick-label">{Math.round(sqft).toLocaleString()}</div>
        </div>
      );
      
      yTicks.push(
        <div
          key={`y-tick-${i}`}
          className="axis-tick y-tick"
          style={{ 
            position: 'absolute',
            bottom: `${height - scaleY(price) - 10}px`, 
            left: `${padding.left - 40}px`,
            transform: 'translateY(50%)' 
          }}
        >
          <div className="tick-label">{formatCurrency(price).replace('$', '')}</div>
        </div>
      );
    }
    
    // Render points with proper positioning
    const points = dataPoints.map((point, index) => {
      const x = scaleX(point.sqft);
      const y = scaleY(point.price);
      
      return (
        <motion.div
          key={`point-${index}`}
          className={`plot-point ${point.isPrediction ? 'highlighted' : ''}`}
          style={{ 
            left: `${x}px`, 
            top: `${y}px`,
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            zIndex: point.isPrediction ? 10 : 5
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 * Math.min(index, 10), duration: 0.3 }}
          onMouseEnter={() => setHoveredPoint(point)}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {(point.isPrediction || hoveredPoint === point) && (
            <motion.div
              className="plot-tooltip"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {formatCurrency(point.price)} at {formatSqft(point.sqft)}
            </motion.div>
          )}
        </motion.div>
      );
    });
    
    return (
      <div className="relative w-full h-full">
        {/* Background grid */}
        <div className="absolute inset-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`grid-x-${i}`} className="w-full h-px bg-gray-100" style={{ position: 'absolute', top: `${padding.top + (i * plotHeight / 4)}px`, left: padding.left, width: plotWidth }} />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`grid-y-${i}`} className="h-full w-px bg-gray-100" style={{ position: 'absolute', left: `${padding.left + (i * plotWidth / 4)}px`, top: padding.top, height: plotHeight }} />
          ))}
        </div>
        
        {/* Axes */}
        <div className="axis-x" style={{ position: 'absolute', bottom: `${padding.bottom - 10}px`, left: `${padding.left}px`, width: `${plotWidth}px`, height: '2px', backgroundColor: '#94a3b8' }} />
        <div className="axis-y" style={{ position: 'absolute', left: `${padding.left}px`, top: `${padding.top}px`, height: `${plotHeight}px`, width: '2px', backgroundColor: '#94a3b8' }} />
        
        {/* Axis labels */}
        <div className="axis-label x" style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', color: '#334155', fontWeight: 500, fontSize: '0.875rem' }}>Square Footage</div>
        <div className="axis-label y" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)', transformOrigin: 'left center', color: '#334155', fontWeight: 500, fontSize: '0.875rem' }}>House Price</div>
        
        {/* Regression line */}
        <motion.div
          className="regression-line"
          style={{
            position: 'absolute',
            left: `${startX}px`,
            top: `${startY}px`,
            width: `${length}px`,
            height: '3px',
            transformOrigin: '0 0',
            transform: `rotate(${angle}deg)`,
            backgroundColor: '#10b981',
            zIndex: 4
          }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
        
        {/* Ticks */}
        {xTicks}
        {yTicks}
        
        {/* Points */}
        {points}
      </div>
    );
  };

  // Handle tab switching
  const handleTabChange = (tab: 'form' | 'chart' | 'explanation') => {
    setActiveTab(tab);
    
    // Ensure chart is visible when switching to chart tab
    if (tab === 'chart' && !animationState.chartVisible) {
      setAnimationState(prev => ({ ...prev, chartVisible: true }));
      
      // Generate sample data if none exists
      if (dataPoints.length === 0) {
        generateSampleData();
      }
    }
  };

  return (
    <div className="linear-regression-page">
      <Navbar />
      
      <motion.div 
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: animationState.headerVisible ? 1 : 0, y: animationState.headerVisible ? 0 : 20 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.h1 
            className="text-3xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {title}
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {description}
          </motion.p>
        </div>
        
        {/* House-themed icons animation */}
        <div className="house-icons-animation">
          {['🏠', '🏡', '🏘️', '🏚️', '🏙️'].map((icon, i) => (
            <div key={i} className="house-icon">{icon}</div>
          ))}
        </div>
        
        {/* Feature slider */}
        <div className="feature-slider">
          <div className="feature-track">
            {[...houseFeatures, ...houseFeatures].map((feature, i) => (
              <div key={i} className="feature-item">
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-name">{feature.name}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
              onClick={() => handleTabChange('form')}
            >
              House Price Predictor
            </button>
            <button 
              className={`tab-button ${activeTab === 'chart' ? 'active' : ''}`}
              onClick={() => handleTabChange('chart')}
            >
              Data Visualization
            </button>
            <button 
              className={`tab-button ${activeTab === 'explanation' ? 'active' : ''}`}
              onClick={() => handleTabChange('explanation')}
            >
              How It Works
            </button>
          </div>
          
          {/* Form Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'form' && (
              <motion.div 
                className="form-container"
                key="form-tab"
                initial={{ opacity: 0, height: 0 }}
                animate={{ 
                  opacity: animationState.formVisible ? 1 : 0, 
                  height: animationState.formVisible ? 'auto' : 0 
                }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* House Card */}
                <div className="house-card">
                  <div className="house-card-header">
                    <div className="house-card-image">🏡</div>
                    <div>
                      <div className="house-card-title">Property Valuation</div>
                      <div className="house-card-subtitle">Estimate your property value instantly</div>
                    </div>
                  </div>
                  <div className="house-card-body">
                    <div className="house-card-metrics">
                      <div className="metric-item">
                        <div className="metric-label">Property Type</div>
                        <div className="metric-value">Single Family</div>
                      </div>
                      <div className="metric-item">
                        <div className="metric-label">Location</div>
                        <div className="metric-value">Suburban</div>
                      </div>
                    </div>
                  
                    <form onSubmit={handleSubmit}>
                      <div className="field-group-single">
                        <label className="field-label">
                          Square Footage
                        </label>
                        <div className="flex items-center">
                          <input
                            type="range"
                            min="500"
                            max="5000"
                            step="100"
                            value={formData.sqft}
                            onChange={(e) => handleInputChange('sqft', parseInt(e.target.value))}
                            className="range-slider flex-grow"
                          />
                          <input
                            type="number"
                            value={formData.sqft}
                            onChange={(e) => handleInputChange('sqft', parseInt(e.target.value) || 0)}
                            className="field-input ml-4"
                            style={{ width: '100px' }}
                          />
                        </div>
                        <div className="slider-value">
                          <span>500 sqft</span>
                          <span>5,000 sqft</span>
                        </div>
                      </div>
                      
                      <button
                        type="submit"
                        className="submit-button"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="loading-animation">
                            <div className="loading-spinner"></div>
                            <span>Calculating price...</span>
                          </div>
                        ) : "Predict House Price"}
                      </button>
                    </form>
                  </div>
                </div>
                
                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-4"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm">{error}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Results Container */}
                <AnimatePresence>
                  {prediction && (
                    <motion.div 
                      className="result-container"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: animationState.resultVisible ? 1 : 0, 
                        y: animationState.resultVisible ? 0 : 20 
                      }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">
                        Estimated Property Value
                      </h3>
                      
                      <div className="flex justify-center">
                        <motion.div 
                          className="prediction-value"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                        >
                          {prediction.prediction.toLocaleString()}
                        </motion.div>
                      </div>
                      
                      <p className="text-center text-gray-600 mt-4">
                        {prediction.explanation || `Based on a ${formData.sqft.toLocaleString()} sq ft property, we estimate the market value to be approximately ${formatCurrency(prediction.prediction)}.`}
                      </p>
                      
                      <div className="mt-6 border-t border-gray-100 pt-4">
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>Confidence</span>
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${Math.round((prediction.confidence || 0.85) * 100)}%` }}
                              ></div>
                            </div>
                            <span>{Math.round((prediction.confidence || 0.85) * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          
            {/* Chart Tab */}
            {activeTab === 'chart' && (
              <motion.div 
                className="p-6"
                key="chart-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div 
                  className="chart-container"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1,
                    y: 0
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Price vs. Square Footage</h3>
                  
                  <div 
                    className="scatter-plot" 
                    ref={scatterPlotRef}
                    style={{ height: "400px", position: "relative", overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "0.375rem", backgroundColor: "#f8fafc" }}
                  >
                    {renderScatterPlot()}
                  </div>
                  
                  <div className="chart-legend mt-4 flex justify-center">
                    <div className="legend-item flex items-center mr-4">
                      <div className="legend-marker point w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="legend-text text-sm text-gray-600">Sample Data</span>
                    </div>
                    <div className="legend-item flex items-center mr-4">
                      <div className="legend-marker highlighted w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="legend-text text-sm text-gray-600">Your Prediction</span>
                    </div>
                    <div className="legend-item flex items-center">
                      <div className="legend-marker line w-5 h-0.5 bg-green-500 mr-2"></div>
                      <span className="legend-text text-sm text-gray-600">Regression Line</span>
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
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h3 className="formula-title">Linear Regression Formula</h3>
                  
                  <div className="formula-container">
                    <div className={`formula-part result`}>Price</div>
                    <div className="formula-part">=</div>
                    <div className={`formula-part intercept ${highlightedFormulaPart === 'intercept' ? 'highlight' : ''}`}>
                      {modelParams.intercept.toLocaleString()}
                    </div>
                    <div className="formula-part">+</div>
                    <div className={`formula-part slope ${highlightedFormulaPart === 'slope' ? 'highlight' : ''}`}>
                      {modelParams.slope}
                    </div>
                    <div className="formula-part">×</div>
                    <div className={`formula-part variable ${highlightedFormulaPart === 'variable' ? 'highlight' : ''}`}>
                      SquareFeet
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 text-center mt-4">
                    This linear regression model estimates house price based on square footage using the formula above.
                    The model has a base price of ${modelParams.intercept.toLocaleString()} plus ${modelParams.slope} per square foot.
                  </p>
                </motion.div>
              </motion.div>
            )}
            
            {/* Explanation Tab */}
            {activeTab === 'explanation' && (
              <motion.div 
                className="explanation-content"
                key="explanation-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">How Linear Regression Works</h3>
                
                <div className="space-y-6">
                  <div className="explanation-step">
                    <div className="step-number">1</div>
                    <h4 className="step-title">Data Collection</h4>
                    <p className="step-content">
                      Real estate data is collected from thousands of home sales, including square footage and sale prices. 
                      This historical data forms the basis for training our model.
                    </p>
                  </div>
                  
                  <div className="explanation-step">
                    <div className="step-number">2</div>
                    <h4 className="step-title">Model Training</h4>
                    <p className="step-content">
                      A linear regression algorithm finds the best-fitting line through the data points, minimizing the 
                      prediction error. This line represents the relationship between square footage and house price.
                    </p>
                  </div>
                  
                  <div className="explanation-step">
                    <div className="step-number">3</div>
                    <h4 className="step-title">Mathematical Formula</h4>
                    <p className="step-content">
                      The model creates a formula of the form:
                    </p>
                    <div className="formula-box">
                      Price = BasePrice + (SquareFeet × PricePerSquareFoot)
                    </div>
                    <p className="step-content">
                      In our model, BasePrice (intercept) is ${modelParams.intercept.toLocaleString()} and PricePerSquareFoot (slope) is ${modelParams.slope}.
                    </p>
                  </div>
                  
                  <div className="explanation-step">
                    <div className="step-number">4</div>
                    <h4 className="step-title">Making Predictions</h4>
                    <p className="step-content">
                      When you enter a square footage value, the model plugs it into the formula to predict the house price.
                    </p>
                    <p className="step-content">
                      For example, a 2,000 sq ft house would be estimated at:
                    </p>
                    <div className="formula-box">
                      ${modelParams.intercept.toLocaleString()} + (2,000 × ${modelParams.slope}) = ${(modelParams.intercept + 2000 * modelParams.slope).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="explanation-step">
                    <div className="step-number">5</div>
                    <h4 className="step-title">Model Limitations</h4>
                    <p className="step-content">
                      This simple model only considers square footage. Real property valuation depends on many factors 
                      including location, condition, amenities, market conditions, and local economic factors. More 
                      complex models would incorporate these additional variables.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AnimatedLinearRegressionPage; 